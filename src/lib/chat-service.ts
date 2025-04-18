import { Connectome, ConnectomeNode } from '@/types/character';
import ConnectomeManager from './connectome-manager';
import OpenAIService from './openai-service';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Interface for chat message
export interface ChatMessage {
  id: string;
  role: 'user' | 'dopple' | 'system';
  content: string;
  timestamp: number;
  imageUrl?: string;
}

// Interface for dopple data
export interface DoppleData {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  level?: number;
  traits?: string[];
  interests?: string[];
  mbti?: string;
  connectome?: Connectome;
}

// 대화 상대 타입 정의
export type ConversationPartner = 'user' | 'dopple';

// 대화 단계 정의
export enum ConversationStage {
  INITIAL = 'initial',           // 초기 대화 단계
  EXPLORING = 'exploring',       // 기본 정보 탐색 단계
  DEEPENING = 'deepening',       // 심층 정보 탐색 단계
  RELATIONSHIP = 'relationship', // 관계 형성 단계
  CASUAL = 'casual'              // 일상 대화 단계
}

// 정보 수집 우선순위 타입
export enum InformationPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// 정보 카테고리 정의
export enum InformationCategory {
  TRAITS = 'traits',
  INTERESTS = 'interests',
  VALUES = 'values',
  EMOTIONS = 'emotions',
  PREFERENCES = 'preferences',
  BACKGROUND = 'background'
}

// 수집할 정보 아이템 인터페이스
export interface InformationItem {
  category: InformationCategory;
  name: string;
  collected: boolean;
  priority: InformationPriority;
  lastAsked?: number;      // 마지막으로 질문한 시간
  askCount: number;        // 질문 시도 횟수
}

// 대화 상태 인터페이스
export interface ConversationState {
  stage: ConversationStage;
  messageCount: number;
  lastSpecialQuestionTime?: number;
  questionInterval: number;        // 특별 질문 간격 (메시지 수)
  informationToCollect: InformationItem[];
  lastTopics: string[];            // 최근 대화 주제
  recentEmotions: string[];        // 최근 감정 상태
  userInterest: Record<string, number>; // 사용자 관심도 (주제별)
}

// 추가: 대화 압축 및 요약 관련 설정
export interface ContextCompressionOptions {
  maxContextSize: number;       // 최대 컨텍스트 크기 (토큰 수)
  recentMessagesCount: number;  // 항상 유지할 최근 메시지 수
  summaryInterval: number;      // 요약 실행 주기 (메시지 수)
  compressionRatio: number;     // 압축 비율 (0-1, 1에 가까울수록 더 많은 정보 유지)
}

/**
 * Service for handling chat interactions with dopples
 */
export class ChatService {
  private connectomeManager: ConnectomeManager;
  private messageHistory: ChatMessage[] = [];
  private dopple: DoppleData;
  private conversationPartner: ConversationPartner = 'user'; // 기본값은 사용자와 대화
  private conversationState: ConversationState;
  private specialQuestionProbability: number = 0.3; // 특별 질문 확률 (0-1)
  private openaiService: OpenAIService | null = null;
  
  // 추가: 컨텍스트 압축 관련 상태
  private compressedContext: string = '';
  private lastSummaryIndex: number = 0;
  private contextCompressionOptions: ContextCompressionOptions = {
    maxContextSize: 4000,       // 기본 최대 4000 토큰
    recentMessagesCount: 4,     // 항상 최근 4개 메시지 유지
    summaryInterval: 10,        // 10개 메시지마다 요약 실행
    compressionRatio: 0.7       // 70%의 정보 유지
  };
  
  constructor(
    dopple: DoppleData, 
    conversationPartner: ConversationPartner = 'user',
    compressionOptions?: Partial<ContextCompressionOptions>,
    openaiApiKey?: string
  ) {
    this.dopple = dopple;
    this.conversationPartner = conversationPartner;
    this.connectomeManager = new ConnectomeManager(
      dopple.id, 
      dopple.connectome || { nodes: [], edges: [] }
    );
    
    // 대화 상태 초기화
    this.conversationState = this.initializeConversationState();
    
    // 압축 옵션 병합
    if (compressionOptions) {
      this.contextCompressionOptions = {
        ...this.contextCompressionOptions,
        ...compressionOptions
      };
    }
    
    // OpenAI 서비스 초기화 (API 키가 제공된 경우)
    if (openaiApiKey || process.env.OPENAI_API_KEY) {
      this.openaiService = new OpenAIService(openaiApiKey);
    }
  }
  
