'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
// Import emoji picker
import dynamic from 'next/dynamic';
import { IoSendSharp, IoHappyOutline, IoImageOutline, IoCloseCircle } from 'react-icons/io5';
import { 
  supabase, 
  getDoppleWithCache, 
  Dopple, 
  ChatMessage as SupabaseChatMessage,
  Conversation as SupabaseConversation,
  startConversation,
  addMessage,
  endConversation,
  getConversationMessages
} from '@/lib/supabase';
import ChatService, { ChatMessage as ServiceChatMessage } from '@/lib/chat-service';
import ChatAnalysis from '@/components/chat-analysis';
import { Connectome } from '@/types/character';

// Load emoji picker dynamically (client-side only)
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

// Chat limit constants
const DEFAULT_DAILY_LIMIT = 10; // Default daily free message limit
const DEFAULT_DAILY_TOKENS = 10; // Default daily free tokens
const TOKEN_PER_MESSAGE = 1; // Tokens consumed per message

// Daily message limit management hook
const useDailyMessageLimit = (userId: string) => {
  const [messageCount, setMessageCount] = useState(0);
  const [isLimited, setIsLimited] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(DEFAULT_DAILY_LIMIT);
  
  // Load message count
  useEffect(() => {
    if (!userId) return;
    
    const loadMessageCount = () => {
      try {
        // Get message count info from local storage
        const countData = localStorage.getItem(`chat_count_${userId}`);
        
        if (countData) {
          const data = JSON.parse(countData);
          const today = new Date().toISOString().split('T')[0];
          
          // Check if date is today
          if (data.date === today) {
            setMessageCount(data.count);
            setIsLimited(data.count >= (data.limit || DEFAULT_DAILY_LIMIT));
          } else {
            // Reset count if date is different
            resetCount();
          }
          
          // Get admin limit settings
          setDailyLimit(data.limit || DEFAULT_DAILY_LIMIT);
        }
      } catch (error) {
        console.error('Error loading message count:', error);
        resetCount();
      }
    };
    
    loadMessageCount();
    
    // Reset count at GMT 00:00
    const checkResetTime = () => {
      const now = new Date();
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      
      // Reset if just after GMT 00:00
      if (utcHours === 0 && utcMinutes < 5) {
        resetCount();
      }
    };
    
    // Check reset time every hour
    const intervalId = setInterval(checkResetTime, 3600000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [userId]);
  
  // Message count increment
  const incrementCount = () => {
    const newCount = messageCount + 1;
    const today = new Date().toISOString().split('T')[0];
    
    // Save to local storage
    localStorage.setItem(`chat_count_${userId}`, JSON.stringify({
      count: newCount,
      date: today,
      limit: dailyLimit
    }));
    
    setMessageCount(newCount);
    setIsLimited(newCount >= dailyLimit);
    
    return newCount;
  };
  
  // Message count reset
  const resetCount = () => {
    const today = new Date().toISOString().split('T')[0];
    
    localStorage.setItem(`chat_count_${userId}`, JSON.stringify({
      count: 0,
      date: today,
      limit: dailyLimit
    }));
    
    setMessageCount(0);
    setIsLimited(false);
  };
  
  return { messageCount, isLimited, dailyLimit, incrementCount, resetCount };
};

// Token management hook
const useTokenBalance = (userId: string) => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isTokenLimited, setIsTokenLimited] = useState(false);
  const [showTokenAlert, setShowTokenAlert] = useState(false);
  const [tokenAlertMessage, setTokenAlertMessage] = useState('');
  const [adminTokenAmount, setAdminTokenAmount] = useState(DEFAULT_DAILY_TOKENS);

  // Get admin token amount settings
  const getAdminTokenAmount = () => {
    try {
      const adminSettings = localStorage.getItem('admin_token_settings');
      if (adminSettings) {
        const settings = JSON.parse(adminSettings);
        // 명확하게 dailyTokens 값을 확인하고 유효성 검사
        if (settings && typeof settings.dailyTokens === 'number' && settings.dailyTokens >= 0) {
          console.log('Using admin token settings:', settings.dailyTokens);
          return settings.dailyTokens;
        }
      }
    } catch (error) {
      console.error('Error parsing admin token settings:', error);
    }
    
    // 설정이 없거나 유효하지 않을 경우 기본값 사용
    console.log('Using default daily tokens:', DEFAULT_DAILY_TOKENS);
    return DEFAULT_DAILY_TOKENS;
  };

  // Load token balance
  useEffect(() => {
    if (!userId) return;

    const loadTokenBalance = () => {
      try {
        // Get admin token amount settings
        const adminAmount = getAdminTokenAmount();
        setAdminTokenAmount(adminAmount);
        
        // Get token balance info from local storage
        const tokenData = localStorage.getItem(`token_balance_${userId}`);
        const lastTokenRefillDate = localStorage.getItem(`token_refill_date_${userId}`);
        const today = new Date().toISOString().split('T')[0];
        
        let currentBalance = 0;
        
        if (tokenData) {
          currentBalance = JSON.parse(tokenData);
          setTokenBalance(currentBalance);
          setIsTokenLimited(currentBalance < TOKEN_PER_MESSAGE);
          
          // 마지막 충전일이 오늘이 아니면 최신 관리자 설정으로 충전
          if (lastTokenRefillDate !== today) {
            currentBalance = adminAmount;
            setTokenBalance(currentBalance);
            setIsTokenLimited(false);
            localStorage.setItem(`token_balance_${userId}`, JSON.stringify(currentBalance));
            localStorage.setItem(`token_refill_date_${userId}`, today);
          }
        } else {
          // Set initial token balance (for first user)
          currentBalance = adminAmount; 
          setTokenBalance(currentBalance);
          setIsTokenLimited(false);
          localStorage.setItem(`token_balance_${userId}`, JSON.stringify(currentBalance));
          localStorage.setItem(`token_refill_date_${userId}`, today);
        }
        
        // Check token refill at GMT 00:00
        checkTokenRefill();
      } catch (error) {
        console.error('Error loading token balance:', error);
        setTokenBalance(0);
        setIsTokenLimited(true);
      }
    };
    
    loadTokenBalance();
    
    // Set interval to check token refill at GMT 00:00
    const intervalId = setInterval(checkTokenRefill, 60000); // Check every minute
    
    return () => {
      clearInterval(intervalId);
    };
  }, [userId]);

  // Check token refill at GMT 00:00
  const checkTokenRefill = () => {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const today = now.toISOString().split('T')[0];
    
    // Check if just after GMT 00:00 (00:00 ~ 00:05)
    if (utcHours === 0 && utcMinutes < 5) {
      const lastRefillDate = localStorage.getItem(`token_refill_date_${userId}`);
      
      // Check if today already refilled
      if (lastRefillDate !== today) {
        // 토큰이 0이 아니더라도 매일 새로 충전함
        // Get admin token amount settings
        const adminAmount = getAdminTokenAmount();
        
        // Refill tokens
        setTokenBalance(adminAmount);
        setIsTokenLimited(false);
        localStorage.setItem(`token_balance_${userId}`, JSON.stringify(adminAmount));
        localStorage.setItem(`token_refill_date_${userId}`, today);
        
        // Show token refill alert
        setTokenAlertMessage(`토큰이 ${adminAmount}개로 충전되었습니다!`);
        setShowTokenAlert(true);
        
        setTimeout(() => {
          setShowTokenAlert(false);
        }, 5000);
      }
    }
  };

  // Consume tokens
  const consumeTokens = (amount: number = TOKEN_PER_MESSAGE) => {
    if (tokenBalance < amount) {
      setIsTokenLimited(true);
      
      // Show token depleted alert
      setTokenAlertMessage('Tokens have been depleted. New tokens will be refilled at GMT 00:00.');
      setShowTokenAlert(true);
      
      setTimeout(() => {
        setShowTokenAlert(false);
      }, 5000);
      
      return false;
    }

    const newBalance = tokenBalance - amount;
    setTokenBalance(newBalance);
    setIsTokenLimited(newBalance < TOKEN_PER_MESSAGE);
    
    // Save to local storage
    localStorage.setItem(`token_balance_${userId}`, JSON.stringify(newBalance));
    
    return true;
  };

  return { 
    tokenBalance, 
    isTokenLimited, 
    consumeTokens,
    showTokenAlert,
    tokenAlertMessage,
    adminTokenAmount
  };
};

