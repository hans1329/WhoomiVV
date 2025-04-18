import { Connectome } from '@/types/character';

// Sample connectome data for a creative, music-loving character
export const sampleConnectome: Connectome = {
  nodes: [
    // Traits
    { id: 'trait_1', name: '창의성', type: 'trait', strength: 9, description: '창의적인 사고와 표현 능력' },
    { id: 'trait_2', name: '호기심', type: 'trait', strength: 8, description: '새로운 것을 탐구하고 배우려는 열망' },
    { id: 'trait_3', name: '개방성', type: 'trait', strength: 7, description: '새로운 경험과 아이디어에 대한 개방적 태도' },
    { id: 'trait_4', name: '감수성', type: 'trait', strength: 8, description: '감정적 자극에 대한 높은 반응성' },
    { id: 'trait_5', name: '인내심', type: 'trait', strength: 6, description: '어려움 속에서도 꾸준히 노력하는 능력' },
    { id: 'trait_6', name: '완벽주의', type: 'trait', strength: 7, description: '높은 기준과 세부사항에 대한 주의' },
    
    // Interests
    { id: 'interest_1', name: '음악', type: 'interest', strength: 10, description: '음악 듣기, 연주, 작곡에 대한 열정' },
    { id: 'interest_2', name: '미술', type: 'interest', strength: 7, description: '시각 예술과 디자인에 대한 관심' },
    { id: 'interest_3', name: '문학', type: 'interest', strength: 8, description: '독서와 글쓰기에 대한 애정' },
    { id: 'interest_4', name: '기술', type: 'interest', strength: 6, description: '신기술과 디지털 창작에 대한 관심' },
    { id: 'interest_5', name: '여행', type: 'interest', strength: 7, description: '새로운 장소와 문화를 탐험하는 즐거움' },
    
    // Emotions
    { id: 'emotion_1', name: '기쁨', type: 'emotion', strength: 8, description: '행복감과 만족감을 느끼는 경향' },
    { id: 'emotion_2', name: '우울함', type: 'emotion', strength: 6, description: '때때로 깊은 사색과 멜랑콜리에 빠지는 상태' },
    { id: 'emotion_3', name: '열정', type: 'emotion', strength: 9, description: '강한 동기부여와 에너지를 느끼는 상태' },
    { id: 'emotion_4', name: '불안', type: 'emotion', strength: 5, description: '새로운 도전이나 불확실성에 대한 염려' },
    { id: 'emotion_5', name: '공감', type: 'emotion', strength: 8, description: '타인의 감정을 이해하고 공유하는 능력' },
    
    // Values
    { id: 'value_1', name: '진정성', type: 'value', strength: 9, description: '자신과 타인에 대해 진실되고 정직하게 대하는 가치' },
    { id: 'value_2', name: '자유', type: 'value', strength: 8, description: '자율성과 독립성을 중시' },
    { id: 'value_3', name: '배움', type: 'value', strength: 9, description: '지식과 성장을 추구하는 가치' },
    { id: 'value_4', name: '아름다움', type: 'value', strength: 8, description: '미적 경험과 조화를 중시' },
    { id: 'value_5', name: '연결성', type: 'value', strength: 7, description: '타인과의 의미 있는 관계를 중시' }
  ],
  
  edges: [
    // Trait-trait connections
    { source: 'trait_1', target: 'trait_2', weight: 8, description: '창의성과 호기심은 서로를 강화한다' },
    { source: 'trait_1', target: 'trait_3', weight: 7, description: '창의성은 개방성에 의해 촉진된다' },
    { source: 'trait_1', target: 'trait_6', weight: -4, description: '때로는 완벽주의가 창의적 표현을 방해한다' },
    { source: 'trait_2', target: 'trait_3', weight: 8, description: '호기심이 많을수록 새로운 경험에 개방적이다' },
    { source: 'trait_4', target: 'trait_6', weight: 5, description: '감수성이 높으면 세부 사항에 주의를 기울이게 된다' },
    { source: 'trait_5', target: 'trait_6', weight: 6, description: '인내심이 있으면 완벽을 추구할 수 있다' },
    
    // Trait-interest connections
    { source: 'trait_1', target: 'interest_1', weight: 9, description: '창의성은 음악 창작과 감상에 큰 영향을 미친다' },
    { source: 'trait_1', target: 'interest_2', weight: 7, description: '창의성은 미술 활동과 감상을 촉진한다' },
    { source: 'trait_1', target: 'interest_3', weight: 7, description: '창의성은 문학 창작에 기여한다' },
    { source: 'trait_2', target: 'interest_4', weight: 6, description: '호기심은 새로운 기술 탐구를 자극한다' },
    { source: 'trait_2', target: 'interest_5', weight: 7, description: '호기심이 많은 사람은 여행을 즐긴다' },
    { source: 'trait_3', target: 'interest_5', weight: 6, description: '개방적인 사람은 새로운 여행 경험을 선호한다' },
    { source: 'trait_4', target: 'interest_1', weight: 8, description: '감수성이 높으면 음악에 깊이 감응한다' },
    { source: 'trait_4', target: 'interest_3', weight: 7, description: '감수성은 문학적 표현과 감상에 영향을 준다' },
    
    // Trait-emotion connections
    { source: 'trait_1', target: 'emotion_3', weight: 8, description: '창의성은 열정을 불러일으킨다' },
    { source: 'trait_4', target: 'emotion_2', weight: 5, description: '높은 감수성은 때로 우울한 감정을 깊게 한다' },
    { source: 'trait_4', target: 'emotion_5', weight: 7, description: '감수성은 타인에 대한 공감 능력을 높인다' },
    { source: 'trait_6', target: 'emotion_4', weight: 6, description: '완벽주의는 불안을 증가시킬 수 있다' },
    
    // Interest-emotion connections
    { source: 'interest_1', target: 'emotion_1', weight: 9, description: '음악은 기쁨을 가져다 준다' },
    { source: 'interest_1', target: 'emotion_3', weight: 8, description: '음악은 열정을 불러일으킨다' },
    { source: 'interest_2', target: 'emotion_1', weight: 6, description: '미술 활동은 기쁨을 준다' },
    { source: 'interest_3', target: 'emotion_2', weight: 5, description: '문학은 때로 우울한 감정을 탐구하게 한다' },
    { source: 'interest_5', target: 'emotion_1', weight: 7, description: '여행은 기쁨과 만족감을 준다' },
    
    // Value connections
    { source: 'value_1', target: 'trait_1', weight: 6, description: '진정성은 진실된 창의적 표현을 장려한다' },
    { source: 'value_2', target: 'trait_1', weight: 7, description: '자유를 중시하면 창의성이 발휘된다' },
    { source: 'value_2', target: 'trait_3', weight: 8, description: '자유를 중시하면 더 개방적인 태도를 갖게 된다' },
    { source: 'value_3', target: 'trait_2', weight: 9, description: '배움에 대한 가치는 호기심을 강화한다' },
    { source: 'value_4', target: 'interest_1', weight: 8, description: '아름다움을 중시하는 것은 음악 감상과 관련이 있다' },
    { source: 'value_4', target: 'interest_2', weight: 8, description: '아름다움에 대한 가치는 미술 감상으로 이어진다' },
    { source: 'value_5', target: 'emotion_5', weight: 8, description: '연결성을 중시하면 더 공감하게 된다' },
    
    // Suppression and conflict edges
    { source: 'emotion_4', target: 'emotion_1', weight: -6, description: '불안감은 기쁨을 감소시킨다' },
    { source: 'emotion_2', target: 'emotion_3', weight: -5, description: '우울함은 열정을 약화시킬 수 있다' },
    { source: 'trait_6', target: 'trait_3', weight: -3, description: '완벽주의는 때로 개방성을 제한한다' }
  ]
};

