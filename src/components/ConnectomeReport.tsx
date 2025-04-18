'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Connectome, ConnectomeNode, ConnectomeEdge } from '@/types/character';

interface ConnectomeReportProps {
  connectome: Connectome;
  darkMode?: boolean;
}

interface NodeStat {
  id: string;
  name: string;
  type: string;
  strength: number;
  connections: number;
  influence: number; // Sum of outgoing edge weights
  receptivity: number; // Sum of incoming edge weights
}

interface ConnectomeAnalysis {
  nodeCount: number;
  edgeCount: number;
  typeCounts: Record<string, number>;
  dominantType: string;
  mostInfluentialNodes: NodeStat[];
  mostReceptiveNodes: NodeStat[];
  highestStrengthNodes: NodeStat[];
  strengthDistribution: Record<string, number[]>;
  edgeWeightDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  clusters: {
    name: string;
    nodes: string[];
    description: string;
  }[];
  density: number;
}

const ConnectomeReport: React.FC<ConnectomeReportProps> = ({ connectome, darkMode = false }) => {
  const [analysis, setAnalysis] = useState<ConnectomeAnalysis | null>(null);

  // Analyze the connectome data
  useEffect(() => {
    if (!connectome || !connectome.nodes.length) {
      setAnalysis(null);
      return;
    }

    // Build a map of nodes by ID for easier reference
    const nodesById = new Map<string, ConnectomeNode>();
    connectome.nodes.forEach(node => {
      nodesById.set(node.id, node);
    });

    // Calculate node statistics
    const nodeStats: NodeStat[] = connectome.nodes.map(node => {
      const outgoingEdges = connectome.edges.filter(edge => edge.source === node.id);
      const incomingEdges = connectome.edges.filter(edge => edge.target === node.id);
      
      const influence = outgoingEdges.reduce((sum, edge) => sum + edge.weight, 0);
      const receptivity = incomingEdges.reduce((sum, edge) => sum + edge.weight, 0);
      
      return {
        id: node.id,
        name: node.name,
        type: node.type,
        strength: node.strength,
        connections: outgoingEdges.length + incomingEdges.length,
        influence,
        receptivity
      };
    });

    // Count nodes by type
    const typeCounts: Record<string, number> = {};
    connectome.nodes.forEach(node => {
      typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;
    });

    // Calculate strength distribution by type
    const strengthDistribution: Record<string, number[]> = {};
    connectome.nodes.forEach(node => {
      if (!strengthDistribution[node.type]) {
        strengthDistribution[node.type] = [];
      }
      strengthDistribution[node.type].push(node.strength);
    });

    // Count edge weight types
    const edgeWeightDistribution = {
      positive: connectome.edges.filter(edge => edge.weight > 0).length,
      negative: connectome.edges.filter(edge => edge.weight < 0).length,
      neutral: connectome.edges.filter(edge => edge.weight === 0).length,
    };

    // Find dominant type
    let dominantType = '';
    let maxCount = 0;
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantType = type;
      }
    });

    // Simple clustering algorithm
    // This is a basic implementation - for a real app, you might want a more sophisticated algorithm
    const clusters = [];
    
    // Group traits with strong positive connections
    const traitClusters = groupRelatedNodes(connectome, 'trait', 5);
    clusters.push(...traitClusters);
    
    // Group interests with strong positive connections
    const interestClusters = groupRelatedNodes(connectome, 'interest', 5);
    clusters.push(...interestClusters);

    // Find trait-interest clusters
    const traitInterestClusters = findCrossClusters(connectome, 'trait', 'interest', 7);
    clusters.push(...traitInterestClusters);

    // Calculate network density (ratio of actual connections to possible connections)
    const n = connectome.nodes.length;
    const maxPossibleEdges = n * (n - 1); // Directed graph
    const density = connectome.edges.length / maxPossibleEdges;

    setAnalysis({
      nodeCount: connectome.nodes.length,
      edgeCount: connectome.edges.length,
      typeCounts,
      dominantType,
      mostInfluentialNodes: [...nodeStats].sort((a, b) => b.influence - a.influence).slice(0, 5),
      mostReceptiveNodes: [...nodeStats].sort((a, b) => b.receptivity - a.receptivity).slice(0, 5),
      highestStrengthNodes: [...nodeStats].sort((a, b) => b.strength - a.strength).slice(0, 5),
      strengthDistribution,
      edgeWeightDistribution,
      clusters,
      density
    });
  }, [connectome]);

  // Function to group related nodes (basic clustering)
  const groupRelatedNodes = (connectome: Connectome, nodeType: string, minWeight = 3) => {
    const clusters: { name: string; nodes: string[]; description: string }[] = [];
    const processedNodes = new Set<string>();
    
    // Get all nodes of the specified type
    const typeNodes = connectome.nodes.filter(node => node.type === nodeType);
    
    for (const startNode of typeNodes) {
      if (processedNodes.has(startNode.id)) continue;
      
      const clusterNodes: string[] = [startNode.id];
      processedNodes.add(startNode.id);
      
      // Find strongly connected nodes
      for (const edge of connectome.edges) {
        if (
          (edge.source === startNode.id || edge.target === startNode.id) && 
          edge.weight >= minWeight
        ) {
          const otherNodeId = edge.source === startNode.id ? edge.target : edge.source;
          const otherNode = connectome.nodes.find(n => n.id === otherNodeId);
          
          if (otherNode && otherNode.type === nodeType && !processedNodes.has(otherNodeId)) {
            clusterNodes.push(otherNodeId);
            processedNodes.add(otherNodeId);
          }
        }
      }
      
      // Only create clusters with more than one node
      if (clusterNodes.length > 1) {
        const nodeNames = clusterNodes.map(id => {
          const node = connectome.nodes.find(n => n.id === id);
          return node?.name || id;
        });
        
        clusters.push({
          name: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Group: ${nodeNames[0]} & others`,
          nodes: clusterNodes,
          description: `A group of related ${nodeType}s including: ${nodeNames.join(', ')}`
        });
      }
    }
    
    return clusters;
  };
  
  // Function to find cross-type clusters
  const findCrossClusters = (connectome: Connectome, type1: string, type2: string, minWeight = 5) => {
    const clusters: { name: string; nodes: string[]; description: string }[] = [];
    
    // Get nodes of each type
    const type1Nodes = connectome.nodes.filter(node => node.type === type1);
    const type2Nodes = connectome.nodes.filter(node => node.type === type2);
    
    for (const node1 of type1Nodes) {
      const relatedNodes: string[] = [node1.id];
      
      // Find strongly connected nodes of the second type
      for (const edge of connectome.edges) {
        if (
          (edge.source === node1.id || edge.target === node1.id) && 
          edge.weight >= minWeight
        ) {
          const otherNodeId = edge.source === node1.id ? edge.target : edge.source;
          const otherNode = connectome.nodes.find(n => n.id === otherNodeId);
          
          if (otherNode && otherNode.type === type2) {
            relatedNodes.push(otherNodeId);
          }
        }
      }
      
      // Only create clusters with more than one node type
      if (relatedNodes.length > 1) {
        const nodeNames = relatedNodes.map(id => {
          const node = connectome.nodes.find(n => n.id === id);
          return node?.name || id;
        });
        
        clusters.push({
          name: `${type1}-${type2} Association: ${node1.name}`,
          nodes: relatedNodes,
          description: `Strong connection between ${type1} "${node1.name}" and ${type2}s: ${nodeNames.slice(1).join(', ')}`
        });
      }
    }
    
    return clusters;
  };

  // Generate insights text based on analysis
  const insights = useMemo(() => {
    if (!analysis) return [];

    const insights = [];
    
    // Personality summary
    insights.push({
      title: 'Personality Summary',
      text: `This connectome consists of ${analysis.nodeCount} personality elements connected by ${analysis.edgeCount} relationships. The dominant type is ${analysis.dominantType} (${analysis.typeCounts[analysis.dominantType] || 0} elements).`
    });

    // Core strength insight
    if (analysis.highestStrengthNodes.length > 0) {
      const topNode = analysis.highestStrengthNodes[0];
      insights.push({
        title: 'Core Strengths',
        text: `The most prominent characteristic is "${topNode.name}" (${topNode.type}) with a strength of ${topNode.strength}/10. Other strong elements include ${analysis.highestStrengthNodes.slice(1, 3).map(n => `"${n.name}"`).join(' and ')}.`
      });
    }

    // Influence insight
    if (analysis.mostInfluentialNodes.length > 0) {
      const influential = analysis.mostInfluentialNodes[0];
      insights.push({
        title: 'Key Influences',
        text: `"${influential.name}" has the most influence on other elements, affecting ${influential.connections} other characteristics with a total influence score of ${influential.influence.toFixed(1)}.`
      });
    }

    // Cluster insight
    if (analysis.clusters.length > 0) {
      insights.push({
        title: 'Personality Patterns',
        text: `Detected ${analysis.clusters.length} distinct patterns or clusters in the personality structure. The most significant is "${analysis.clusters[0].name}".`
      });
    }

    // Balance insight
    const balanceRatio = analysis.edgeWeightDistribution.positive / 
      (analysis.edgeWeightDistribution.negative || 1);
    
    let balanceText = 'The personality structure shows a balanced mix of enhancing and suppressing influences.';
    if (balanceRatio > 3) {
      balanceText = 'The personality has significantly more enhancing than suppressing connections, suggesting an amplified character.';
    } else if (balanceRatio < 0.5) {
      balanceText = 'The personality has more suppressing than enhancing connections, indicating a more controlled or reserved character.';
    }
    
    insights.push({
      title: 'Character Balance',
      text: balanceText
    });

    // Density insight
    let densityText = 'The connectome has moderate connectivity density.';
    if (analysis.density > 0.25) {
      densityText = 'The personality has high connectivity, suggesting a complex and nuanced character.';
    } else if (analysis.density < 0.1) {
      densityText = 'The personality has low connectivity, suggesting a more straightforward character with fewer interdependencies.';
    }
    
    insights.push({
      title: 'Complexity',
      text: densityText
    });
    
    return insights;
  }, [analysis]);

  if (!connectome || !connectome.nodes.length) {
    return <div className="p-4 text-center text-gray-500">No connectome data available for analysis</div>;
  }

  if (!analysis) {
    return <div className="p-4 text-center">Analyzing connectome data...</div>;
  }

  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}>
      <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        Connectome Analysis
      </h2>
      
      {/* Stats Overview */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="text-sm opacity-75">Nodes</div>
          <div className="text-lg font-bold">{analysis.nodeCount}</div>
        </div>
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="text-sm opacity-75">Connections</div>
          <div className="text-lg font-bold">{analysis.edgeCount}</div>
        </div>
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="text-sm opacity-75">Dominant Type</div>
          <div className="text-lg font-bold capitalize">{analysis.dominantType}</div>
        </div>
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="text-sm opacity-75">Complexity</div>
          <div className="text-lg font-bold">{(analysis.density * 100).toFixed(1)}%</div>
        </div>
      </div>
      
      {/* Insights */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Key Insights
        </h3>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h4 className="font-medium mb-1">{insight.title}</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{insight.text}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Top Nodes */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Most Influential Elements
        </h3>
        <div className={`overflow-x-auto ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <table className="min-w-full">
            <thead>
              <tr className={`text-left ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Strength</th>
                <th className="px-3 py-2">Connections</th>
                <th className="px-3 py-2">Influence</th>
              </tr>
            </thead>
            <tbody>
              {analysis.mostInfluentialNodes.map((node, index) => (
                <tr 
                  key={node.id}
                  className={`${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} border-b`}
                >
                  <td className="px-3 py-2 font-medium">{node.name}</td>
                  <td className="px-3 py-2 capitalize">{node.type}</td>
                  <td className="px-3 py-2">{node.strength}/10</td>
                  <td className="px-3 py-2">{node.connections}</td>
                  <td className="px-3 py-2">{node.influence.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Clusters */}
      {analysis.clusters.length > 0 && (
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Detected Patterns
          </h3>
          <div className="space-y-2">
            {analysis.clusters.map((cluster, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
              >
                <h4 className="font-medium">{cluster.name}</h4>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {cluster.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Distribution */}
      <div>
        <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Connection Types
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <div className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Enhancing</div>
            <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
              {analysis.edgeWeightDistribution.positive}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
            <div className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-800'}`}>Suppressing</div>
            <div className={`text-lg font-bold ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
              {analysis.edgeWeightDistribution.negative}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
            <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Neutral</div>
            <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              {analysis.edgeWeightDistribution.neutral}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectomeReport; 