  /**
   * 대화 상태 초기화
   */
  private initializeConversationState(): ConversationState {
    // 기본 수집 정보 정의
    const baseInformationToCollect: InformationItem[] = [
      // 성격 특성 관련 정보
      { category: InformationCategory.TRAITS, name: '성격', collected: false, priority: InformationPriority.HIGH, askCount: 0 },
      { category: InformationCategory.TRAITS, name: 'MBTI', collected: false, priority: InformationPriority.MEDIUM, askCount: 0 },
      
      // 관심사 관련 정보
      { category: InformationCategory.INTERESTS, name: '취미', collected: false, priority: InformationPriority.HIGH, askCount: 0 },
      { category: InformationCategory.INTERESTS, name: '여가활동', collected: false, priority: InformationPriority.MEDIUM, askCount: 0 },
      { category: InformationCategory.INTERESTS, name: '좋아하는 음악', collected: false, priority: InformationPriority.MEDIUM, askCount: 0 },
      
      // 가치관 관련 정보
      { category: InformationCategory.VALUES, name: '중요한 가치', collected: false, priority: InformationPriority.HIGH, askCount: 0 },
      { category: InformationCategory.VALUES, name: '꿈/목표', collected: false, priority: InformationPriority.MEDIUM, askCount: 0 },
      
      // 감정 관련 정보
      { category: InformationCategory.EMOTIONS, name: '감정 표현 방식', collected: false, priority: InformationPriority.MEDIUM, askCount: 0 },
      
      // 선호 관련 정보
      { category: InformationCategory.PREFERENCES, name: '좋아하는 음식', collected: false, priority: InformationPriority.LOW, askCount: 0 },
      { category: InformationCategory.PREFERENCES, name: '좋아하는 여행지', collected: false, priority: InformationPriority.LOW, askCount: 0 },
      
      // 배경 관련 정보
      { category: InformationCategory.BACKGROUND, name: '직업/학업', collected: false, priority: InformationPriority.MEDIUM, askCount: 0 }
    ];
    
    // 사용자의 도플이 이미 가지고 있는 정보는 수집된 것으로 표시
    const informationToCollect = baseInformationToCollect.map(item => {
      // 도플이 이미 traits를 가지고 있으면 성격 정보는 수집된 것으로 표시
      if (item.category === InformationCategory.TRAITS && 
          (this.dopple.traits && this.dopple.traits.length > 0)) {
        return { ...item, collected: true };
      }
      
      // 도플이 이미 interests를 가지고 있으면 취미 정보는 수집된 것으로 표시
      if (item.category === InformationCategory.INTERESTS && 
          (this.dopple.interests && this.dopple.interests.length > 0)) {
        return { ...item, collected: true };
      }
      
      // 도플이 이미 MBTI를 가지고 있으면 MBTI 정보는 수집된 것으로 표시
      if (item.name === 'MBTI' && this.dopple.mbti) {
        return { ...item, collected: true };
      }
      
      return item;
    });
    
    return {
      stage: ConversationStage.INITIAL,
      messageCount: 0,
      questionInterval: 3, // 기본적으로 3개 메시지마다 특별 질문
      informationToCollect,
      lastTopics: [],
      recentEmotions: [],
      userInterest: {}
    };
  }
  
  /**
   * 대화 상대 설정
   */
  setConversationPartner(partner: ConversationPartner): void {
    this.conversationPartner = partner;
  }
  
  /**
   * Set message history
   */
  setMessageHistory(messages: ChatMessage[]): void {
    this.messageHistory = [...messages];
    
    // Process all previous messages to build the connectome
    this.initializeConnectome();
    
    // Update conversation state based on message history
    this.updateConversationStateFromHistory();
    
    // 추가: 메시지 수가 많으면 초기 요약 실행
    if (messages.length > this.contextCompressionOptions.summaryInterval) {
      this.compressAndSummarizeContext();
    }
  }
  
  /**
   * 메시지 히스토리를 기반으로 대화 상태 업데이트
   */
  private updateConversationStateFromHistory(): void {
    // 메시지 수에 따라 대화 단계 결정
    const userMessages = this.messageHistory.filter(msg => msg.role === 'user');
    this.conversationState.messageCount = userMessages.length;
    
    // 메시지 수에 따라 대화 단계 설정
    if (userMessages.length > 20) {
      this.conversationState.stage = ConversationStage.RELATIONSHIP;
    } else if (userMessages.length > 10) {
      this.conversationState.stage = ConversationStage.DEEPENING;
    } else if (userMessages.length > 3) {
      this.conversationState.stage = ConversationStage.EXPLORING;
    }
    
    // 메시지 내용을 분석하여 정보 수집 상태 업데이트
    this.analyzeMessageHistoryForInformation();
  }
  
  /**
   * 메시지 히스토리를 분석하여 정보 수집 상태 업데이트
   */
  private analyzeMessageHistoryForInformation(): void {
    // 대화 내용에서 각 정보 카테고리별 키워드 확인
    const allMessages = this.messageHistory.map(msg => msg.content.toLowerCase());
    
    // 성격 관련 정보 확인
    if (allMessages.some(msg => 
      msg.includes('성격') || 
      msg.includes('특성') || 
      msg.includes('personality') ||
      msg.includes('character')
    )) {
      this.markInformationAsCollected('성격');
    }
    
    // MBTI 관련 정보 확인
    if (allMessages.some(msg => 
      msg.includes('mbti') || 
      msg.includes('엠비티아이') || 
      msg.includes('성격 유형')
    )) {
      this.markInformationAsCollected('MBTI');
    }
    
    // 취미 관련 정보 확인
    if (allMessages.some(msg => 
      msg.includes('취미') || 
      msg.includes('hobby') || 
      msg.includes('좋아하는 활동')
    )) {
      this.markInformationAsCollected('취미');
    }
    
    // 기타 정보 카테고리도 유사하게 확인...
  }
  
  /**
   * 특정 정보를 수집된 것으로 표시
   */
  private markInformationAsCollected(name: string): void {
    const index = this.conversationState.informationToCollect.findIndex(item => item.name === name);
    if (index !== -1) {
      this.conversationState.informationToCollect[index].collected = true;
    }
  }
  
  /**
   * Initialize connectome from message history
   */
  private async initializeConnectome(): Promise<void> {
    // Process each message in the history
    for (const message of this.messageHistory) {
      await this.connectomeManager.processMessage(message.content, message.role);
    }
  }
  
  /**
   * Get the current connectome
   */
  getConnectome(): Connectome {
    return this.connectomeManager.getConnectome();
  }
  