// Chat message interface
interface ChatMessage {
  id: string;
  role: 'user' | 'dopple' | 'system';  // system role added
  content: string;
  timestamp: number;
  imageUrl?: string;
}

// Chat message component
const ChatMessageItem = ({ message, doppleName, doppleImage }: { 
  message: ChatMessage, 
  doppleName: string, 
  doppleImage: string 
}) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden mr-2">
          <img 
            src={doppleImage} 
            alt={doppleName} 
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/600x400/0abab5/ffffff?text=AI+Dopple";
            }}
          />
        </div>
      )}
      
      <div 
        className={`max-w-[70%] rounded-2xl px-3 py-2 text-xs ${
          isUser 
            ? 'bg-[#0abab5] text-white rounded-tr-none' 
            : 'bg-gray-800 text-white rounded-tl-none border border-[#0abab5]/40'
        }`}
      >
        {message.content}
        {message.imageUrl && (
          <div className="mt-2">
            <img 
              src={message.imageUrl} 
              alt="Shared" 
              className="max-w-full rounded-lg"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/400x300/0abab5/ffffff?text=Image+Error";
              }}
            />
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden ml-2 bg-gray-700 flex items-center justify-center">
          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [dopple, setDopple] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [showDoppleInfo, setShowDoppleInfo] = useState(false);
  const [chatService, setChatService] = useState<ChatService | null>(null);
  const [showConnectome, setShowConnectome] = useState<boolean>(false);
  const [connectome, setConnectome] = useState<Connectome>({ nodes: [], edges: [] });
  const [activeConversation, setActiveConversation] = useState<SupabaseConversation | null>(null);
  
  // Custom hook usage
  const userId = user?.id || '';
  const { messageCount, isLimited, dailyLimit, incrementCount } = useDailyMessageLimit(userId);
  const { tokenBalance, isTokenLimited, consumeTokens, showTokenAlert, tokenAlertMessage, adminTokenAmount } = useTokenBalance(userId);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Component mount and authentication check
  useEffect(() => {
    setMounted(true);
    
    // Redirect if not logged in
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/');
    }
    
    // Load dopple data
    if (mounted && isAuthenticated && user) {
      const fetchDoppleData = async () => {
        try {
          // Get dopple data from Supabase (cache priority)
          const doppleData = await getDoppleWithCache(params.id);
          
          if (!doppleData) {
            console.error(`Dopple with ID ${params.id} not found`);
            router.push('/chat');
            return;
          }
          
          // Adjust dopple data structure (if needed)
          const doppleInfo = {
            id: doppleData.id,
            name: doppleData.name || 'Unnamed Dopple',
            image_url: doppleData.image_url,
            description: doppleData.description,
            level: doppleData.level || 1,
            traits: doppleData.traits || [],
            interests: doppleData.interests || [],
            mbti: doppleData.mbti,
            likes: doppleData.likes || 0,
            createdAt: doppleData.created_at,
            nodeCount: doppleData.node_count || 8,
            memoryStrength: doppleData.memory_strength || 'B+',
            lastMemoryUpdate: doppleData.last_memory_update || 'Recently',
            conversationCount: doppleData.conversation_count || 0,
            popularity: doppleData.popularity || 62,
            xp: doppleData.xp || 0,
            badges: doppleData.badges || 3
          };
          
          setDopple(doppleInfo);
          
          // Start conversation or load previous conversation
          await initializeConversation(doppleInfo.id);
        } catch (error) {
          console.error('Error loading dopple:', error);
          router.push('/chat');
        }
      };
      
      fetchDoppleData();
    }
  }, [isAuthenticated, isLoading, mounted, params.id, router, user]);
  
  // Message scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Emoji selection processing
  const handleEmojiClick = (emojiData: any) => {
    setInputMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };
  
  // Image upload processing
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size must be 5MB or smaller.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Image cancel
  const handleCancelImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Initialize conversation function
  const initializeConversation = async (doppleId: string | number) => {
    if (!user?.id) return;

    try {
      // Get last conversation ID from local storage
      const lastConversationId = localStorage.getItem(`last_conversation_${user.id}_${doppleId}`);
      let currentConversation: SupabaseConversation | null = null;
      let chatMessages: ChatMessage[] = [];
      
      if (lastConversationId) {
        // Try to get previous conversation messages
        const messages = await getConversationMessages(lastConversationId);
        
        if (messages && messages.length > 0) {
          chatMessages = messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            imageUrl: msg.image_url
          }));
          
          // Set conversation information
          currentConversation = {
            id: lastConversationId,
            user_id: user.id,
            dopple_id: doppleId,
            start_time: messages[0].timestamp,
            message_count: messages.length,
            metadata: {}
          };
        }
      }
      
      // Start new conversation if no previous conversation or failed to load
      if (!currentConversation) {
        currentConversation = await startConversation(user.id, doppleId);
        
        if (currentConversation) {
          // Add initial greeting message (casual form)
          const welcomeMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'dopple',
            content: `Hi! I'm ${dopple.name}. What can I help you with?`,
            timestamp: Date.now()
          };
          
          // Save message to Supabase
          await addMessage(user.id, currentConversation.id, {
            role: 'dopple',
            content: welcomeMessage.content,
            dopple_id: doppleId
          });
          
          chatMessages = [welcomeMessage];
          
          // Save current conversation ID to local storage
          localStorage.setItem(`last_conversation_${user.id}_${doppleId}`, currentConversation.id);
        }
      }
      
      setActiveConversation(currentConversation);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error initializing conversation:', error);
      
      // Try to save conversation history to local storage
      const chatHistoryKey = `chat_history_${params.id}`;
      const savedChat = localStorage.getItem(chatHistoryKey);
      
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
      } else {
        // Add initial greeting message (casual form)
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'dopple',
          content: `Hi! I'm ${dopple.name}. What can I help you with?`,
          timestamp: Date.now()
        };
        setMessages([welcomeMessage]);
        localStorage.setItem(chatHistoryKey, JSON.stringify([welcomeMessage]));
      }
    }
  };
  
  // Dopple automatic response generation function
  const generateDoppleResponse = async (userMessage: string) => {
    setIsGenerating(true);
    
    if (!user?.id || !activeConversation) {
      console.error('Cannot generate response: user or conversation not available');
      setIsGenerating(false);
      return;
    }
    
    // Show loading message during response generation
    const loadingId = Date.now().toString() + '_loading';
    const loadingMessage: ChatMessage = {
      id: loadingId,
      role: 'dopple',
      content: '...',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    
    try {
      let response = '';
      
      // Use chat service if available, otherwise fall back to simple responses
      if (chatService) {
        const userMsg: ServiceChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: userMessage,
          timestamp: Date.now()
        };
        
        // Generate response through the chat service
        const doppleResponse = await chatService.generateResponse(userMsg);
        response = doppleResponse.content;
        
        // Update connectome state
        setConnectome(chatService.getConnectome());
      } else {
        // In reality, an API call is needed, but for now, a simple local response generation
        // Respond to user message in casual form
        const responsePhrases = [
          `Hi! ${dopple.name}. How can I help you?`,
          `My name is ${dopple.name}. How's your day?`,
          'What happened today? Tell me about it.',
          'Nice to hear that! Tell me more!',
          'Interesting story! Tell me more!',
          'How\'s the weather today?',
          'Can I help you more?',
          'What hobbies do you have?',
          'What\'s your favorite food?',
          'Have you watched any good movies or dramas recently?'
        ];
        
        // Decide response based on user message (casual form)
        if (userMessage.includes('hi') || userMessage.includes('hello')) {
          response = `Hi! I'm ${dopple.name}. Nice to meet you!`;
        } 
        else if (userMessage.includes('name') && userMessage.includes('what')) {
          response = `I'm ${dopple.name}. You're my AI Dopple!`;
        }
        else if (userMessage.includes('hobby') || userMessage.includes('like')) {
          response = `I like talking to you the most. What's your hobby?`;
        }
        else if (userMessage.includes('weather')) {
          response = `I can't access real-time weather information, but I hope you have a nice day.`;
        }
        else if (userMessage.includes('thank') || userMessage.includes('thanks')) {
          response = "You're welcome! Feel free to ask me anytime.";
        }
        else {
          // Random default response
          const randomIndex = Math.floor(Math.random() * responsePhrases.length);
          response = responsePhrases[randomIndex];
        }
      }
      
      // Add slight delay (for actual response generation feel)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Remove loading message and add actual response
      const doppleMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'dopple',
        content: response,
        timestamp: Date.now()
      };
      
      setMessages(prev => prev.filter(msg => msg.id !== loadingId).concat(doppleMessage));
      
      // Save message to Supabase
      await addMessage(user.id, activeConversation.id, {
        role: 'dopple',
        content: response,
        dopple_id: dopple.id
      });
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Replace with error message (casual form)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'dopple',
        content: 'Sorry, an error occurred while generating a response. Would you like to try again?',
        timestamp: Date.now()
      };
      
      setMessages(prev => prev.filter(msg => msg.id !== loadingId).concat(errorMessage));
      
      // Save error message to Supabase
      if (user?.id && activeConversation) {
        await addMessage(user.id, activeConversation.id, {
          role: 'dopple',
          content: errorMessage.content,
          dopple_id: dopple.id
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Message send processing
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!inputMessage.trim() && !image) || isGenerating) return;
    
    // Check message limit
    if (isLimited && !consumeTokens()) {
      alert(`Daily message limit (${dailyLimit} messages) reached. Please try again tomorrow or purchase tokens.`);
      return;
    }
    
    // Check token limit
    if (isTokenLimited) {
      alert(`Not enough tokens. Please purchase additional tokens.`);
      return;
    }
    
    // Consume tokens
    consumeTokens();
    
    // Increment counter
    incrementCount();
    
    if (!user?.id || !activeConversation) {
      console.error('Cannot send message: user or conversation not available');
      return;
    }
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim() || 'Image sent.',
      timestamp: Date.now(),
      imageUrl: image || undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Save message to Supabase
    await addMessage(user.id, activeConversation.id, {
      role: 'user',
      content: userMessage.content,
      dopple_id: dopple.id,
      image_url: userMessage.imageUrl
    });
    
    // Generate dopple response
    await generateDoppleResponse(userMessage.content);
  };

  // Dopple info toggle
  const toggleDoppleInfo = () => {
    setShowDoppleInfo(!showDoppleInfo);
  };

  // Add this useEffect after the useEffect that loads dopple data
  useEffect(() => {
    if (dopple && user) {
      // Initialize chat service with dopple data
      const service = new ChatService({
        id: dopple.id,
        name: dopple.name,
        description: dopple.description,
        image_url: dopple.image_url,
        level: dopple.level,
        traits: dopple.traits,
        interests: dopple.interests,
        mbti: dopple.mbti,
        connectome: dopple.connectome
      });
      
      // Set message history to build the connectome
      service.setMessageHistory(messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        imageUrl: msg.imageUrl
      })));
      
      setChatService(service);
      setConnectome(service.getConnectome());
    }
  }, [dopple, messages, user]);

  // Add a toggle function for connectome display
  const toggleConnectomeView = () => {
    setShowConnectome(!showConnectome);
  };

  // Component unmount processing
  useEffect(() => {
    return () => {
      // End conversation
      if (activeConversation && user?.id) {
        endConversation(activeConversation.id);
      }
    };
  }, [activeConversation, user]);

  if (!mounted || isLoading || !isAuthenticated || !dopple) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0abab5]/30 via-slate-900 to-black text-white flex flex-col">
      {/* Notification message */}
      {showTokenAlert && (
        <div className="fixed top-16 left-0 right-0 mx-auto max-w-md z-50 bg-blue-500/90 text-white py-2 px-4 rounded-lg text-center shadow-lg animate-fade-in-out text-xs">
          {tokenAlertMessage}
        </div>
      )}
      
      <header className="fixed top-0 left-0 right-0 bg-black/70 backdrop-blur-md border-b border-[#0abab5]/20 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-white text-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
            
            <div className="flex items-center">
              <button 
                onClick={toggleDoppleInfo}
                className="flex items-center group"
              >
                <img 
                  src={dopple.image_url || dopple.image} 
                  alt={dopple.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#0abab5]/50 mr-2 group-hover:border-[#0abab5] transition-all"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/600x400/0abab5/ffffff?text=AI+Dopple";
                  }}
                />
                <div className="flex flex-col items-start">
                  <div className="text-sm font-medium">
                    {dopple.name}
                  </div>
                  <div className="text-xs text-[#0abab5]">
                    Lv.{dopple.level || 1}
                  </div>
                </div>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-xs px-2 py-1 bg-[#0abab5]/20 rounded-full">
                <span className="text-[#0abab5]">{tokenBalance} tokens</span>
              </div>
              <button
                onClick={toggleConnectomeView}
                className={`text-xs px-2 py-1 rounded-full ${
                  showConnectome 
                    ? 'bg-purple-500/40 text-purple-200' 
                    : 'bg-gray-800/40 text-gray-400 hover:bg-gray-800/60'
                }`}
              >
                {showConnectome ? 'Return to chat' : 'Connectome View'}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Dopple detailed information card */}
      {showDoppleInfo && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={toggleDoppleInfo}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div 
            className="bg-gray-900 border border-[#0abab5]/30 max-w-md w-full relative z-50 rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative">
              {/* Pattern background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-[#0abab5]/20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {[...Array(8)].map((_, i) => (
                      <path key={i} 
                        d={`M${10 + i * 10},${20 + i * 5} Q${30 + i * 5},${40 + i * 10} ${50 + i * 5},${20 + i * 5} T${90 + i * 2},${50 + i * 3}`} 
                        stroke="rgba(255,255,255,0.3)" 
                        fill="none" 
                        strokeWidth="0.5"
                      />
                    ))}
                  </svg>
                </div>
              </div>
              
              {/* Top title area */}
              <div className="px-6 pt-4 pb-20 relative">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <span className="bg-[#0abab5]/80 h-6 w-1.5 rounded-full mr-2"></span>
                    <h3 className="text-lg font-bold">Dopple Profile</h3>
                  </div>
                  <button
                    onClick={toggleDoppleInfo}
                    className="text-gray-400 hover:text-white bg-gray-800/50 rounded-full p-1.5 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Profile image */}
              <div className="absolute left-1/2 transform -translate-x-1/2 top-16">
                <div className="relative">
                  {/* Remove glow effect */}
                  <div className="w-28 h-28 rounded-full overflow-hidden relative z-10">
                    <img 
                      src={dopple.image_url || dopple.image} 
                      alt={dopple.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400/0abab5/ffffff?text=AI+Dopple";
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1 z-20">
                    <div className="bg-[#0abab5] text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                      <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                      </svg>
                      Lv.{dopple.level || 1}
                    </div>
                  </div>
                  {/* Add name */}
                  <div className="text-center mt-3">
                    <h2 className="text-lg font-bold text-white">{dopple.name}</h2>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile content */}
            <div className="px-6 pt-14 pb-6">
              {/* Name and basic information - remove name and keep tags and creation information */}
              <div className="text-center mt-12 mb-6">
                {/* Tags */}
                <div className="flex justify-center items-center gap-2 text-xs mb-2 flex-wrap">
                  {dopple.mbti && <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">{dopple.mbti}</span>}
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">LV.{dopple.level || 1} Dopple</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300">Popularity {dopple.likes || 0}</span>
                </div>
                
                {/* Owner and creation information */}
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                  <span>{dopple.createdAt ? new Date(dopple.createdAt).toLocaleDateString() : 'Recently Created'}</span>
                </div>
              </div>
              
              {/* Dopple summary */}
              <div className="bg-black/30 p-4 rounded-lg mb-4 border border-gray-800">
                <h3 className="text-sm font-semibold text-[#0abab5] mb-2">Dopple Introduction</h3>
                <p className="text-sm text-gray-300">
                  {dopple.description || 'No description available for this Dopple.'}
                </p>
              </div>

              {/* Personality and Interests grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Personality traits */}
                <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-400 mb-2 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Personality Traits
                  </h3>
                  <div className="flex flex-wrap gap-1 overflow-y-auto max-h-20">
                    {dopple.traits && dopple.traits.length > 0 ? 
                      dopple.traits.map((trait: string, index: number) => (
                        <span key={index} className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-300 rounded">
                          {trait}
                        </span>
                      )) : 
                      <span className="text-xs text-gray-500">No trait information available</span>
                    }
                  </div>
                </div>
                
                {/* Interests */}
                <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-400 mb-2 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-1 overflow-y-auto max-h-20">
                    {dopple.interests && dopple.interests.length > 0 ? 
                      dopple.interests.map((interest: string, index: number) => (
                        <span key={index} className="text-xs px-1.5 py-0.5 bg-green-500/10 text-green-300 rounded">
                          {interest}
                        </span>
                      )) : 
                      <span className="text-xs text-gray-500">No interest information available</span>
                    }
                  </div>
                </div>
              </div>
              
              {/* Connectome preview */}
              <div className="bg-gray-900/70 p-4 rounded-lg border border-purple-900/30 mb-4">
                <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 17.5C4.5 18.8807 5.61929 20 7 20H17C18.3807 20 19.5 18.8807 19.5 17.5C19.5 16.1193 18.3807 15 17 15H16.5V12.5C16.5 11.3954 15.6046 10.5 14.5 10.5C14.5 9.39543 13.6046 8.5 12.5 8.5H12V7C12 5.89543 11.1046 5 10 5C8.89543 5 8 5.89543 8 7V12.5H7C5.61929 12.5 4.5 13.6193 4.5 15V17.5Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5V3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 7.5L17 6.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 7.5L7 6.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.5 15H16.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Connectome Preview
                </h3>
                
                {/* Graph preview (visual element) */}
                <div className="h-24 w-full bg-black/40 rounded-lg mb-2 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    {/* Graph node simulation */}
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {[...Array(6)].map((_, i) => (
                        <g key={i}>
                          <circle cx={20 + i * 12} cy={50 - i * 5 + (i % 2) * 10} r={3 + (i % 3)} fill={`rgba(${10 + i * 40}, ${150 + i * 20}, ${200 - i * 20}, 0.6)`} />
                          <line 
                            x1={20 + i * 12} 
                            y1={50 - i * 5 + (i % 2) * 10} 
                            x2={20 + (i+1) * 12} 
                            y2={50 - (i+1) * 5 + ((i+1) % 2) * 10} 
                            stroke="rgba(128, 90, 213, 0.3)" 
                            strokeWidth="1" 
                          />
                        </g>
                      ))}
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-xs text-purple-300">
                      {dopple.nodeCount || 8} memory nodes
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Core Memory Strength: {dopple.memoryStrength || 'B+'}</span>
                  <span>{dopple.lastMemoryUpdate || 'Recently'} Updated</span>
                </div>
              </div>
              
              {/* Statistics information */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-black/20 p-2 rounded-lg text-center">
                  <p className="text-[10px] text-gray-500">Conversation</p>
                  <p className="text-sm font-bold">{dopple.conversationCount || messages.length || 0}</p>
                </div>
                <div className="bg-black/20 p-2 rounded-lg text-center">
                  <p className="text-[10px] text-gray-500">Popularity</p>
                  <p className="text-sm font-bold text-pink-400">{dopple.popularity || 62}%</p>
                </div>
                <div className="bg-black/20 p-2 rounded-lg text-center">
                  <p className="text-[10px] text-gray-500">Experience</p>
                  <p className="text-sm font-bold text-[#0abab5]">{dopple.xp || 0}</p>
                </div>
                <div className="bg-black/20 p-2 rounded-lg text-center">
                  <p className="text-[10px] text-gray-500">Badges</p>
                  <p className="text-sm font-bold text-yellow-400">{dopple.badges || 3}</p>
                </div>
              </div>
              
              {/* Button area */}
              <div className="flex gap-2">
                <a 
                  href={`/chat/${dopple.id}`}
                  className="flex-1 py-2 bg-[#0abab5]/20 border border-[#0abab5]/40 hover:bg-[#0abab5]/30 text-[#0abab5] text-center rounded-lg block text-xs transition-colors"
                >
                  <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Start Chat
                </a>
                <a 
                  href={`/connectome/${dopple.id}`}
                  className="flex-1 py-2 bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 text-purple-300 text-center rounded-lg block text-xs transition-colors"
                >
                  <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 17.5C4.5 18.8807 5.61929 20 7 20H17C18.3807 20 19.5 18.8807 19.5 17.5C19.5 16.1193 18.3807 15 17 15H16.5V12.5C16.5 11.3954 15.6046 10.5 14.5 10.5C14.5 9.39543 13.6046 8.5 12.5 8.5H12V7C12 5.89543 11.1046 5 10 5C8.89543 5 8 5.89543 8 7V12.5H7C5.61929 12.5 4.5 13.6193 4.5 15V17.5Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5V3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 7.5L17 6.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 7.5L7 6.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.5 15H16.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Connectome View
                </a>
                <button 
                  className="flex-none h-auto aspect-square p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className="flex-grow flex flex-col pt-14 pb-24">
        {!showConnectome ? (
          /* Chat message area */
          <div className="flex-grow overflow-y-auto px-2 sm:px-4 py-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div className="container mx-auto max-w-4xl">
              <div className="flex flex-col">
                {messages.map((message) => (
                  <ChatMessageItem 
                    key={message.id} 
                    message={message} 
                    doppleName={dopple.name} 
                    doppleImage={dopple.image_url || dopple.image} 
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        ) : (
          /* Connectome analysis area */
          <div className="flex-grow overflow-y-auto px-2 sm:px-4 py-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div className="container mx-auto max-w-4xl">
              <ChatAnalysis 
                messages={messages.filter(msg => msg.role !== 'system').map(msg => ({
                  id: msg.id,
                  role: msg.role as 'user' | 'dopple',
                  content: msg.content,
                  timestamp: msg.timestamp
                }))}
                doppleId={params.id}
                initialConnectome={connectome}
                onUpdateConnectome={(updatedConnectome) => setConnectome(updatedConnectome)}
              />
            </div>
          </div>
        )}
            
        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 sm:right-8 z-10">
            <div className="relative">
              <button 
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-300"
                onClick={() => setShowEmojiPicker(false)}
              >
                <IoCloseCircle size={16} />
              </button>
              <EmojiPicker onEmojiClick={handleEmojiClick} width={280} height={320} />
            </div>
          </div>
        )}
            
        {/* Message input area */}
        <div className="fixed bottom-0 left-0 right-0 px-2 sm:px-4 py-2 bg-black/80 border-t border-[#0abab5]/20 z-20">
          <div className="container mx-auto max-w-4xl">
            {/* Image preview */}
            {image && (
              <div className="relative mb-2 p-2 bg-black/30 rounded-lg">
                <button 
                  onClick={handleCancelImage}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
                >
                  <IoCloseCircle size={14} />
                </button>
                <img 
                  src={image} 
                  alt="Preview" 
                  className="h-24 rounded-lg object-contain mx-auto"
                />
              </div>
            )}
            
            {/* Message input form */}
            <form onSubmit={handleSendMessage} className="relative">
              <div className="flex items-center gap-2">
                <div className="flex-grow relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={isLimited || isTokenLimited ? "Message limit reached" : "Enter message..."}
                    className={`w-full bg-black/50 border text-xs ${
                      isLimited || isTokenLimited 
                        ? 'border-red-500/50 text-gray-500' 
                        : 'border-[#0abab5]/30'
                    } rounded-full py-2 pl-4 pr-20 text-white focus:outline-none focus:border-[#0abab5]`}
                    disabled={isGenerating || isLimited || isTokenLimited}
                  />
                  
                  {/* Emoji and image buttons */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/40"
                      disabled={isGenerating || isLimited || isTokenLimited}
                    >
                      <IoHappyOutline size={16} />
                    </button>
                    
                    <label className="cursor-pointer text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/40">
                      <IoImageOutline size={16} />
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isGenerating || isLimited || isTokenLimited}
                      />
                    </label>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className={`bg-[#0abab5] hover:bg-[#0abab5]/80 rounded-full p-2 ${
                    isGenerating || isLimited || isTokenLimited || (!inputMessage.trim() && !image)
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer'
                  }`}
                  disabled={isGenerating || isLimited || isTokenLimited || (!inputMessage.trim() && !image)}
                >
                  <IoSendSharp className="w-4 h-4 text-white" />
                </button>
              </div>
              
              {/* Limit indication */}
              {(isLimited || isTokenLimited) && (
                <div className="mt-1 text-center">
                  <span className="text-[10px] text-red-400">
                    {isTokenLimited 
                      ? 'Not enough tokens. Purchase tokens.' 
                      : `Daily message limit (${dailyLimit} messages) reached.`
                    }
                  </span>
                  <Link 
                    href="/token-shop" 
                    className="ml-1 text-[10px] text-[#0abab5] hover:underline"
                  >
                    Purchase Tokens
                  </Link>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}