// 메모리 시스템 - 도플의 기억을 관리
// 단기 기억 및 장기 기억을 관리하고 로컬 스토리지에 저장

import { useAuth } from './auth-context';

// 메모리 항목 타입
export interface MemoryItem {
  id: string;          // 고유 ID
  content: string;     // 기억 내용
  category: string;    // 카테고리 (e.g. 'personality', 'family', 'work', 'preference')
  importance: number;  // 중요도 (1-10)
  timestamp: number;   // 생성 시간
  lastAccessed: number;// 마지막 접근 시간
  accessCount: number; // 접근 횟수
  keywords: string[];  // 키워드 (검색용)
}

// 대화 맥락 타입
export interface Conversation {
  id: string;
  doppleId: string;
  messages: Message[];
  startTime: number;
  endTime?: number;
  summary?: string;    // 대화 요약
}

// 메시지 타입
export interface Message {
  id: string;
  role: 'user' | 'dopple' | 'system';
  content: string;
  timestamp: number;
  isMemoryCreated?: boolean;  // 이 메시지로부터 생성된 기억이 있는지
}

// 인메모리 벡터 DB를 모방하는 클래스
class MemorySystem {
  private shortTermMemory: Map<string, MemoryItem[]> = new Map();
  private longTermMemory: Map<string, MemoryItem[]> = new Map();
  private conversations: Map<string, Conversation[]> = new Map();
  
  constructor() {
    this.loadFromStorage();
  }

  // 스토리지에서 로드
  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const shortTermData = localStorage.getItem('dopple_short_term_memory');
      const longTermData = localStorage.getItem('dopple_long_term_memory');
      const conversationsData = localStorage.getItem('dopple_conversations');
      
      if (shortTermData) {
        const parsed = JSON.parse(shortTermData);
        Object.keys(parsed).forEach(userId => {
          this.shortTermMemory.set(userId, parsed[userId]);
        });
      }
      
      if (longTermData) {
        const parsed = JSON.parse(longTermData);
        Object.keys(parsed).forEach(userId => {
          this.longTermMemory.set(userId, parsed[userId]);
        });
      }
      
