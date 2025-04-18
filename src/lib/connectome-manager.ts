import { Connectome, ConnectomeNode, ConnectomeEdge } from '@/types/character';

// Constants
const MIN_NODE_STRENGTH = 1;
const MAX_NODE_STRENGTH = 10;
const MIN_EDGE_WEIGHT = -10;
const MAX_EDGE_WEIGHT = 10;
const MEMORY_DECAY_RATE = 0.95; // Rate at which memory importance decays over time
const REPETITION_BOOST = 1.2;   // Multiplier for repeated topics/emotions
const MAX_IMPORTANCE = 10;      // Maximum importance value

/**
 * Memory graph manager for Dopple's Connectom system
 * Manages the semantic memory graph structure, analyzing conversations
 * and updating the connectome based on emotional and topical patterns
 */
export class ConnectomeManager {
  private connectome: Connectome;
  private doppleId: string;
  
  // Common emotion categories
  private static EMOTIONS = [
    "happy", "sad", "angry", "surprised", "afraid", 
    "disgusted", "neutral", "curious", "excited", "thoughtful"
  ];

  // Common topic categories
  private static TOPICS = [
    "personal", "work", "family", "relationships", "hobbies", 
    "education", "health", "entertainment", "technology", "philosophy",
    "art", "science", "ethics"
  ];

  // Common personality traits
  private static TRAITS = [
    "creative", "analytical", "empathetic", "logical", "decisive",
    "adaptable", "optimistic", "pessimistic", "curious", "cautious",
    "adventurous", "organized", "spontaneous"
  ];

  constructor(doppleId: string, initialConnectome?: Connectome) {
    this.doppleId = doppleId;
    this.connectome = initialConnectome || this.createEmptyConnectome();
  }

  /**
   * Create an empty connectome structure
   */
  private createEmptyConnectome(): Connectome {
    return {
      nodes: [],
      edges: []
    };
  }

  /**
   * Get the current connectome
   */
  getConnectome(): Connectome {
    return this.connectome;
  }

  /**
   * Set the connectome
   */
  setConnectome(connectome: Connectome): void {
    this.connectome = connectome;
  }

  /**
   * Process a chat message and update the connectome
   * @param message The message text to process
   * @param role The role of the message sender ('user', 'dopple', or 'system')
   */
  async processMessage(message: string, role: 'user' | 'dopple' | 'system'): Promise<void> {
    // system 메시지는 처리하지 않음
    if (role === 'system') return;
    
    // Extract emotions, topics, and traits from the message
    const analysis = await this.analyzeMessage(message);
    
    if (!analysis) return;
    
    const { emotions, topics, traits, importance } = analysis;
    
    // Process each emotion, topic, and trait
    emotions.forEach(emotion => {
      this.processEmotion(emotion, importance, role as 'user' | 'dopple');
    });
    
    topics.forEach(topic => {
      this.processTopic(topic, importance, role as 'user' | 'dopple');
    });
    
    // Create connections between entities that appeared together
    this.createConnectionsBetweenEntities(emotions, topics, traits, importance);
    
    // Decay old connections slightly
    this.decayConnections();
  }
  