// Sample connectome with fewer nodes for simpler visualization
export const simpleSampleConnectome: Connectome = {
  nodes: [
    { id: 'trait_1', name: '창의성', type: 'trait', strength: 9 },
    { id: 'trait_2', name: '호기심', type: 'trait', strength: 8 },
    { id: 'interest_1', name: '음악', type: 'interest', strength: 10 },
    { id: 'interest_2', name: '미술', type: 'interest', strength: 7 },
    { id: 'emotion_1', name: '기쁨', type: 'emotion', strength: 8 },
    { id: 'emotion_3', name: '열정', type: 'emotion', strength: 9 },
    { id: 'value_3', name: '배움', type: 'value', strength: 9 },
    { id: 'value_4', name: '아름다움', type: 'value', strength: 8 },
  ],
  
  edges: [
    { source: 'trait_1', target: 'trait_2', weight: 8 },
    { source: 'trait_1', target: 'interest_1', weight: 9 },
    { source: 'trait_1', target: 'interest_2', weight: 7 },
    { source: 'trait_2', target: 'value_3', weight: 9 },
    { source: 'interest_1', target: 'emotion_1', weight: 9 },
    { source: 'interest_1', target: 'emotion_3', weight: 8 },
    { source: 'interest_2', target: 'emotion_1', weight: 6 },
    { source: 'value_4', target: 'interest_1', weight: 8 },
    { source: 'value_4', target: 'interest_2', weight: 8 }
  ]
}; 