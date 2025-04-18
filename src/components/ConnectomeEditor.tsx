'use client';

import React, { useState, useEffect } from 'react';
import { Connectome, ConnectomeNode, ConnectomeEdge } from '@/types/character';

interface ConnectomeEditorProps {
  initialConnectome?: Connectome;
  onChange?: (connectome: Connectome) => void;
  darkMode?: boolean;
}

const NODE_TYPES = [
  { id: 'trait', name: 'Trait' },
  { id: 'interest', name: 'Interest' },
  { id: 'emotion', name: 'Emotion' },
  { id: 'value', name: 'Value' },
];

const ConnectomeEditor: React.FC<ConnectomeEditorProps> = ({ 
  initialConnectome,
  onChange,
  darkMode = false
}) => {
  const [connectome, setConnectome] = useState<Connectome>(() => {
    return initialConnectome || { nodes: [], edges: [] };
  });
  
  const [activeTab, setActiveTab] = useState<'nodes' | 'edges'>('nodes');
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState<'trait' | 'interest' | 'emotion' | 'value'>('trait');
  const [newNodeStrength, setNewNodeStrength] = useState(5);
  const [newEdgeSource, setNewEdgeSource] = useState('');
  const [newEdgeTarget, setNewEdgeTarget] = useState('');
  const [newEdgeWeight, setNewEdgeWeight] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Notify parent of changes
  useEffect(() => {
    onChange?.(connectome);
  }, [connectome, onChange]);
  
  // Add a new node
  const handleAddNode = () => {
    if (!newNodeName.trim()) return;
    
    const newNode: ConnectomeNode = {
      id: `${newNodeType}_${Date.now()}`,
      name: newNodeName.trim(),
      type: newNodeType,
      strength: newNodeStrength,
    };
    
    setConnectome(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    
    // Reset form
    setNewNodeName('');
    setNewNodeStrength(5);
  };
  
  // Delete a node and all its connected edges
  const handleDeleteNode = (nodeId: string) => {
    setConnectome(prev => ({
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      edges: prev.edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      )
    }));
  };
  
  // Add a new edge
  const handleAddEdge = () => {
    if (!newEdgeSource || !newEdgeTarget || newEdgeSource === newEdgeTarget) return;
    
    // Check if the edge already exists
    const edgeExists = connectome.edges.some(
      edge => edge.source === newEdgeSource && edge.target === newEdgeTarget
    );
    
    if (edgeExists) return;
    
    const newEdge: ConnectomeEdge = {
      source: newEdgeSource,
      target: newEdgeTarget,
      weight: newEdgeWeight,
    };
    
    setConnectome(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge]
    }));
    
    // Reset form
    setNewEdgeWeight(5);
  };
  
  // Delete an edge
  const handleDeleteEdge = (sourceId: string, targetId: string) => {
    setConnectome(prev => ({
      ...prev,
      edges: prev.edges.filter(edge => 
        !(edge.source === sourceId && edge.target === targetId)
      )
    }));
  };
  
  // Update node strength
  const handleUpdateNodeStrength = (nodeId: string, strength: number) => {
    setConnectome(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, strength } : node
      )
    }));
  };
  
  // Update edge weight
  const handleUpdateEdgeWeight = (sourceId: string, targetId: string, weight: number) => {
    setConnectome(prev => ({
      ...prev,
      edges: prev.edges.map(edge => 
        (edge.source === sourceId && edge.target === targetId) 
          ? { ...edge, weight } 
          : edge
      )
    }));
  };
  
  // Filter nodes by search term
  const filteredNodes = connectome.nodes.filter(node => 
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter edges by search term
  const filteredEdges = connectome.edges.filter(edge => {
    const sourceNode = connectome.nodes.find(node => node.id === edge.source);
    const targetNode = connectome.nodes.find(node => node.id === edge.target);
    
    return sourceNode?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           targetNode?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Get node name by ID for display
  const getNodeName = (nodeId: string) => {
    const node = connectome.nodes.find(n => n.id === nodeId);
    return node ? node.name : 'Unknown';
  };
  
  // Get node type by ID for color coding
  const getNodeType = (nodeId: string) => {
    const node = connectome.nodes.find(n => n.id === nodeId);
    return node ? node.type : 'unknown';
  };
  
  // Get color for node type
  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'trait':
        return darkMode ? 'text-orange-400 border-orange-500' : 'text-orange-600 border-orange-500';
      case 'interest':
        return darkMode ? 'text-blue-400 border-blue-500' : 'text-blue-600 border-blue-500';
      case 'emotion':
        return darkMode ? 'text-pink-400 border-pink-500' : 'text-pink-600 border-pink-500';
      case 'value':
        return darkMode ? 'text-green-400 border-green-500' : 'text-green-600 border-green-500';
      default:
        return darkMode ? 'text-purple-400 border-purple-500' : 'text-purple-600 border-purple-500';
    }
  };
  
  return (
    <div className={`border rounded-lg overflow-hidden ${darkMode ? 'bg-gray-900 text-gray-200 border-gray-700' : 'bg-white text-gray-800 border-gray-200'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className="text-xl font-bold">Connectome Editor</h2>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Create and manage personality elements and their connections
        </p>
      </div>
      
      {/* Stats */}
      <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center text-sm">
          <div className="mr-4">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Nodes:</span> {connectome.nodes.length}
          </div>
          <div className="mr-4">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Connections:</span> {connectome.edges.length}
          </div>
          <div className="flex-1"></div>
          <div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`text-sm px-3 py-1 rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-gray-200' 
                  : 'bg-white border-gray-300 placeholder-gray-400 text-gray-900'
              } border`}
            />
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          className={`flex-1 py-2 px-4 text-center ${
            activeTab === 'nodes' 
              ? darkMode 
                ? 'bg-gray-800 border-b-2 border-blue-500' 
                : 'bg-gray-50 border-b-2 border-blue-500'
              : ''
          }`}
          onClick={() => setActiveTab('nodes')}
        >
          Nodes
        </button>
        <button
          className={`flex-1 py-2 px-4 text-center ${
            activeTab === 'edges' 
              ? darkMode 
                ? 'bg-gray-800 border-b-2 border-blue-500' 
                : 'bg-gray-50 border-b-2 border-blue-500'
              : ''
          }`}
          onClick={() => setActiveTab('edges')}
        >
          Connections
        </button>
      </div>
      
      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {activeTab === 'nodes' ? (
          <div>
            {/* Add Node Form */}
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[180px]">
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={newNodeName}
                    onChange={(e) => setNewNodeName(e.target.value)}
                    placeholder="E.g., Creativity, Music, Joy"
                    className={`w-full px-3 py-2 rounded-md border ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Type
                  </label>
                  <select
                    value={newNodeType}
                    onChange={(e) => setNewNodeType(e.target.value as any)}
                    className={`px-3 py-2 rounded-md border ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {NODE_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Strength (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newNodeStrength}
                    onChange={(e) => setNewNodeStrength(parseInt(e.target.value))}
                    className={`w-20 px-3 py-2 rounded-md border ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <button
                    onClick={handleAddNode}
                    disabled={!newNodeName.trim()}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      !newNodeName.trim()
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    } ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <span className="mr-1">+</span>
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            {/* Nodes List */}
            <div className="p-4">
              {filteredNodes.length === 0 ? (
                <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchTerm 
                    ? 'No nodes match your search' 
                    : 'No nodes added yet. Add your first node above.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNodes.map(node => (
                    <div 
                      key={node.id}
                      className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} flex items-center`}
                    >
                      <div className={`rounded-full w-3 h-3 mr-3 ${
                        node.type === 'trait' ? (darkMode ? 'bg-orange-400' : 'bg-orange-500') :
                        node.type === 'interest' ? (darkMode ? 'bg-blue-400' : 'bg-blue-500') :
                        node.type === 'emotion' ? (darkMode ? 'bg-pink-400' : 'bg-pink-500') :
                        (darkMode ? 'bg-green-400' : 'bg-green-500')
                      }`}></div>
                      <div className="flex-1">
                        <div className="font-medium">{node.name}</div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} capitalize`}>
                          {node.type} • Strength: {node.strength}/10
                        </div>
                      </div>
                      <div className="ml-2 flex items-center">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={node.strength}
                          onChange={(e) => handleUpdateNodeStrength(node.id, parseInt(e.target.value))}
                          className="w-24 mr-3"
                        />
                        <button
                          onClick={() => handleDeleteNode(node.id)}
                          className={`p-1 rounded-md ${
                            darkMode 
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                              : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <span className="block w-5 h-5 flex items-center justify-center">✕</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Add Edge Form */}
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-wrap gap-2 items-end">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    From
                  </label>
                  <select
                    value={newEdgeSource}
                    onChange={(e) => setNewEdgeSource(e.target.value)}
                    className={`min-w-[140px] px-3 py-2 rounded-md border ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select node</option>
                    {connectome.nodes.map(node => (
                      <option key={node.id} value={node.id}>{node.name} ({node.type})</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center px-2">
                  <span className="w-5 h-5 block">↔</span>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    To
                  </label>
                  <select
                    value={newEdgeTarget}
                    onChange={(e) => setNewEdgeTarget(e.target.value)}
                    className={`min-w-[140px] px-3 py-2 rounded-md border ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select node</option>
                    {connectome.nodes.map(node => (
                      <option key={node.id} value={node.id}
                        disabled={node.id === newEdgeSource}
                      >
                        {node.name} ({node.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Weight (-10 to 10)
                  </label>
                  <input
                    type="number"
                    min="-10"
                    max="10"
                    value={newEdgeWeight}
                    onChange={(e) => setNewEdgeWeight(parseInt(e.target.value))}
                    className={`w-20 px-3 py-2 rounded-md border ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <button
                    onClick={handleAddEdge}
                    disabled={!newEdgeSource || !newEdgeTarget || newEdgeSource === newEdgeTarget}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      !newEdgeSource || !newEdgeTarget || newEdgeSource === newEdgeTarget
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    } ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <span className="mr-1">+</span>
                    Add
                  </button>
                </div>
              </div>
              <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Note:</span> Positive weights (1 to 10) indicate enhancement or reinforcement. 
                Negative weights (-10 to -1) indicate suppression or conflict.
              </div>
            </div>
            
            {/* Edges List */}
            <div className="p-4">
              {filteredEdges.length === 0 ? (
                <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchTerm 
                    ? 'No connections match your search' 
                    : 'No connections added yet. Add your first connection above.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEdges.map(edge => (
                    <div 
                      key={`${edge.source}-${edge.target}`}
                      className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} flex items-center`}
                    >
                      <div className="flex-1 flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getNodeTypeColor(getNodeType(edge.source))}`}>
                          {getNodeName(edge.source)}
                        </span>
                        <span className={`mx-2 ${
                          edge.weight > 0 
                            ? (darkMode ? 'text-green-400' : 'text-green-600') 
                            : edge.weight < 0 
                              ? (darkMode ? 'text-red-400' : 'text-red-600')
                              : ''
                        }`}>
                          {edge.weight > 0 
                            ? '→ enhances →' 
                            : edge.weight < 0 
                              ? '→ suppresses →'
                              : '→ neutral →'
                          }
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getNodeTypeColor(getNodeType(edge.target))}`}>
                          {getNodeName(edge.target)}
                        </span>
                      </div>
                      <div className="ml-2 flex items-center">
                        <input
                          type="range"
                          min="-10"
                          max="10"
                          value={edge.weight}
                          onChange={(e) => handleUpdateEdgeWeight(edge.source, edge.target, parseInt(e.target.value))}
                          className="w-24 mr-3"
                        />
                        <span className={`text-xs font-medium w-8 text-center ${
                          edge.weight > 0 
                            ? (darkMode ? 'text-green-400' : 'text-green-600') 
                            : edge.weight < 0 
                              ? (darkMode ? 'text-red-400' : 'text-red-600')
                              : ''
                        }`}>
                          {edge.weight > 0 ? '+' : ''}{edge.weight}
                        </span>
                        <button
                          onClick={() => handleDeleteEdge(edge.source, edge.target)}
                          className={`p-1 rounded-md ${
                            darkMode 
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                              : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <span className="block w-5 h-5 flex items-center justify-center">✕</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex justify-between items-center">
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {connectome.nodes.length} nodes, {connectome.edges.length} connections
          </div>
          <div>
            <button
              onClick={() => setConnectome({ nodes: [], edges: [] })}
              className={`px-3 py-1 text-sm rounded-md ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectomeEditor; 