  /**
   * Analyze a message to extract emotions, topics, and traits
   * In a production environment, this would call an API to perform the analysis
   */
  private async analyzeMessage(message: string): Promise<{
    emotions: string[],
    topics: string[],
    traits: string[],
    importance: number
  } | null> {
    try {
      // For MVP, implement a simple rule-based approach
      // In production, this would be replaced with an API call to a more sophisticated analysis service
      
      const analysis = {
        emotions: [] as string[],
        topics: [] as string[],
        traits: [] as string[],
        importance: 5 // Default medium importance
      };
      
      // Simple pattern matching for emotions
      if (message.match(/happy|joy|excited|glad|pleased|delighted/i)) {
        analysis.emotions.push('happy');
      }
      if (message.match(/sad|unhappy|depressed|down|blue|miserable/i)) {
        analysis.emotions.push('sad');
      }
      if (message.match(/angry|mad|furious|outraged|annoyed/i)) {
        analysis.emotions.push('angry');
      }
      if (message.match(/surprised|shocked|amazed|astonished/i)) {
        analysis.emotions.push('surprised');
      }
      if (message.match(/afraid|scared|frightened|terrified|anxious/i)) {
        analysis.emotions.push('afraid');
      }
      if (message.match(/disgusted|repulsed|revolted/i)) {
        analysis.emotions.push('disgusted');
      }
      if (message.match(/curious|interested|intrigued/i)) {
        analysis.emotions.push('curious');
      }
      if (message.match(/excited|thrilled|eager/i)) {
        analysis.emotions.push('excited');
      }
      if (message.match(/thoughtful|pensive|contemplative/i)) {
        analysis.emotions.push('thoughtful');
      }
      
      // If no emotions were detected, add 'neutral'
      if (analysis.emotions.length === 0) {
        analysis.emotions.push('neutral');
      }
      
      // Simple pattern matching for topics
      if (message.match(/family|parents|children|siblings|relatives/i)) {
        analysis.topics.push('family');
      }
      if (message.match(/work|job|career|office|boss|colleague/i)) {
        analysis.topics.push('work');
      }
      if (message.match(/hobby|interest|pastime|leisure|fun/i)) {
        analysis.topics.push('hobbies');
      }
      if (message.match(/health|doctor|exercise|diet|illness|wellness/i)) {
        analysis.topics.push('health');
      }
      if (message.match(/school|education|learning|studying|university|college/i)) {
        analysis.topics.push('education');
      }
      if (message.match(/technology|computer|internet|app|software|device/i)) {
        analysis.topics.push('technology');
      }
      if (message.match(/movie|film|tv|show|series|actor|actress/i)) {
        analysis.topics.push('entertainment');
      }
      if (message.match(/relationship|friend|partner|date|love|boyfriend|girlfriend/i)) {
        analysis.topics.push('relationships');
      }
      
      // Simple pattern matching for traits
      if (message.match(/creative|imagination|artistic/i)) {
        analysis.traits.push('creative');
      }
      if (message.match(/analytical|logical|rational|think/i)) {
        analysis.traits.push('analytical');
      }
      if (message.match(/empathy|understanding|compassion|care/i)) {
        analysis.traits.push('empathetic');
      }
      if (message.match(/decisive|decision|choose|select/i)) {
        analysis.traits.push('decisive');
      }
      if (message.match(/adapt|flexible|change|adjust/i)) {
        analysis.traits.push('adaptable');
      }
      if (message.match(/optimistic|positive|hopeful/i)) {
        analysis.traits.push('optimistic');
      }
      if (message.match(/pessimistic|negative|doubtful/i)) {
        analysis.traits.push('pessimistic');
      }
      
      // Set importance based on message length and punctuation
      if (message.length > 100) {
        analysis.importance += 1;
      }
      if (message.match(/\?|!/g)) {
        analysis.importance += 1;
      }
      if (message.match(/!!/g)) {
        analysis.importance += 1;
      }
      
      // Cap importance at MAX_IMPORTANCE
      if (analysis.importance > MAX_IMPORTANCE) {
        analysis.importance = MAX_IMPORTANCE;
      }
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing message:', error);
      return null;
    }
  }
  
  /**
   * Process emotion and update the connectome
   */
  private processEmotion(emotion: string, importance: number, role: 'user' | 'dopple'): void {
    // Only process user emotions for now
    if (role !== 'user') return;
    
    // Find or create the emotion node
    const nodeId = `emotion_${emotion}`;
    let node = this.connectome.nodes.find(n => n.id === nodeId);
    
    if (!node) {
      // Create a new node
      node = {
        id: nodeId,
        name: emotion,
        type: 'emotion',
        strength: importance,
        description: `Emotion: ${emotion}`
      };
      this.connectome.nodes.push(node);
    } else {
      // Update existing node
      node.strength = Math.min(MAX_NODE_STRENGTH, node.strength + 1);
    }
  }
  
