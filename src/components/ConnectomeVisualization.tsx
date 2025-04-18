'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Connectome } from '@/types/character';

// Simple 2D visualization without using react-force-graph-vr or any A-Frame dependencies
interface ConnectomeVisualizationProps {
  connectome: Connectome;
  width?: number;
  height?: number;
  darkMode?: boolean;
}

const ConnectomeVisualization: React.FC<ConnectomeVisualizationProps> = ({
  connectome,
  width = 600,
  height = 400,
  darkMode = false,
}) => {
  const [loading, setLoading] = useState(true);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  // Memoized graph data
  const graphData = useMemo(() => {
    if (!connectome || !connectome.nodes) return { nodes: [], links: [] };
    
    return {
      nodes: connectome.nodes.map(node => ({
        ...node,
        id: node.id,
        name: node.name,
        val: node.strength,
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 5 + (node.strength || 1) * 1.5,
        color: getNodeColor(node)
      })),
      links: connectome.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        weight: edge.weight,
        color: getLinkColor(edge)
      })),
    };
  }, [connectome, width, height, darkMode]);

  // Color scale based on node type
  function getNodeColor(node: any) {
    switch (node.type) {
      case 'trait':
        return darkMode ? '#ff9e64' : '#ff7b00';
      case 'interest':
        return darkMode ? '#7aa2f7' : '#0066cc';
      case 'emotion':
        return darkMode ? '#f7768e' : '#e63946';
      case 'value':
        return darkMode ? '#9ece6a' : '#2a9d8f';
      default:
        return darkMode ? '#bb9af7' : '#8338ec';
    }
  }

  // Link color based on weight
  function getLinkColor(link: any) {
    const weight = link.weight || 0;
    if (weight > 0) {
      return darkMode ? 'rgba(154, 230, 106, 0.6)' : 'rgba(42, 157, 143, 0.6)';
    } else if (weight < 0) {
      return darkMode ? 'rgba(247, 118, 142, 0.6)' : 'rgba(230, 57, 70, 0.6)';
    }
    return darkMode ? 'rgba(187, 154, 247, 0.3)' : 'rgba(131, 56, 236, 0.3)';
  }

  // Render static visualization
  useEffect(() => {
    if (!canvasRef.current || graphData.nodes.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas resolution
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.fillStyle = darkMode ? '#1a1b26' : '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw links first
    graphData.links.forEach(link => {
      const sourceNode = graphData.nodes.find((n: any) => n.id === link.source);
      const targetNode = graphData.nodes.find((n: any) => n.id === link.target);
      
      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.strokeStyle = link.color;
        ctx.lineWidth = Math.abs(link.weight || 1) * 0.5;
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();
      }
    });
    
    // Draw nodes
    graphData.nodes.forEach((node: any) => {
      ctx.beginPath();
      ctx.fillStyle = node.color;
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add node labels
      ctx.fillStyle = darkMode ? '#ffffff' : '#000000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, node.x, node.y + node.radius + 10);
    });
    
    setLoading(false);
  }, [graphData, width, height, darkMode]);

  // If no data or loading
  if (!connectome || !connectome.nodes.length) {
    return <div className="p-4 text-center text-gray-500">No connectome data available</div>;
  }

  if (loading) {
    return (
      <div className={`border rounded-lg p-4 text-center ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-500'}`} style={{ width, height }}>
        Loading visualization...
      </div>
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      <canvas 
        ref={canvasRef} 
        style={{ width, height }}
        className="w-full h-full"
      />
      <div className="p-2 text-xs text-center text-gray-500">
        Note: This is a simplified visualization. For interactive features, please wait for our upgraded version.
      </div>
    </div>
  );
};

export default ConnectomeVisualization; 