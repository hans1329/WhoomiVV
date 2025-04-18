import { useState, useEffect, useRef } from 'react';
import { IoClose, IoPlay, IoPause } from 'react-icons/io5';
import { useDoppleMemory, Message as MemoryMessage } from '@/lib/memory';

interface DoppleData {
  id: number;
  name: string;
  owner: string;
  level: number;
  image: string;
  likes: number;
  description: string;
  tags: string[];
  isMinted?: boolean;
}

// Use the Message type from memory.ts, but extend it to include the sender property
interface Message extends MemoryMessage {
  sender?: string;
}

interface AutoChatDialogProps {
  dopple1: DoppleData;
  dopple2: DoppleData;
  onClose: () => void;
}

export default function AutoChatDialog({ dopple1, dopple2, onClose }: AutoChatDialogProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<{ id: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Memory system for storing conversations - use the first dopple's ID
  const memory = useDoppleMemory(dopple1.id.toString());
  
  // Initialize conversation
  useEffect(() => {
    const newConversation = memory.startConversation();
    setConversation(newConversation);
    
    // Add initial system message
    const systemMessage = memory.addMessage(newConversation.id, {
      role: 'system',
      content: `자동 대화: ${dopple1.name}과(와) ${dopple2.name} 사이의 대화입니다.`
    });
    
    // Add initial greeting from dopple1
    const initialMessage = memory.addMessage(newConversation.id, {
      role: 'user',
      content: `안녕하세요, ${dopple2.name}님! 반갑습니다.`
    });

    // Store sender information separately since the memory system doesn't support it directly
    if (initialMessage) {
      const messageWithSender = { ...initialMessage, sender: dopple1.name };
      setMessages([messageWithSender]);
    }
    
    // Cleanup on unmount
    return () => {
      if (conversation) {
        memory.endConversation(conversation.id, `${dopple1.name}과(와) ${dopple2.name} 사이의 자동 대화`);
      }
    };
  }, [dopple1, dopple2, memory]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Automatic chat generation
  useEffect(() => {
    if (!isPlaying || !conversation) return;
    
    let intervalId: NodeJS.Timeout;
    let turnCount = 0;
    const maxTurns = 20; // Maximum turns for auto-chat
    
    const generateNextMessage = () => {
      if (!conversation) return;
      
      // Get last message to determine who should respond
      const lastMessage = messages[messages.length - 1];
      
      // Determine next speaker
      const isLastMessageFromDopple1 = lastMessage?.sender === dopple1.name;
      const nextSpeaker = isLastMessageFromDopple1 ? dopple2 : dopple1;
      const roleType = isLastMessageFromDopple1 ? 'dopple' : 'user';
      
      // Generate response based on previous messages
      const responsePhrases = [
        `안녕하세요! 오늘 날씨가 정말 좋네요.`,
        `그렇군요, 흥미로운 이야기네요!`,
        `저도 그렇게 생각해요. 어떤 일에 관심이 있으신가요?`,
        `최근에 재미있는 일이 있으셨나요?`,
        `저는 ${nextSpeaker.tags.join(', ')} 같은 주제에 관심이 많아요.`,
        `우리 함께 얘기하니 즐겁네요!`,
        `다음에 또 이야기 나눠요!`,
        `그것에 대해 더 자세히 알려주실 수 있나요?`,
        `정말 흥미로운 관점이네요.`,
        `저는 ${nextSpeaker.description}`,
      ];
      
      // Choose random response
      const randomIndex = Math.floor(Math.random() * responsePhrases.length);
      const content = responsePhrases[randomIndex];
      
      // Add message to conversation
      const newMessage = memory.addMessage(conversation.id, {
        role: roleType,
        content
      });
      
      // Update state with new message and include sender information
      if (newMessage) {
        const messageWithSender = { ...newMessage, sender: nextSpeaker.name };
        setMessages(prevMessages => [...prevMessages, messageWithSender]);
        
        // Increment turn count
        turnCount++;
        
        // End conversation when max turns reached
        if (turnCount >= maxTurns) {
          setIsPlaying(false);
          const systemMessage = memory.addMessage(conversation.id, {
            role: 'system',
            content: '자동 대화가 완료되었습니다.'
          });
          
          if (systemMessage) {
            setMessages(prevMessages => [...prevMessages, systemMessage]);
          }
        }
      }
    };
    
    // Start interval for message generation
    if (isPlaying) {
      // Generate first response from dopple2
      setTimeout(generateNextMessage, 1000);
      
      // Set interval for subsequent messages
      intervalId = setInterval(generateNextMessage, 3000);
    }
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isPlaying, conversation, messages, dopple1, dopple2]);
  
  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl h-[80vh] flex flex-col overflow-hidden">
        {/* Dialog header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              <img src={dopple1.image} alt={dopple1.name} className="w-10 h-10 rounded-full border-2 border-gray-700" />
              <img src={dopple2.image} alt={dopple2.name} className="w-10 h-10 rounded-full border-2 border-gray-700" />
            </div>
            <div>
              <h3 className="text-white font-bold">{dopple1.name} & {dopple2.name}</h3>
              <p className="text-xs text-gray-400">자동 대화 진행 중</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isPlaying ? 'bg-red-600/20 text-red-500' : 'bg-[#0abab5]/20 text-[#0abab5]'
              }`}
            >
              {isPlaying ? <IoPause size={16} /> : <IoPlay size={16} />}
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 text-gray-400 hover:text-white"
            >
              <IoClose size={18} />
            </button>
          </div>
        </div>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/30">
          {messages.map((message, index) => {
            if (message.role === 'system') {
              return (
                <div key={message.id || index} className="text-center py-2">
                  <span className="text-xs text-gray-500 bg-gray-800/50 rounded-full px-3 py-1">
                    {message.content}
                  </span>
                </div>
              );
            }
            
            const isDopple1 = message.sender === dopple1.name;
            const senderDopple = isDopple1 ? dopple1 : dopple2;
            
            return (
              <div key={message.id || index} className={`flex w-full ${isDopple1 ? 'justify-start' : 'justify-end'}`}>
                {isDopple1 && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden mr-2">
                    <img src={dopple1.image} alt={dopple1.name} className="h-full w-full object-cover" />
                  </div>
                )}
                
                <div 
                  className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                    isDopple1 
                      ? 'bg-blue-600/20 text-blue-200 border border-blue-500/30 rounded-tl-none' 
                      : 'bg-purple-600/20 text-purple-200 border border-purple-500/30 rounded-tr-none'
                  }`}
                >
                  <div className="text-xs opacity-75 mb-1">{senderDopple.name}</div>
                  {message.content}
                </div>
                
                {!isDopple1 && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden ml-2">
                    <img src={dopple2.image} alt={dopple2.name} className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Controls */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/70">
          <div className="text-center">
            <button
              onClick={togglePlay}
              className={`px-6 py-2 rounded-full ${
                isPlaying 
                  ? 'bg-red-600/20 text-red-500 border border-red-600/30' 
                  : 'bg-[#0abab5]/20 text-[#0abab5] border border-[#0abab5]/30'
              }`}
            >
              <div className="flex items-center space-x-2">
                {isPlaying ? (
                  <>
                    <IoPause size={16} />
                    <span>대화 중지</span>
                  </>
                ) : (
                  <>
                    <IoPlay size={16} />
                    <span>대화 시작</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 