      if (conversationsData) {
        const parsed = JSON.parse(conversationsData);
        Object.keys(parsed).forEach(userId => {
          this.conversations.set(userId, parsed[userId]);
        });
      }
    } catch (error) {
      console.error('Error loading memory from storage:', error);
    }
  }
  
  // 스토리지에 저장
  private saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      // Map을 객체로 변환
      const shortTermObj: Record<string, MemoryItem[]> = {};
      this.shortTermMemory.forEach((items, userId) => {
        shortTermObj[userId] = items;
      });
      
      const longTermObj: Record<string, MemoryItem[]> = {};
      this.longTermMemory.forEach((items, userId) => {
        longTermObj[userId] = items;
      });
      
      const conversationsObj: Record<string, Conversation[]> = {};
      this.conversations.forEach((items, userId) => {
        conversationsObj[userId] = items;
      });
      
      localStorage.setItem('dopple_short_term_memory', JSON.stringify(shortTermObj));
      localStorage.setItem('dopple_long_term_memory', JSON.stringify(longTermObj));
      localStorage.setItem('dopple_conversations', JSON.stringify(conversationsObj));
    } catch (error) {
      console.error('Error saving memory to storage:', error);
    }
  }
  
  // 단기 기억 추가
  addShortTermMemory(userId: string, memory: Omit<MemoryItem, 'id' | 'timestamp' | 'lastAccessed' | 'accessCount'>) {
    const memoryList = this.shortTermMemory.get(userId) || [];
    
    const newMemory: MemoryItem = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1,
      ...memory
    };
    
    memoryList.push(newMemory);
    
    // 오래된 항목 정리 (임의로 최대 50개 제한)
    if (memoryList.length > 50) {
      memoryList.sort((a, b) => {
        // 중요도와 접근 빈도를 고려하여 점수 계산
        const scoreA = a.importance * 2 + a.accessCount;
        const scoreB = b.importance * 2 + b.accessCount;
        return scoreB - scoreA; // 내림차순
      });
      
      // 상위 50개만 유지
      const topMemories = memoryList.slice(0, 50);
      
      // 하위 항목 중 중요도 7 이상인 항목은 장기 기억으로 이동
      const toMove = memoryList.slice(50).filter(item => item.importance >= 7);
      toMove.forEach(item => this.moveToLongTermMemory(userId, item.id));
      
      this.shortTermMemory.set(userId, topMemories);
    } else {
      this.shortTermMemory.set(userId, memoryList);
    }
    
    this.saveToStorage();
    return newMemory;
  }
  
  // 단기 기억을 장기 기억으로 이동
  moveToLongTermMemory(userId: string, memoryId: string) {
    const shortTermList = this.shortTermMemory.get(userId) || [];
    const memoryIndex = shortTermList.findIndex(m => m.id === memoryId);
    
    if (memoryIndex === -1) return false;
    
    const memory = shortTermList[memoryIndex];
    
    // 시간이 지나면서 기억이 정제되고 중요한 부분만 남음을 시뮬레이션
    const refinedMemory: MemoryItem = {
      ...memory,
      content: memory.content.trim(), // 정제된 내용
      lastAccessed: Date.now()
    };
    
    // 장기 기억에 추가
    const longTermList = this.longTermMemory.get(userId) || [];
    longTermList.push(refinedMemory);
    this.longTermMemory.set(userId, longTermList);
    
    // 단기 기억에서 제거
    shortTermList.splice(memoryIndex, 1);
    this.shortTermMemory.set(userId, shortTermList);
    
    this.saveToStorage();
    return true;
  }
  
  // 관련 기억 검색 (벡터 유사성 검색 모방)
  searchMemories(userId: string, query: string, options: {
    shortTerm?: boolean;
    longTerm?: boolean;
    categories?: string[];
    limit?: number;
  } = {}) {
    const { 
      shortTerm = true, 
      longTerm = true, 
      categories = [], 
      limit = 10 
    } = options;
    
    const results: MemoryItem[] = [];
    
    const queryKeywords = this.extractKeywords(query);
    
    // 단기 기억 검색
    if (shortTerm) {
      const shortTermList = this.shortTermMemory.get(userId) || [];
      results.push(...this.filterMemoriesByRelevance(shortTermList, queryKeywords, categories));
    }
    
    // 장기 기억 검색
    if (longTerm) {
      const longTermList = this.longTermMemory.get(userId) || [];
      results.push(...this.filterMemoriesByRelevance(longTermList, queryKeywords, categories));
    }
    
    // 접근 횟수 업데이트
    results.forEach(memory => {
      memory.accessCount += 1;
      memory.lastAccessed = Date.now();
    });
    
    this.saveToStorage();
    
    // 중요도와 관련성에 따라 정렬하고 제한
    return results
      .sort((a, b) => this.calculateRelevance(b, queryKeywords) - this.calculateRelevance(a, queryKeywords))
      .slice(0, limit);
  }
  
  // 단순 키워드 추출 (실제로는 더 복잡한 NLP 필요)
  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '') // 특수문자 제거
      .split(/\s+/)            // 공백으로 분리
      .filter(word => word.length > 2 && !['and', 'the', 'for', 'with'].includes(word)); // 불용어 제거
  }
  
  // 관련성에 따른 메모리 필터링
  private filterMemoriesByRelevance(memories: MemoryItem[], queryKeywords: string[], categories: string[]): MemoryItem[] {
    return memories.filter(memory => {
      // 카테고리 필터
      if (categories.length > 0 && !categories.includes(memory.category)) {
        return false;
      }
      
      // 키워드 매칭
      const relevance = this.calculateRelevance(memory, queryKeywords);
      return relevance > 0;
    });
  }
  
  // 관련성 점수 계산 (벡터 유사도 모방)
  private calculateRelevance(memory: MemoryItem, queryKeywords: string[]): number {
    if (queryKeywords.length === 0) return 0;
    
    // 메모리 컨텐츠의 키워드
    const memoryKeywords = [...memory.keywords, ...this.extractKeywords(memory.content)];
    
    // 매칭되는 키워드 수 계산
    let matches = 0;
    for (const queryWord of queryKeywords) {
      if (memoryKeywords.some(memWord => memWord.includes(queryWord) || queryWord.includes(memWord))) {
        matches++;
      }
    }
    
    // 관련성 점수 = 매칭 비율 * 중요도
    const matchRatio = matches / queryKeywords.length;
    const score = matchRatio * memory.importance;
    
    return score;
  }
  
  // 대화 기록 추가
  addConversation(userId: string, doppleId: string): Conversation {
    const conversationList = this.conversations.get(userId) || [];
    
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      doppleId,
      messages: [],
      startTime: Date.now()
    };
    
    conversationList.push(newConversation);
    this.conversations.set(userId, conversationList);
    this.saveToStorage();
    
    return newConversation;
  }
  
  // 메시지 추가
  addMessage(userId: string, conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) {
    const conversationList = this.conversations.get(userId) || [];
    const conversationIndex = conversationList.findIndex(c => c.id === conversationId);
    
    if (conversationIndex === -1) return null;
    
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      ...message
    };
    
    conversationList[conversationIndex].messages.push(newMessage);
    this.conversations.set(userId, conversationList);
    this.saveToStorage();
    
    return newMessage;
  }
  
  // 대화 종료
  endConversation(userId: string, conversationId: string, summary?: string) {
    const conversationList = this.conversations.get(userId) || [];
    const conversationIndex = conversationList.findIndex(c => c.id === conversationId);
    
    if (conversationIndex === -1) return false;
    
    conversationList[conversationIndex].endTime = Date.now();
    if (summary) {
      conversationList[conversationIndex].summary = summary;
    }
    
    this.conversations.set(userId, conversationList);
    this.saveToStorage();
    
    return true;
  }
  
  // 사용자의 대화 목록 가져오기
  getUserConversations(userId: string) {
    return this.conversations.get(userId) || [];
  }
  
  // 대화 내용 가져오기
  getConversation(userId: string, conversationId: string) {
    const conversationList = this.conversations.get(userId) || [];
    return conversationList.find(c => c.id === conversationId);
  }
  
  // 대화에서 메모리 생성
  generateMemoriesFromConversation(userId: string, conversationId: string) {
    const conversation = this.getConversation(userId, conversationId);
    if (!conversation) return [];
    
    const newMemories: MemoryItem[] = [];
    const userMessages = conversation.messages.filter(m => m.role === 'user');
    
    // 간단한 정보 추출 패턴 (실제로는 더 복잡한 NLP 필요)
    const patterns = [
      { 
        regex: /(?:나는|제 이름은|저는)\s+([가-힣a-zA-Z]+)입니다|이에요|예요|이야/i, 
        category: 'identity', 
        formatter: (matches: RegExpMatchArray) => `사용자의 이름은 ${matches[1]}입니다.`,
        importance: 8
      },
      { 
        regex: /(?:나는|제|내)\s+직업(?:은|이)\s+([가-힣a-zA-Z\s]+)입니다|이에요|예요|이야/i, 
        category: 'work', 
        formatter: (matches: RegExpMatchArray) => `사용자의 직업은 ${matches[1]}입니다.`,
        importance: 7 
      },
      { 
        regex: /(?:나는|제가|내가)\s+좋아하는\s+([가-힣a-zA-Z\s]+)(?:은|는|이|가)\s+([가-힣a-zA-Z\s]+)/i, 
        category: 'preference', 
        formatter: (matches: RegExpMatchArray) => `사용자가 좋아하는 ${matches[1]}는 ${matches[2]}입니다.`,
        importance: 6
      },
      { 
        regex: /(?:나는|저는|내가)\s+([가-힣a-zA-Z\s]+)을|를\s+싫어해|싫어합니다|싫어요/i, 
        category: 'preference', 
        formatter: (matches: RegExpMatchArray) => `사용자는 ${matches[1]}을(를) 싫어합니다.`,
        importance: 6
      },
      { 
        regex: /(?:나|저|내|제)\s+가족(?:은|이|들은|들이)\s+([가-힣a-zA-Z0-9\s]+)/i, 
        category: 'family', 
        formatter: (matches: RegExpMatchArray) => `사용자의 가족에 대한 정보: ${matches[1]}`,
        importance: 7
      },
      { 
        regex: /(?:나는|저는|내가)\s+([가-힣a-zA-Z\s]+)에\s+살아|살아요|삽니다|살고 있어|살고 있어요|살고 있습니다/i, 
        category: 'location', 
        formatter: (matches: RegExpMatchArray) => `사용자는 ${matches[1]}에 살고 있습니다.`,
        importance: 7
      }
    ];
    
    // 각 메시지 분석
    userMessages.forEach(message => {
      if (message.isMemoryCreated) return; // 이미 처리됨
      
      patterns.forEach(pattern => {
        const matches = message.content.match(pattern.regex);
        if (matches) {
          const memoryContent = pattern.formatter(matches);
          
          // 단기 기억 추가
          const newMemory = this.addShortTermMemory(userId, {
            content: memoryContent,
            category: pattern.category,
            importance: pattern.importance,
            keywords: this.extractKeywords(memoryContent)
          });
          
          newMemories.push(newMemory);
          
          // 메시지에 플래그 설정
          message.isMemoryCreated = true;
        }
      });
    });
    
    this.saveToStorage();
    return newMemories;
  }
}