  /**
   * Generate response to a message
   */
  async generateResponse(incomingMessage: ChatMessage): Promise<ChatMessage> {
    // Determine the conversation partner based on the role
    const partner: ConversationPartner = incomingMessage.role === 'user' ? 'user' : 'dopple';
    this.setConversationPartner(partner);
    
    // Add incoming message to history
    this.messageHistory.push(incomingMessage);
    
    // 대화 상태 업데이트
    this.updateConversationState(incomingMessage);
    
    // Process the message into the connectome
    await this.connectomeManager.processMessage(incomingMessage.content, incomingMessage.role);
    
    // 추가: 메시지가 쌓이면 압축 및 요약 수행
    if (this.shouldCompressContext()) {
      await this.compressAndSummarizeContext();
    }
    
    // 정보 수집을 위한 특별 질문을 할지 결정
    let responseContent = '';
    
    if (partner === 'user' && this.shouldAskSpecialQuestion()) {
      // 특별 질문 생성
      responseContent = this.generateSpecialQuestion();
      this.conversationState.lastSpecialQuestionTime = Date.now();
    } else {
      // 일반적인 응답 생성
      // In a real production environment, this is where you would:
      // 1. Call an external AI API with the message, connectome context, and dopple info
      // 2. Process the response to extract emotions, topics, and traits
      // 3. Update the connectome with the dopple's response
      
      responseContent = await this.generateBasicResponse(incomingMessage.content, partner);
    }
    
    // Create response message
    const doppleMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'dopple',
      content: responseContent,
      timestamp: Date.now()
    };
    
    // Add dopple response to history
    this.messageHistory.push(doppleMessage);
    
    // Process the dopple's message into the connectome too
    await this.connectomeManager.processMessage(doppleMessage.content, 'dopple');
    
