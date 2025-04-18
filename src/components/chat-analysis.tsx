import React, { useState, useEffect } from 'react';
import { Connectome, ConnectomeNode, ConnectomeEdge } from '@/types/character';
import ConnectomeManager from '@/lib/connectome-manager';
import ConnectomeVisualization from '@/components/ConnectomeVisualization';

interface ChatAnalysisProps {
  messages: {
    id: string;
    role: 'user' | 'dopple';
    content: string;
    timestamp: number;
  }[];
  doppleId: string;
  initialConnectome?: Connectome;
  onUpdateConnectome?: (connectome: Connectome) => void;
}

const ChatAnalysis: React.FC<ChatAnalysisProps> = ({
  messages,
  doppleId,
  initialConnectome,
  onUpdateConnectome
}) => {
  const [connectome, setConnectome] = useState<Connectome>(initialConnectome || { nodes: [], edges: [] });
  const [connectomeManager, setConnectomeManager] = useState<ConnectomeManager | null>(null);
  const [processingStatus, setProcessingStatus] = useState<{
    currentMessage: number;
    total: number;
    isProcessing: boolean;
  }>({
    currentMessage: 0,
    total: messages.length,
    isProcessing: false
  });
  const [analysisResults, setAnalysisResults] = useState<{
    emotions: {name: string, count: number}[];
    topics: {name: string, count: number}[];
    traits: {name: string, count: number}[];
  }>({
    emotions: [],
    topics: [],
    traits: []
  });
  
  // Initialize connectome manager
  useEffect(() => {
    const manager = new ConnectomeManager(doppleId, initialConnectome);
    setConnectomeManager(manager);
    setConnectome(manager.getConnectome());
  }, [doppleId, initialConnectome]);
  
  // Process all messages when the component mounts
  useEffect(() => {
    processMessages();
  }, [connectomeManager, messages]);
  
  // Process messages and update connectome
  const processMessages = async () => {
    if (!connectomeManager || messages.length === 0) return;
    
    setProcessingStatus({
      currentMessage: 0,
      total: messages.length,
      isProcessing: true
    });
    
    // Process each message in sequence
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      // Update status
      setProcessingStatus({
        currentMessage: i + 1,
        total: messages.length,
        isProcessing: true
      });
      
      // Process message and update connectome
      await connectomeManager.processMessage(message.content, message.role);
      
      // Update connectome state
      setConnectome({...connectomeManager.getConnectome()});
      
      // Notify parent component of connectome update
      if (onUpdateConnectome) {
        onUpdateConnectome(connectomeManager.getConnectome());
      }
      
      // Small delay to visualize the processing
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Update the analysis results
    updateAnalysisResults();
    
    setProcessingStatus({
      currentMessage: messages.length,
      total: messages.length,
      isProcessing: false
    });
  };
  
  // Update emotion, topic, and trait analysis summaries
  const updateAnalysisResults = () => {
    if (!connectomeManager) return;
    
    // Get top entities from connectome
    const topEmotions = connectomeManager.getTopNodes('emotion');
    const topTopics = connectomeManager.getTopNodes('interest');
    const topTraits = connectomeManager.getTopNodes('trait');
    
    // Transform to the format needed for visualization
    const emotions = topEmotions.map(node => ({
      name: node.name,
      count: Math.round(node.strength)
    }));
    
    const topics = topTopics.map(node => ({
      name: node.name,
      count: Math.round(node.strength)
    }));
    
    const traits = topTraits.map(node => ({
      name: node.name,
      count: Math.round(node.strength)
    }));
    
    setAnalysisResults({
      emotions,
      topics,
      traits
    });
  };
  
  // Function to reset and reprocess all messages
  const handleReprocess = async () => {
    if (!connectomeManager) return;
    
    // Reset connectome
    connectomeManager.setConnectome({ nodes: [], edges: [] });
    setConnectome({ nodes: [], edges: [] });
    
    // Process all messages again
    await processMessages();
  };
  
  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-white">실시간 컨넥텀 분석</h2>
      
      {/* Processing status */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 text-sm">
            {processingStatus.isProcessing 
              ? `메시지 처리 중: ${processingStatus.currentMessage}/${processingStatus.total}`
              : `${processingStatus.total}개 메시지 처리 완료`
            }
          </span>
          
          <button
            onClick={handleReprocess}
            disabled={processingStatus.isProcessing}
            className={`px-3 py-1 rounded-md text-xs ${
              processingStatus.isProcessing
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            재분석
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(processingStatus.currentMessage / processingStatus.total) * 100}%` 
            }}
          />
        </div>
      </div>
      
      {/* Connectome Visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-200">컨넥텀 시각화</h3>
        <div className="h-[300px] w-full bg-gray-800 rounded-lg">
          <ConnectomeVisualization 
            connectome={connectome}
            width={800}
            height={300}
            darkMode={true}
          />
        </div>
      </div>
      
      {/* Analysis Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Emotions */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-base font-medium mb-3 text-gray-200">주요 감정</h3>
          {analysisResults.emotions.length > 0 ? (
            <ul className="space-y-2">
              {analysisResults.emotions.map((emotion, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{emotion.name}</span>
                  <div className="flex items-center">
                    <div className="bg-gray-700 w-32 h-3 rounded-full overflow-hidden mr-2">
                      <div 
                        className="bg-blue-500 h-full"
                        style={{ width: `${(emotion.count / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{emotion.count}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">감정 데이터가 없습니다.</p>
          )}
        </div>
        
        {/* Topics */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-base font-medium mb-3 text-gray-200">주요 주제</h3>
          {analysisResults.topics.length > 0 ? (
            <ul className="space-y-2">
              {analysisResults.topics.map((topic, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{topic.name}</span>
                  <div className="flex items-center">
                    <div className="bg-gray-700 w-32 h-3 rounded-full overflow-hidden mr-2">
                      <div 
                        className="bg-green-500 h-full"
                        style={{ width: `${(topic.count / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{topic.count}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">주제 데이터가 없습니다.</p>
          )}
        </div>
        
        {/* Traits */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-base font-medium mb-3 text-gray-200">성격 특성</h3>
          {analysisResults.traits.length > 0 ? (
            <ul className="space-y-2">
              {analysisResults.traits.map((trait, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{trait.name}</span>
                  <div className="flex items-center">
                    <div className="bg-gray-700 w-32 h-3 rounded-full overflow-hidden mr-2">
                      <div 
                        className="bg-purple-500 h-full"
                        style={{ width: `${(trait.count / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{trait.count}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">성격 특성 데이터가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatAnalysis; 