  /**
   * Process topic and update the connectome
   */
  private processTopic(topic: string, importance: number, role: 'user' | 'dopple'): void {
    // Only process user topics for now
    if (role !== 'user') return;
    
    // Find or create the topic node
    const nodeId = `topic_${topic}`;
    let node = this.connectome.nodes.find(n => n.id === nodeId);
    
    if (!node) {
      // Create a new node
      node = {
        id: nodeId,
        name: topic,
        type: 'interest',
        strength: importance,
        description: `Topic: ${topic}`
      };
      this.connectome.nodes.push(node);
    } else {
      // Update existing node - strengthen it when repeated
      node.strength = Math.min(MAX_NODE_STRENGTH, node.strength * REPETITION_BOOST);
    }
  }
  
  /**
   * Create connections between entities that appeared together in the same message
   */
  private createConnectionsBetweenEntities(
    emotions: string[],
    topics: string[],
    traits: string[],
    importance: number
  ): void {
    // Create connections between emotions and topics
    emotions.forEach(emotion => {
      const emotionNodeId = `emotion_${emotion}`;
      
      topics.forEach(topic => {
        const topicNodeId = `topic_${topic}`;
        this.createOrUpdateEdge(emotionNodeId, topicNodeId, importance);
      });
      
      traits.forEach(trait => {
        const traitNodeId = `trait_${trait}`;
        this.createOrUpdateEdge(emotionNodeId, traitNodeId, importance);
      });
    });
    
    // Create connections between topics
    if (topics.length > 1) {
      for (let i = 0; i < topics.length; i++) {
        for (let j = i + 1; j < topics.length; j++) {
          const sourceNodeId = `topic_${topics[i]}`;
          const targetNodeId = `topic_${topics[j]}`;
          this.createOrUpdateEdge(sourceNodeId, targetNodeId, importance);
        }
      }
    }
  }
  
  /**
   * Create or update an edge between two nodes
   */
  private createOrUpdateEdge(sourceId: string, targetId: string, importance: number): void {
    // Check if both nodes exist
    const sourceExists = this.connectome.nodes.some(n => n.id === sourceId);
    const targetExists = this.connectome.nodes.some(n => n.id === targetId);
    
    if (!sourceExists || !targetExists) return;
    
    // Check if the edge already exists
    let edge = this.connectome.edges.find(
      e => (e.source === sourceId && e.target === targetId) ||
           (e.source === targetId && e.target === sourceId)
    );
    
    if (!edge) {
      // Create a new edge
      edge = {
        source: sourceId,
        target: targetId,
        weight: importance
      };
      this.connectome.edges.push(edge);
    } else {
      // Update existing edge
      edge.weight = Math.min(MAX_EDGE_WEIGHT, edge.weight + 1);
    }
  }
  
  /**
   * Decay all connections slightly to simulate memory fading
   */
  private decayConnections(): void {
    // Decay node strengths
    this.connectome.nodes.forEach(node => {
      node.strength = Math.max(
        MIN_NODE_STRENGTH,
        node.strength * MEMORY_DECAY_RATE
      );
    });
    
    // Decay edge weights
    this.connectome.edges.forEach(edge => {
      edge.weight = edge.weight * MEMORY_DECAY_RATE;
    });
    
    // Remove very weak connections
    this.connectome.edges = this.connectome.edges.filter(edge => 
      Math.abs(edge.weight) > 0.5
    );
  }
  