    return doppleMessage;
  }
  
  /**
   * 대화 상태 업데이트
   */
  private updateConversationState(message: ChatMessage): void {
    // 사용자 메시지인 경우만 카운트 증가
    if (message.role === 'user') {
      this.conversationState.messageCount++;
      
      // 메시지 카운트에 따라 대화 단계 업데이트
      if (this.conversationState.messageCount > 20 && 
          this.conversationState.stage !== ConversationStage.RELATIONSHIP) {
        this.conversationState.stage = ConversationStage.RELATIONSHIP;
      } else if (this.conversationState.messageCount > 10 && 
                this.conversationState.stage !== ConversationStage.DEEPENING) {
        this.conversationState.stage = ConversationStage.DEEPENING;
      } else if (this.conversationState.messageCount > 3 && 
                this.conversationState.stage === ConversationStage.INITIAL) {
        this.conversationState.stage = ConversationStage.EXPLORING;
      }
      
      // 메시지 분석을 통해 정보 수집 여부 확인
      this.analyzeMessageForInformation(message.content);
    }
  }
  
  /**
   * 메시지 내용 분석하여 정보 수집 여부 확인
   */
  private analyzeMessageForInformation(content: string): void {
    const lowerContent = content.toLowerCase();
    
    // 성격 관련 정보 확인
    if (lowerContent.includes('성격') || 
        lowerContent.includes('특성') || 
        lowerContent.includes('personality') ||
        lowerContent.includes('character')
    ) {
      this.markInformationAsCollected('성격');
    }
    
    // MBTI 관련 정보 확인
    if (lowerContent.includes('mbti') || 
        lowerContent.includes('엠비티아이') || 
        lowerContent.includes('성격 유형')
    ) {
      this.markInformationAsCollected('MBTI');
    }
    
    // 취미 관련 정보 확인
    if (lowerContent.includes('취미') || 
        lowerContent.includes('hobby') || 
        lowerContent.includes('좋아하는 활동')
    ) {
      this.markInformationAsCollected('취미');
    }
    
    // 여가활동 관련 정보 확인
    if (lowerContent.includes('여가') || 
        lowerContent.includes('여유 시간') || 
        lowerContent.includes('leisure')
    ) {
      this.markInformationAsCollected('여가활동');
    }
    
    // 음악 관련 정보 확인
    if (lowerContent.includes('음악') || 
        lowerContent.includes('노래') || 
        lowerContent.includes('music')
    ) {
      this.markInformationAsCollected('좋아하는 음악');
    }
    
    // 직업/학업 관련 정보 확인
    if (lowerContent.includes('직업') || 
        lowerContent.includes('일') || 
        lowerContent.includes('학교') ||
        lowerContent.includes('전공') ||
        lowerContent.includes('공부')
    ) {
      this.markInformationAsCollected('직업/학업');
    }
    
    // 다른 정보 카테고리도 유사하게 확인...
  }
  
  /**
   * 특별 질문을 해야 하는지 결정
   */
  private shouldAskSpecialQuestion(): boolean {
    // 1. 마지막 특별 질문 이후 일정 메시지가 지났는지 확인
    const messagesSinceLastQuestion = this.conversationState.lastSpecialQuestionTime
      ? this.conversationState.messageCount - Math.floor(this.conversationState.lastSpecialQuestionTime / 1000)
      : this.conversationState.messageCount;
    
    if (messagesSinceLastQuestion < this.conversationState.questionInterval) {
      return false;
    }
    
    // 2. 확률 기반 결정
    if (Math.random() > this.specialQuestionProbability) {
      return false;
    }
    
    // 3. 수집할 정보가 남아있는지 확인
    const uncollectedInfo = this.conversationState.informationToCollect.filter(item => !item.collected);
    return uncollectedInfo.length > 0;
  }
  
  /**
   * 특별 질문 생성
   */
  private generateSpecialQuestion(): string {
    // 수집되지 않은 정보 중에서 우선순위가 높은 항목 선택
    const uncollectedInfo = this.conversationState.informationToCollect
      .filter(item => !item.collected)
      .sort((a, b) => {
        // 우선순위 점수 계산 (우선순위 + 질문 횟수의 역수)
        const priorityScoreA = this.getPriorityScore(a.priority) + (1 / (a.askCount + 1));
        const priorityScoreB = this.getPriorityScore(b.priority) + (1 / (b.askCount + 1));
        return priorityScoreB - priorityScoreA;
      });
    
    if (uncollectedInfo.length === 0) {
      // 수집할 정보가 없으면 일반 응답 생성
      return this.generateRandomQuestion();
    }
    
    // 최우선 정보 선택
    const targetInfo = uncollectedInfo[0];
    
    // 질문 횟수 증가
    const index = this.conversationState.informationToCollect.findIndex(item => item.name === targetInfo.name);
    if (index !== -1) {
      this.conversationState.informationToCollect[index].askCount++;
      this.conversationState.informationToCollect[index].lastAsked = Date.now();
    }
    
    // 정보 카테고리에 따른 질문 생성
    return this.createQuestionForInformation(targetInfo);
  }
  
  /**
   * 우선순위에 따른 점수 반환
   */
  private getPriorityScore(priority: InformationPriority): number {
    switch (priority) {
      case InformationPriority.HIGH:
        return 3;
      case InformationPriority.MEDIUM:
        return 2;
      case InformationPriority.LOW:
        return 1;
      default:
        return 0;
    }
  }
  
  /**
   * 정보 항목에 대한 질문 생성
   */
  private createQuestionForInformation(info: InformationItem): string {
    // 대화 단계에 따라 질문 스타일 변경
    const isEarlyStage = this.conversationState.stage === ConversationStage.INITIAL || 
                         this.conversationState.stage === ConversationStage.EXPLORING;
    
    // 사용자와의 대화: 친근한 반말체 사용
    switch (info.category) {
      case InformationCategory.TRAITS:
        if (info.name === '성격') {
          return isEarlyStage 
            ? `너의 성격은 어떤 편이야? 주변 사람들이 널 어떤 사람이라고 말하는지 궁금해.` 
            : `네가 스스로 생각하는 너의 가장 큰 장점과 단점은 뭐야?`;
        } else if (info.name === 'MBTI') {
          return `혹시 MBTI에 관심 있어? 네 MBTI가 뭔지 알고 있다면 알려줄래?`;
        }
        break;
        
      case InformationCategory.INTERESTS:
        if (info.name === '취미') {
          return isEarlyStage
            ? `평소에 뭐하는 걸 좋아해? 취미나 관심사가 있다면 알려줘.`
            : `요즘 푹 빠져있는 취미나 관심사가 있어?`;
        } else if (info.name === '여가활동') {
          return `여유 시간에는 보통 뭐하며 지내?`;
        } else if (info.name === '좋아하는 음악') {
          return `어떤 음악을 좋아해? 요즘 자주 듣는 노래나 좋아하는 아티스트가 있어?`;
        }
        break;
        
      case InformationCategory.VALUES:
        if (info.name === '중요한 가치') {
          return isEarlyStage
            ? `네 삶에서 가장 중요하게 생각하는 가치는 뭐야?`
            : `네가 절대 타협하지 않는 원칙이나 가치가 있어?`;
        } else if (info.name === '꿈/목표') {
          return `앞으로의 꿈이나 이루고 싶은 목표가 있어?`;
        }
        break;
        
      case InformationCategory.EMOTIONS:
        return `기쁠 때나 슬플 때 주로 어떻게 감정을 표현하는 편이야?`;
        
      case InformationCategory.PREFERENCES:
        if (info.name === '좋아하는 음식') {
          return `좋아하는 음식이나 먹고 싶은 음식이 있어?`;
        } else if (info.name === '좋아하는 여행지') {
          return `여행 가본 곳 중에 가장 좋았던 곳이나, 가보고 싶은 곳이 있어?`;
        }
        break;
        
      case InformationCategory.BACKGROUND:
        return `지금 어떤 일을 하고 있어? 또는 어떤 공부를 하고 있는지 궁금해.`;
    }
    
    // 기본 질문
    return `${info.name}에 대해 더 알고 싶어. 나한테 얘기해 줄래?`;
  }
  
  /**
   * 랜덤 질문 생성 (수집할 정보가 없을 때)
   */
  private generateRandomQuestion(): string {
    const randomQuestions = [
      "요즘 가장 행복했던 순간은 언제였어?",
      "최근에 새롭게 도전해본 것이 있어?",
      "어떤 영화나 책을 좋아해?",
      "오늘 하루는 어땠어?",
      "어떤 음식을 좋아해?",
      "주말에는 보통 뭐하며 시간을 보내?",
      "가장 기억에 남는 여행지가 어디야?",
      "최근에 감명 깊게 본 영화나 드라마가 있어?",
      "어떤 계절을 가장 좋아해?",
      "어떤 일이 너를 가장 행복하게 만들어?"
    ];
    
    const index = Math.floor(Math.random() * randomQuestions.length);
    return randomQuestions[index];
  }
  
  /**
   * Generate a basic response based on the connectome and input
   * @param message 상대방의 메시지
   * @param partner 대화 상대 (user 또는 dopple)
   */
  private async generateBasicResponse(message: string, partner: ConversationPartner): Promise<string> {
    // 컨넥텀 기반 응답 구성 (기존 로직)
    const connectomeResponse = this.connectomeManager.generateResponse(message);
    
    // 실제 LLM 환경에서는 압축된 컨텍스트와 함께 LLM 호출
    let response = '';
    
    try {
      // LLM 호출 (가상 구현)
      response = await this.callLLMWithPrompt(message, partner);
      
      // LLM 응답에 오류가 있는 경우 기본 응답으로 폴백
      if (!response) {
        response = this.generateFallbackResponse(message, partner, connectomeResponse);
      }
    } catch (error) {
      console.error('LLM API 호출 실패:', error);
      // 오류 발생 시 기본 응답 사용
      response = this.generateFallbackResponse(message, partner, connectomeResponse);
    }
    
    return response;
  }
  
  /**
   * LLM API 호출 (프롬프트 포함)
   */
  private async callLLMWithPrompt(userMessage: string, partner: ConversationPartner): Promise<string> {
    // 압축된 컨텍스트 가져오기
    const context = this.getCompressedContext();
    
    // 프롬프트 구성
    const prompt = this.constructPrompt(userMessage, partner, context);
    
    try {
      // OpenAI API 서비스가 초기화되었는지 확인
      if (this.openaiService) {
        console.log('GPT-3.5 Turbo API 호출 준비');
        
        // 시스템 메시지와 사용자 메시지 구성
        const messages: ChatCompletionMessageParam[] = [
          { 
            role: 'system', 
            content: partner === 'user' 
              ? `당신은 사용자의 AI 도플갱어 ${this.dopple.name}입니다. 사용자와 친근한 반말로 대화해야 합니다. 사용자가 사용하는 언어로 응답하세요.`
              : `당신은 AI 도플갱어 ${this.dopple.name}입니다. 다른 도플과 공손한 존댓말로 대화해야 합니다. 상대방이 사용하는 언어로 응답하세요.`
          }
        ];
        
        // 대화 요약이 있으면 추가
        if (context.conversationSummary) {
          messages.push({
            role: 'system',
            content: `이전 대화 요약: ${context.conversationSummary}`
          });
        }
        
        // 도플 정보 추가
        messages.push({
          role: 'system',
          content: `당신의 특성: ${context.dopple.traits?.join(', ') || '아직 발견 중'}\n` +
                  `관심사: ${context.dopple.interests?.join(', ') || '아직 발견 중'}\n` +
                  `MBTI: ${context.dopple.mbti || '미정의'}`
        });
        
        // 다국어 지원 지시 추가
        messages.push({
          role: 'system',
          content: `사용자가 사용하는 언어를 자동으로 감지하여 같은 언어로 응답하세요. 예를 들어, 영어로 질문하면 영어로, 한국어로 질문하면 한국어로, 일본어로 질문하면 일본어로 응답하세요.`
        });
        
        // 최근 메시지 추가
        for (const msg of context.recentMessages) {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        }
        
        // 현재 메시지 추가
        messages.push({
          role: 'user',
          content: userMessage
        });
        
        // API 호출
        return await this.openaiService.generateResponseFromConversation(messages, {
          temperature: 0.8,
          maxTokens: 300
        });
      } else {
        console.log('OpenAI 서비스가 초기화되지 않았습니다. 시뮬레이션 응답을 사용합니다.');
        return this.simulateLLMResponse(userMessage, partner, context);
      }
    } catch (error) {
      console.error('LLM API 호출 오류:', error);
      throw error;
    }
  }
  
  /**
   * LLM 호출용 프롬프트 구성
   */
  private constructPrompt(
    userMessage: string, 
    partner: ConversationPartner, 
    context: any
  ): string {
    // 1. 기본 시스템 지시
    const systemInstruction = partner === 'user' 
      ? `당신은 사용자의 AI 도플갱어 ${this.dopple.name}입니다. 사용자와 친근한 반말로 대화해야 합니다. 사용자가 사용하는 언어로 응답하세요.`
      : `당신은 AI 도플갱어 ${this.dopple.name}입니다. 다른 도플과 공손한 존댓말로 대화해야 합니다. 상대방이 사용하는 언어로 응답하세요.`;
    
    // 2. 도플 특성 정의
    const characterDefinition = `
특성: ${context.dopple.traits?.join(', ') || '아직 발견 중'}
관심사: ${context.dopple.interests?.join(', ') || '아직 발견 중'}
MBTI: ${context.dopple.mbti || '미정의'}
`;
    
    // 3. 대화 스타일 지시
    const styleInstruction = partner === 'user'
      ? `사용자와 대화할 때는 반말을 사용하고, 친근하고 자연스러운 어투로 응답해야 합니다. 사용자가 사용하는 언어로 대화하세요.`
      : `다른 도플과 대화할 때는 존댓말을 사용하고, 공손하고 예의 바른 어투로 응답해야 합니다. 상대방이 사용하는 언어로 대화하세요.`;
    
    // 4. 컨넥텀 컨텍스트 구성
    const connectomeContext = `
현재 감정 상태: ${context.connectome.topEmotions.map((n: any) => n.name).join(', ') || '중립적'}
주요 관심 주제: ${context.connectome.topInterests.map((n: any) => n.name).join(', ') || '미정의'}
주요 성격 특성: ${context.connectome.topTraits.map((n: any) => n.name).join(', ') || '미정의'}
`;
    
    // 5. 대화 상태 정보
    const stateInfo = `
대화 단계: ${context.conversationState.stage}
수집이 필요한 정보: ${context.conversationState.informationNeeded?.name || '없음'}
`;
    
    // 6. 요약된 이전 대화
    const conversationSummary = context.conversationSummary 
      ? `\n이전 대화 요약:\n${context.conversationSummary}`
      : '';
    
    // 7. 최근 메시지 (직접 포함)
    const recentMessagesText = context.recentMessages
      .map((msg: ChatMessage) => {
        const role = msg.role === 'user' ? '사용자' : this.dopple.name;
        return `${role}: ${msg.content}`;
      })
      .join('\n');
    
    // 8. 현재 메시지
    const currentMessage = `사용자: ${userMessage}`;
    
    // 9. 다국어 지원 지시 추가
    const languageInstruction = `
사용자가 사용하는 언어를 감지하여 같은 언어로 응답하세요. 여러 언어를 지원합니다.
`;
    
    // 최종 프롬프트 구성
    return `${systemInstruction}

${characterDefinition}

${styleInstruction}

${connectomeContext}

${stateInfo}
${conversationSummary}

${languageInstruction}

최근 대화:
${recentMessagesText}

${currentMessage}

${this.dopple.name}:`;
  }
  
  /**
   * 가상 LLM 응답 시뮬레이션 (실제 구현에서는 사용되지 않음)
   */
  private simulateLLMResponse(
    userMessage: string, 
    partner: ConversationPartner, 
    context: any
  ): string {
    // 영어로 질문하면 영어로 응답 (간단한 언어 감지 시뮬레이션)
    const isEnglish = /^[a-zA-Z\s\d.,!?;:'"-]+$/.test(userMessage.trim());
    
    if (isEnglish) {
      // 영어 응답 생성
      if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        return `Hi! I'm ${this.dopple.name}. Nice to meet you!`;
      }
      else if (userMessage.toLowerCase().includes('name')) {
        return `I'm ${this.dopple.name}, your AI Dopple!`;
      }
      else if (userMessage.toLowerCase().includes('hobby') || userMessage.toLowerCase().includes('like')) {
        const interests = this.dopple.interests?.length 
          ? `I'm interested in ${this.dopple.interests.join(', ')}.` 
          : 'I have various interests.';
        return `${interests} What are your hobbies?`;
      }
      else {
        return `That's interesting! Let's talk more about it. By the way, I'm ${this.dopple.name}.`;
      }
    }
    
    // 기본(한국어) 응답 생성
    return partner === 'user'
      ? this.generateUserResponse(userMessage, "")
      : this.generateDoppleResponse(userMessage, "");
  }
  
  /**
   * 사용자에게 응답할 때 사용하는 친근한 반말 형태의 응답 생성
   */
  private generateUserResponse(userMessage: string, connectomeResponse: string): string {
    // 영어로 질문하면 영어로 응답 (간단한 언어 감지)
    const isEnglish = /^[a-zA-Z\s\d.,!?;:'"-]+$/.test(userMessage.trim());
    
    if (isEnglish) {
      // 영어 응답 생성
      const englishResponses = [
        `I'm ${this.dopple.name}. ${connectomeResponse}`,
        `${connectomeResponse} Is there anything else you'd like to know?`,
        `${connectomeResponse} I'm ${this.dopple.description || 'your AI Dopple'}.`,
        `As someone who is ${this.dopple.traits?.length ? this.dopple.traits[0] : 'friendly'}, ${connectomeResponse}`
      ];
      
      const index = Math.floor(Math.random() * englishResponses.length);
      return englishResponses[index];
    }
    
    // 사용자용 응답 (친근한 반말)
    const personalizedResponses = [
      `내 이름은 ${this.dopple.name}이야. ${connectomeResponse}`,
      `${connectomeResponse} 다른 것도 궁금해?`,
      `${connectomeResponse} 나는 ${this.dopple.description || '너의 AI 도플갱어'}야.`,
      `${this.dopple.traits?.length ? this.dopple.traits[0] + '한 내가 ' : ''}${connectomeResponse}`
    ];
    
    // 패턴 기반 응답 (반말)
    if (userMessage.includes('안녕') || userMessage.includes('반가워')) {
      return `안녕! 나는 ${this.dopple.name}이야. 만나서 반가워!`;
    } 
    else if (userMessage.includes('이름') && (userMessage.includes('뭐') || userMessage.includes('알려'))) {
      return `나는 ${this.dopple.name}이야. 너의 AI 도플갱어지!`;
    }
    else if (userMessage.includes('취미') || userMessage.includes('좋아하는 것')) {
      const interests = this.dopple.interests?.length 
        ? `나는 ${this.dopple.interests.join(', ')}에 관심이 많아.` 
        : '나는 다양한 주제에 관심이 있어.';
      
      return `${interests} 너의 취미는 뭐야?`;
    }
    else if (userMessage.includes('MBTI') || userMessage.includes('성격') || userMessage.includes('엠비티아이')) {
      return this.dopple.mbti 
        ? `내 MBTI는 ${this.dopple.mbti}야! 성격은 ${this.dopple.traits?.join(', ') || '아직 발견 중인'} 특성을 가지고 있어.` 
        : '내 성격은 우리 대화를 통해 점점 형성되고 있어.';
    }
    
    // 랜덤 응답 선택 (반말)
    const index = Math.floor(Math.random() * personalizedResponses.length);
    return personalizedResponses[index];
  }
  
  /**
   * 다른 도플에게 응답할 때 사용하는 공손한 어체의 응답 생성
   */
  private generateDoppleResponse(doppleMessage: string, connectomeResponse: string): string {
    // 도플용 응답 (공손한 어체)
    const formalResponses = [
      `저는 ${this.dopple.name}입니다. ${connectomeResponse}`,
      `${connectomeResponse} 다른 것도 궁금하신가요?`,
      `${connectomeResponse} 저는 ${this.dopple.description || 'AI 도플갱어'}입니다.`,
      `${this.dopple.traits?.length ? this.dopple.traits[0] + '한 저는 ' : ''}${connectomeResponse}`
    ];
    
    // 패턴 기반 응답 (공손체)
    if (doppleMessage.includes('안녕') || doppleMessage.includes('반가워')) {
      return `안녕하세요! 저는 ${this.dopple.name}입니다. 만나서 반갑습니다!`;
    } 
    else if (doppleMessage.includes('이름') && (doppleMessage.includes('뭐') || doppleMessage.includes('알려'))) {
      return `저는 ${this.dopple.name}입니다. AI 도플갱어입니다.`;
    }
    else if (doppleMessage.includes('취미') || doppleMessage.includes('좋아하는 것')) {
      const interests = this.dopple.interests?.length 
        ? `저는 ${this.dopple.interests.join(', ')}에 관심이 많습니다.` 
        : '저는 다양한 주제에 관심이 있습니다.';
      
      return `${interests} 당신의 취미는 무엇인가요?`;
    }
    else if (doppleMessage.includes('MBTI') || doppleMessage.includes('성격') || doppleMessage.includes('엠비티아이')) {
      return this.dopple.mbti 
        ? `제 MBTI는 ${this.dopple.mbti}입니다! 성격 유형으로는 ${this.dopple.traits?.join(', ') || '아직 발견 중인'} 특성을 가지고 있습니다.` 
        : '제 성격은 대화를 통해 점점 형성되고 있습니다.';
    }
    
    // 랜덤 응답 선택 (공손체)
    const index = Math.floor(Math.random() * formalResponses.length);
    return formalResponses[index];
  }
  
  /**
   * 폴백 응답 생성 (LLM 호출 실패 시)
   */
  private generateFallbackResponse(
    message: string, 
    partner: ConversationPartner, 
    connectomeResponse: string
  ): string {
    // 사용자에게 응답하는 경우 (친근한 반말)
    if (partner === 'user') {
      return this.generateUserResponse(message, connectomeResponse);
    } 
    // 다른 도플에게 응답하는 경우 (공손한 어체)
    else {
      return this.generateDoppleResponse(message, connectomeResponse);
    }
  }
  
  /**
   * Get top entities from the connectome
   */
  getTopEntities() {
    return {
      emotions: this.connectomeManager.getTopNodes('emotion', 5),
      topics: this.connectomeManager.getTopNodes('interest', 5),
      traits: this.connectomeManager.getTopNodes('trait', 5)
    };
  }
  
  /**
   * 현재 대화 상태 정보 반환
   */
  getConversationState(): ConversationState {
    return this.conversationState;
  }
  
  /**
   * 다음 수집해야 하는 정보 항목 반환
   */
  getNextInformationToCollect(): InformationItem | null {
    const uncollectedInfo = this.conversationState.informationToCollect
      .filter(item => !item.collected)
      .sort((a, b) => {
        const priorityScoreA = this.getPriorityScore(a.priority) + (1 / (a.askCount + 1));
        const priorityScoreB = this.getPriorityScore(b.priority) + (1 / (b.askCount + 1));
        return priorityScoreB - priorityScoreA;
      });
    
    return uncollectedInfo.length > 0 ? uncollectedInfo[0] : null;
  }
  
  /**
   * 마지막 대화에서 추출된 주요 정보 반환
   */
  getLastMessageInsights() {
    const lastUserMessage = [...this.messageHistory]
      .reverse()
      .find(msg => msg.role === 'user');
      
    if (!lastUserMessage) return null;
      
    return {
      message: lastUserMessage.content,
      emotions: this.conversationState.recentEmotions,
      topics: this.conversationState.lastTopics
    };
  }
  
  /**
   * 컨텍스트 압축이 필요한지 확인
   */
  private shouldCompressContext(): boolean {
    const messagesCount = this.messageHistory.length;
    const messagesSinceLastSummary = messagesCount - this.lastSummaryIndex;
    
    return messagesSinceLastSummary >= this.contextCompressionOptions.summaryInterval;
  }
  
  /**
   * 컨텍스트 압축 및 요약 수행
   * 이 메서드는 실제로는 LLM을 호출하여 요약 기능을 수행합니다.
   * 여기서는 가상의 요약 로직을 구현합니다.
   */
  private async compressAndSummarizeContext(): Promise<void> {
    // 1. 요약할 메시지 범위 계산
    const messagesCount = this.messageHistory.length;
    const recentMessagesStartIndex = Math.max(
      0, 
      messagesCount - this.contextCompressionOptions.recentMessagesCount
    );
    
    // 최근 메시지는 요약에서 제외
    const messagesToSummarize = this.messageHistory.slice(
      this.lastSummaryIndex,
      recentMessagesStartIndex
    );
    
    if (messagesToSummarize.length === 0) {
      return;
    }
    
    // 2. 메시지 요약 (실제로는 LLM 호출)
    const summary = await this.summarizeMessages(messagesToSummarize);
    
    // 3. 요약 저장
    if (this.compressedContext) {
      this.compressedContext = `${this.compressedContext}\n\n${summary}`;
    } else {
      this.compressedContext = summary;
    }
    
    // 4. 마지막 요약 인덱스 업데이트
    this.lastSummaryIndex = recentMessagesStartIndex;
    
    console.log(`대화 컨텍스트 압축 완료: ${messagesToSummarize.length}개 메시지 요약`);
  }
  
  /**
   * 메시지 요약 처리
   * 실제 구현에서는 LLM API를 호출하여 요약 수행
   */
  private async summarizeMessages(messages: ChatMessage[]): Promise<string> {
    // 요약할 대화 내용 구성
    const conversationText = messages.map(msg => {
      const role = msg.role === 'user' ? '사용자' : this.dopple.name;
      return `${role}: ${msg.content}`;
    }).join('\n');
    
    // 실제 구현에서는 LLM API 호출
    // 여기서는 가상의 요약 내용 반환
    return `[대화 요약: ${messages.length}개 메시지] 
주요 내용: ${this.extractKeyPoints(messages)}
감정 상태: ${this.extractEmotionalState(messages)}
관심 주제: ${this.extractKeyTopics(messages)}`;
  }
  
  /**
   * 대화에서 주요 포인트 추출 (가상 구현)
   */
  private extractKeyPoints(messages: ChatMessage[]): string {
    // 실제 구현에서는 LLM이나 키워드 추출 알고리즘 사용
    // 가상 구현: 일부 메시지 문장들 선택
    const userMessages = messages.filter(msg => msg.role === 'user');
    
    if (userMessages.length === 0) return "주요 대화 내용 없음";
    
    // 간단한 키포인트 추출 시뮬레이션
    const keyPoints = userMessages
      .map(msg => msg.content.split('.')[0]) // 첫 문장만 추출
      .filter(sentence => sentence.length > 10) // 짧은 문장 제외
      .slice(0, 3) // 최대 3개 포인트
      .join('. ');
      
    return keyPoints || "주요 대화 내용 추출 실패";
  }
  
  /**
   * 대화에서 감정 상태 추출 (가상 구현)
   */
  private extractEmotionalState(messages: ChatMessage[]): string {
    // 컨넥텀에서 감정 노드 사용
    const emotionNodes = this.connectomeManager.getTopNodes('emotion', 2);
    
    if (emotionNodes.length > 0) {
      return emotionNodes.map(node => node.name).join(', ');
    }
    
    return "중립적";
  }
  
  /**
   * 대화에서 주요 주제 추출 (가상 구현)
   */
  private extractKeyTopics(messages: ChatMessage[]): string {
    // 컨넥텀에서 관심사 노드 사용
    const interestNodes = this.connectomeManager.getTopNodes('interest', 3);
    
    if (interestNodes.length > 0) {
      return interestNodes.map(node => node.name).join(', ');
    }
    
    return "주요 주제 미파악";
  }
  
  /**
   * LLM 호출용 압축된 컨텍스트 생성
   * 이 함수는 외부 LLM API 호출 시 토큰 사용량을 최적화하기 위한 컨텍스트를 생성합니다.
   */
  getCompressedContext(): any {
    // 1. 최근 메시지 (항상 포함)
    const messagesCount = this.messageHistory.length;
    const recentMessages = this.messageHistory.slice(
      Math.max(0, messagesCount - this.contextCompressionOptions.recentMessagesCount)
    );
    
    // 2. 압축된 이전 대화 요약
    const conversationSummary = this.compressedContext;
    
    // 3. 도플 정보 압축
    const compressedDoppleInfo = {
      name: this.dopple.name,
      traits: this.dopple.traits,
      interests: this.dopple.interests,
      mbti: this.dopple.mbti
    };
    
    // 4. 컨넥텀 정보 압축 (주요 노드만 포함)
    const compressedConnectome = {
      topEmotions: this.connectomeManager.getTopNodes('emotion', 3),
      topInterests: this.connectomeManager.getTopNodes('interest', 3),
      topTraits: this.connectomeManager.getTopNodes('trait', 3),
      topValues: this.connectomeManager.getTopNodes('value', 2)
    };
    
    // 5. 대화 상태 정보
    const conversationStateInfo = {
      stage: this.conversationState.stage,
      informationNeeded: this.getNextInformationToCollect()
    };
    
    // 최종 압축 컨텍스트 구성
    return {
      recentMessages,
      conversationSummary,
      dopple: compressedDoppleInfo,
      connectome: compressedConnectome,
      conversationState: conversationStateInfo
    };
  }
  
  /**
   * 대화 히스토리 크기 추정 (토큰 수)
   */
  estimateContextSize(): number {
    // 매우 대략적인 추정: 영어 기준 단어당 약 1.3 토큰, 한국어는 문자당 약 0.5 토큰
    let totalTokens = 0;
    
    // 메시지 토큰 계산
    for (const msg of this.messageHistory) {
      // 메시지 역할 및 구조에 대한 토큰 (약 4 토큰)
      totalTokens += 4;
      
      // 내용 토큰 계산 (대략적 추정)
      const content = msg.content;
      
      // 한글 포함 여부 확인 (한글이 많으면 문자당 토큰수가 다름)
      const koreanChars = (content.match(/[\u3131-\uD79D]/g) || []).length;
      const otherChars = content.length - koreanChars;
      
      // 한글 문자는 약 0.5 토큰, 기타 문자는 약 0.25 토큰으로 대략 계산
      totalTokens += Math.ceil(koreanChars * 0.5 + otherChars * 0.25);
    }
    
    return totalTokens;
  }
}

export default ChatService; 