// 싱글톤 인스턴스
export const memorySystem = new MemorySystem();

// 도플 메모리 훅 (실제 사용시)
export function useDoppleMemory(doppleId?: string) {
  // 사용자 ID 가져오기
  const { user } = useAuth();
  const userId = typeof user === 'string' ? user : (user?.id || 'anonymous');
  
  // If doppleId is not provided, use a default value
  const actualDoppleId = doppleId || 'default';
  
  return {
    // 기억 관련 기능
    addMemory: (memory: Omit<MemoryItem, 'id' | 'timestamp' | 'lastAccessed' | 'accessCount'>) => 
      memorySystem.addShortTermMemory(userId, memory),
    
    searchMemories: (query: string, options?: Parameters<typeof memorySystem.searchMemories>[2]) => 
      memorySystem.searchMemories(userId, query, options),
    
    moveToLongTerm: (memoryId: string) => 
      memorySystem.moveToLongTermMemory(userId, memoryId),
    
    // 대화 관련 기능
    startConversation: () => 
      memorySystem.addConversation(userId, actualDoppleId),
    
    addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => 
      memorySystem.addMessage(userId, conversationId, message),
    
    endConversation: (conversationId: string, summary?: string) => 
      memorySystem.endConversation(userId, conversationId, summary),
    
    getConversations: () => 
      memorySystem.getUserConversations(userId),
    
    getConversation: (conversationId: string) => 
      memorySystem.getConversation(userId, conversationId),
    
    generateMemories: (conversationId: string) => 
      memorySystem.generateMemoriesFromConversation(userId, conversationId)
  };
} 