  /**
   * Get the most important nodes by type
   */
  getTopNodes(type: 'trait' | 'interest' | 'emotion' | 'value', limit: number = 5): ConnectomeNode[] {
    return this.connectome.nodes
      .filter(node => node.type === type)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit);
  }
  
  /**
   * Get the strongest connections for a node
   */
  getNodeConnections(nodeId: string, limit: number = 5): {
    node: ConnectomeNode,
    edge: ConnectomeEdge
  }[] {
    const connections: {
      node: ConnectomeNode,
      edge: ConnectomeEdge
    }[] = [];
    
    // Find the node
    const sourceNode = this.connectome.nodes.find(n => n.id === nodeId);
    if (!sourceNode) return [];
    
    // Find all edges connected to this node
    const connectedEdges = this.connectome.edges.filter(
      e => e.source === nodeId || e.target === nodeId
    );
    
    // For each edge, find the connected node
    connectedEdges.forEach(edge => {
      const connectedNodeId = edge.source === nodeId ? edge.target : edge.source;
      const connectedNode = this.connectome.nodes.find(n => n.id === connectedNodeId);
      
      if (connectedNode) {
        connections.push({
          node: connectedNode,
          edge: edge
        });
      }
    });
    
    // Sort by edge weight and return the top 'limit'
    return connections
      .sort((a, b) => Math.abs(b.edge.weight) - Math.abs(a.edge.weight))
      .slice(0, limit);
  }
  
  /**
   * Generate a response based on the current connectome state
   * This is a placeholder for the actual response generation logic
   */
  generateResponse(userMessage: string): string {
    // For MVP, this is a very basic implementation
    // In a real system, this would use the connectome to inform an LLM-based response generator
    
    // Get top emotions and topics
    const topEmotions = this.getTopNodes('emotion', 3);
    const topTopics = this.getTopNodes('interest', 3);
    
    // Generate a simple response based on top emotions and topics
    if (topEmotions.length > 0 && topTopics.length > 0) {
      const mainEmotion = topEmotions[0].name;
      const mainTopic = topTopics[0].name;
      
      // Simple pattern matching response
      if (userMessage.match(/how are you|how do you feel/i)) {
        return `I'm feeling ${mainEmotion}! I've been thinking about ${mainTopic} lately.`;
      }
      
      if (userMessage.match(/what do you like|what are you interested in/i)) {
        return `I'm really interested in ${mainTopic}! How about you?`;
      }
      
      if (userMessage.match(/tell me about yourself/i)) {
        return `I tend to be ${mainEmotion} a lot, and I'm very interested in ${mainTopic}.`;
      }
      
      // Default response
      return `It seems you have a strong interest in ${mainTopic}. Would you like to talk more about that?`;
    }
    
    // Fallback response
    return "I'm still learning about your interests and emotions. Tell me more about yourself!";
  }

  /**
   * 주요 노드 유형이 부족한지 확인
   * @param type 노드 유형 (trait, interest, emotion, value)
   * @param threshold 최소 노드 수 기준 (기본값: 3)
   * @returns 부족한지 여부 (true: 부족함, false: 충분함)
   */
  isNodeTypeDeficient(type: 'trait' | 'interest' | 'emotion' | 'value', threshold: number = 3): boolean {
    const nodes = this.connectome.nodes.filter(n => n.type === type);
    return nodes.length < threshold;
  }
  
  /**
   * 컨넥텀에서 부족한 정보 유형 파악
   * @returns 부족한 노드 유형 목록
   */
  getDeficientNodeTypes(): { type: string; importance: number; currentCount: number }[] {
    const result: { type: string; importance: number; currentCount: number }[] = [];
    
    // 각 노드 유형별 상태 확인
    const traitNodes = this.connectome.nodes.filter(n => n.type === 'trait');
    const interestNodes = this.connectome.nodes.filter(n => n.type === 'interest');
    const emotionNodes = this.connectome.nodes.filter(n => n.type === 'emotion');
    const valueNodes = this.connectome.nodes.filter(n => n.type === 'value');
    
    // 특성 노드 부족 확인 (높은 중요도)
    if (traitNodes.length < 3) {
      result.push({ 
        type: 'trait', 
        importance: 5, 
        currentCount: traitNodes.length 
      });
    }
    
    // 관심사 노드 부족 확인 (높은 중요도)
    if (interestNodes.length < 3) {
      result.push({ 
        type: 'interest', 
        importance: 4, 
        currentCount: interestNodes.length 
      });
    }
    
    // 가치 노드 부족 확인 (중간 중요도)
    if (valueNodes.length < 2) {
      result.push({ 
        type: 'value', 
        importance: 3, 
        currentCount: valueNodes.length 
      });
    }
    
    // 감정 노드 부족 확인 (낮은 중요도)
    if (emotionNodes.length < 3) {
      result.push({ 
        type: 'emotion', 
        importance: 2, 
        currentCount: emotionNodes.length 
      });
    }
    
    // 중요도에 따라 정렬
    return result.sort((a, b) => b.importance - a.importance);
  }
  
  /**
   * 특정 노드 유형에 대한 질문 주제 추천
   * @param type 노드 유형
   * @returns 질문 주제 목록
   */
  getQuestionTopicsForNodeType(type: 'trait' | 'interest' | 'emotion' | 'value'): string[] {
    switch(type) {
      case 'trait':
        return [
          '성격',
          '장단점',
          '성격 특성',
          'MBTI 유형',
          '자신만의 특징',
          '타인이 보는 나의 모습'
        ];
      case 'interest':
        return [
          '취미',
          '관심사',
          '여가 활동',
          '좋아하는 분야',
          '관심있는 주제',
          '즐겨하는 활동'
        ];
      case 'value':
        return [
          '가치관',
          '중요하게 생각하는 것',
          '삶의 원칙',
          '꿈과 목표',
          '우선시하는 것들'
        ];
      case 'emotion':
        return [
          '감정 표현 방식',
          '기쁨을 느끼는 순간',
          '스트레스 관리 방법',
          '행복한 기억',
          '최근 감정 상태'
        ];
      default:
        return [];
    }
  }
  
  /**
   * 현재 컨넥텀 상태에 따른 대화 주제 추천
   * @param count 추천할 주제 수
   * @returns 추천 주제 목록
   */
  getRecommendedTopics(count: number = 3): { topic: string; reason: string }[] {
    const recommendations: { topic: string; reason: string }[] = [];
    
    // 부족한 노드 유형 확인
    const deficientTypes = this.getDeficientNodeTypes();
    
    // 각 부족한 유형에 대해 질문 주제 생성
    for (const type of deficientTypes) {
      const topics = this.getQuestionTopicsForNodeType(type.type as 'trait' | 'interest' | 'emotion' | 'value');
      
      if (topics.length > 0) {
        // 각 유형에서 랜덤으로 주제 선택
        const randomIndex = Math.floor(Math.random() * topics.length);
        recommendations.push({
          topic: topics[randomIndex],
          reason: `${this.getNodeTypeDisplayName(type.type)} 정보가 부족합니다 (현재 ${type.currentCount}개).`
        });
        
        // 충분한 추천 수에 도달하면 중단
        if (recommendations.length >= count) {
          break;
        }
      }
    }
    
    // 부족한 유형이 없거나 부족해도 추천 수가 모자라면 기존 노드 기반 추천 추가
    if (recommendations.length < count) {
      // 가장 강한 노드들 가져오기
      const topNodes = this.connectome.nodes
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 5);
      
      for (const node of topNodes) {
        if (recommendations.length >= count) break;
        
        // 연결된 노드 확인
        const connections = this.getNodeConnections(node.id, 3);
        
        // 강한 연결이 있는 경우, 연관 주제 추천
        if (connections.length > 0) {
          const connectedNode = connections[0].node;
          recommendations.push({
            topic: `${node.name}과 ${connectedNode.name}의 관계`,
            reason: `현재 중요한 ${this.getNodeTypeDisplayName(node.type)} "${node.name}"에 대해 더 깊이 탐색하기 위함입니다.`
          });
        } else {
          // 연결이 약한 경우, 해당 노드에 대한 직접적인 질문 추천
          recommendations.push({
            topic: node.name,
            reason: `현재 중요한 ${this.getNodeTypeDisplayName(node.type)} "${node.name}"에 대한 더 많은 정보를 얻기 위함입니다.`
          });
        }
      }
    }
    
    return recommendations;
  }
  
  /**
   * 노드 유형 표시 이름 가져오기
   */
  private getNodeTypeDisplayName(type: string): string {
    switch(type) {
      case 'trait': return '성격 특성';
      case 'interest': return '관심사';
      case 'value': return '가치관';
      case 'emotion': return '감정';
      default: return type;
    }
  }
  
  /**
   * 컨넥텀 복잡도 점수 계산
   * 노드와 엣지의 양과 다양성을 기반으로 계산
   * @returns 복잡도 점수 (0-100)
   */
  getConnectomeComplexityScore(): number {
    // 노드 수와 엣지 수 계산
    const nodeCount = this.connectome.nodes.length;
    const edgeCount = this.connectome.edges.length;
    
    // 각 유형별 노드 수 계산
    const traitCount = this.connectome.nodes.filter(n => n.type === 'trait').length;
    const interestCount = this.connectome.nodes.filter(n => n.type === 'interest').length;
    const emotionCount = this.connectome.nodes.filter(n => n.type === 'emotion').length;
    const valueCount = this.connectome.nodes.filter(n => n.type === 'value').length;
    
    // 노드 다양성 계산 (각 유형이 얼마나 균형있게 분포되어 있는지)
    const totalTypes = 4; // trait, interest, emotion, value
    const typeDistribution = [traitCount, interestCount, emotionCount, valueCount]
      .filter(count => count > 0).length / totalTypes;
    
    // 연결 밀도 계산 (가능한 모든 연결 대비 실제 연결의 비율)
    const maxPossibleEdges = nodeCount * (nodeCount - 1) / 2;
    const connectionDensity = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;
    
    // 각 요소별 가중치 설정
    const nodeCountWeight = 0.3;
    const edgeCountWeight = 0.3;
    const typeDistributionWeight = 0.2;
    const connectionDensityWeight = 0.2;
    
    // 각 요소별 정규화 및 점수 계산 (각 지표를 0-100 사이로 스케일링)
    const normalizedNodeCount = Math.min(1, nodeCount / 20) * 100; // 20개 노드면 만점
    const normalizedEdgeCount = Math.min(1, edgeCount / 40) * 100; // 40개 엣지면 만점
    const normalizedTypeDistribution = typeDistribution * 100;
    const normalizedConnectionDensity = connectionDensity * 100;
    
    // 최종 점수 계산
    const score = (normalizedNodeCount * nodeCountWeight) +
                  (normalizedEdgeCount * edgeCountWeight) +
                  (normalizedTypeDistribution * typeDistributionWeight) +
                  (normalizedConnectionDensity * connectionDensityWeight);
    
    return Math.round(score);
  }
  
  /**
   * 컨넥텀 통계 정보 반환
   * 노드 유형별 개수, 엣지 수, 복잡도 등을 포함
   */
  getConnectomeStats() {
    const nodeCount = this.connectome.nodes.length;
    const edgeCount = this.connectome.edges.length;
    
    const traitCount = this.connectome.nodes.filter(n => n.type === 'trait').length;
    const interestCount = this.connectome.nodes.filter(n => n.type === 'interest').length;
    const emotionCount = this.connectome.nodes.filter(n => n.type === 'emotion').length;
    const valueCount = this.connectome.nodes.filter(n => n.type === 'value').length;
    
    const negativeRelationships = this.connectome.edges.filter(e => e.weight < 0).length;
    const strongRelationships = this.connectome.edges.filter(e => Math.abs(e.weight) > 5).length;
    
    return {
      totalNodes: nodeCount,
      totalEdges: edgeCount,
      traitCount,
      interestCount,
      emotionCount,
      valueCount,
      negativeRelationships,
      strongRelationships,
      complexity: this.getConnectomeComplexityScore(),
      // 가장 강한 노드들 (각 유형별 최상위 1개)
      strongestNodes: {
        trait: this.getTopNodes('trait', 1)[0],
        interest: this.getTopNodes('interest', 1)[0],
        emotion: this.getTopNodes('emotion', 1)[0],
        value: this.getTopNodes('value', 1)[0]
      }
    };
  }
}

export default ConnectomeManager; 