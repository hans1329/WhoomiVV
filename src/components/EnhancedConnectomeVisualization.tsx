'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Connectome } from '../types/character';
import dynamic from 'next/dynamic';

// 2D 그래프만 사용
const ForceGraph2D = dynamic(
  () => import('react-force-graph').then(mod => mod.ForceGraph2D),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-pulse text-center">
          <p>Loading visualization...</p>
        </div>
      </div>
    )
  }
);

// 타입 정의
interface GraphNode {
  id: string;
  name: string;
  type: string;
  strength: number;
  color?: string;
  val?: number;
  x?: number;
  y?: number;
  description?: string;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  weight: number;
  color?: string;
  curvature?: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// 연결된 노드 찾기
function findConnectedNodes(nodeId: string, links: GraphLink[]): string[] {
  const connected: string[] = [];
  
  links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    
    if (sourceId === nodeId && !connected.includes(targetId)) {
      connected.push(targetId);
    } else if (targetId === nodeId && !connected.includes(sourceId)) {
      connected.push(sourceId);
    }
  });
  
  return connected;
}

interface EnhancedConnectomeVisualizationProps {
  connectome: Connectome;
  width?: number;
  height?: number;
  className?: string;
  darkMode?: boolean;
  showLabels?: boolean;
  highlightRelated?: boolean;
}

function EnhancedConnectomeVisualization({
  connectome,
  width = 800,
  height = 600,
  className = '',
  darkMode = false,
  showLabels = true,
  highlightRelated = true,
}: EnhancedConnectomeVisualizationProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [connectedNodes, setConnectedNodes] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const fgRef = useRef();
  
  // 클라이언트 사이드에서만 렌더링
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 노드 타입별 색상
  const NODE_COLORS: Record<string, string> = {
    trait: darkMode ? '#60a5fa' : '#3b82f6',     // blue
    interest: darkMode ? '#34d399' : '#10b981',  // green
    emotion: darkMode ? '#a78bfa' : '#8b5cf6',   // purple
    value: darkMode ? '#fbbf24' : '#f59e0b',     // amber
  };
  
  // 컨넥텀 데이터로 그래프 데이터 생성
  useEffect(() => {
    if (!connectome || !connectome.nodes || !connectome.edges) {
      return;
    }
    
    // 노드 변환
    const nodes = connectome.nodes.map(node => ({
      ...node,
      color: NODE_COLORS[node.type] || (darkMode ? '#888888' : '#cccccc'),
      val: node.strength * 1.5,
    }));
    
    // 링크 변환
    const links = connectome.edges.map(edge => ({
      ...edge,
      color: edge.weight > 0 
        ? `rgba(16, 185, 129, ${Math.min(1, Math.abs(edge.weight) / 10)})` 
        : `rgba(239, 68, 68, ${Math.min(1, Math.abs(edge.weight) / 10)})`,
      curvature: Math.min(0.3, Math.abs(edge.weight) / 30),
    }));
    
    setGraphData({ nodes, links });
  }, [connectome, darkMode, NODE_COLORS]);
  
  // 노드 라벨
  const getNodeLabel = useCallback((node: GraphNode) => {
    let label = `${node.name} (${node.type})`;
    
    if (node.strength !== undefined) {
      label += `: Strength ${node.strength}`;
    }
    
    if (node.description) {
      label += `\n${node.description}`;
    }
    
    return label;
  }, []);
  
  // 노드 색상
  const getNodeColor = useCallback((node: GraphNode) => {
    const defaultColor = node.color || (darkMode ? '#888888' : '#cccccc');
    
    if (!highlightedNode || node.id === highlightedNode) {
      return defaultColor;
    }
    
    if (connectedNodes.includes(node.id)) {
      return defaultColor;
    }
    
    return darkMode ? 'rgba(100, 100, 100, 0.3)' : 'rgba(200, 200, 200, 0.3)';
  }, [highlightedNode, connectedNodes, darkMode]);
  
  // 링크 색상
  const getLinkColor = useCallback((link: GraphLink) => {
    const defaultColor = link.color || (darkMode ? '#555555' : '#cccccc');
    
    if (!highlightedNode) {
      return defaultColor;
    }
    
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    
    if (sourceId === highlightedNode || targetId === highlightedNode) {
      return defaultColor;
    }
    
    return darkMode ? 'rgba(100, 100, 100, 0.1)' : 'rgba(200, 200, 200, 0.1)';
  }, [highlightedNode, darkMode]);
  
  // 링크 너비
  const getLinkWidth = useCallback((link: GraphLink) => {
    const baseWidth = Math.sqrt(Math.abs(typeof link.weight === 'number' ? link.weight : 1)) * 0.5;
    
    if (!highlightedNode) return baseWidth;
    
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    
    if (sourceId === highlightedNode || targetId === highlightedNode) {
      return baseWidth * 1.5;
    }
    
    return baseWidth * 0.5;
  }, [highlightedNode]);
  
  // 노드 호버
  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHighlightedNode(node ? node.id : null);
    
    if (node && highlightRelated) {
      const connected = findConnectedNodes(node.id, graphData.links);
      setConnectedNodes(connected);
    } else {
      setConnectedNodes([]);
    }
  }, [graphData.links, highlightRelated]);
  
  // 데이터 없음
  if (!connectome || !connectome.nodes || !connectome.edges) {
    return (
      <div 
        className={`flex items-center justify-center border rounded-lg ${className} ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`} 
        style={{ width, height }}
      >
        <p className={darkMode ? 'text-gray-300' : 'text-gray-500'}>No connectome data available</p>
      </div>
    );
  }
  
  // 로딩 중
  if (!isClient) {
    return (
      <div 
        className={`flex items-center justify-center border rounded-lg ${className} ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`} 
        style={{ width, height }}
      >
        <p className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Loading visualization...</p>
      </div>
    );
  }
  
  return (
    <div 
      className={`border rounded-lg overflow-hidden ${className} ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`} 
      style={{ width, height }}
    >
      <ForceGraph2D
        graphData={graphData}
        width={width}
        height={height}
        backgroundColor={darkMode ? '#111827' : '#ffffff'}
        nodeLabel={getNodeLabel}
        nodeColor={getNodeColor}
        nodeVal={(node: any) => node.val || 5}
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        onNodeHover={handleNodeHover}
        cooldownTicks={100}
      />
    </div>
  );
}

export default EnhancedConnectomeVisualization; 