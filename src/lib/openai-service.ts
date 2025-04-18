import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/**
 * OpenAI API 서비스
 * GPT-3.5 Turbo 및 기타 모델 연결을 위한 클래스
 */
export class OpenAIService {
  private apiKey: string;
  
  constructor(apiKey?: string) {
    // 환경변수 또는 전달된 API 키 사용
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('OpenAI API 키가 설정되지 않았습니다. API 호출이 실패할 수 있습니다.');
    }
  }
  
  /**
   * GPT-3.5 Turbo 모델에 메시지 전송 및 응답 수신
   */
  async chatGPT35Turbo(
    messages: ChatCompletionMessageParam[],
    options: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
    } = {}
  ): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 300,
          top_p: options.topP || 1.0,
          frequency_penalty: options.frequencyPenalty || 0,
          presence_penalty: options.presencePenalty || 0
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API 오류: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('GPT-3.5 Turbo API 호출 실패:', error);
      throw error;
    }
  }
  
  /**
   * 프롬프트와 시스템 지시를 사용하여 대화 생성
   */
  async generateChatResponse(
    prompt: string, 
    systemInstruction: string = 'You are a helpful assistant.'
  ): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt }
    ];
    
    return this.chatGPT35Turbo(messages);
  }
  
  /**
   * 다중 메시지 대화 히스토리를 사용하여 응답 생성
   */
  async generateResponseFromConversation(
    messages: ChatCompletionMessageParam[],
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    return this.chatGPT35Turbo(messages, options);
  }
}

export default OpenAIService; 