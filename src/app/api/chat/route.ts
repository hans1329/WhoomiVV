import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import ChatService, { ChatMessage } from '@/lib/chat-service';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }
    
    const { id: userId } = session.user;
    const { message, doppleId } = await req.json();
    
    // 메시지 필수 체크
    if (!message || !message.content || !doppleId) {
      return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }
    
    // 도플 정보 가져오기
    const { data: dopple, error: doppleError } = await supabase
      .from('dopples')
      .select('*')
      .eq('id', doppleId)
      .eq('user_id', userId)
      .single();
    
    if (doppleError || !dopple) {
      return NextResponse.json({ error: '도플 정보를 찾을 수 없습니다.' }, { status: 404 });
    }
    
    // 이전 대화 내역 가져오기
    const { data: chatMessages, error: chatError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('dopple_id', doppleId)
      .order('created_at', { ascending: true });
    
    if (chatError) {
      return NextResponse.json({ error: '대화 내역을 가져오는데 실패했습니다.' }, { status: 500 });
    }
    
    // 도플 데이터 구성
    const doppleData = {
      id: dopple.id,
      name: dopple.name,
      description: dopple.description,
      image_url: dopple.image_url,
      traits: dopple.traits,
      interests: dopple.interests,
      mbti: dopple.mbti,
      connectome: dopple.connectome
    };
    
    // OpenAI API 키 가져오기
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    // 채팅 서비스 초기화
    const chatService = new ChatService(doppleData, 'user', {
      maxContextSize: 2000,       // 최대 컨텍스트 크기 (토큰 수)
      recentMessagesCount: 5,     // 항상 유지할 최근 메시지 수
      summaryInterval: 8,         // 8개 메시지마다 요약 실행
      compressionRatio: 0.7       // 70%의 정보 유지
    }, openaiApiKey);
    
    // 이전 메시지 설정
    if (chatMessages && chatMessages.length > 0) {
      const formattedMessages = chatMessages.map((msg: any) => ({
        id: msg.id,
        role: msg.role as 'user' | 'dopple' | 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at).getTime()
      }));
      
      chatService.setMessageHistory(formattedMessages);
    }
    
    // 메시지 형식 구성
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.content,
      timestamp: Date.now()
    };
    
    // 응답 생성
    const response = await chatService.generateResponse(userMessage);
    
    // 사용자 메시지와 응답을 DB에 저장
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert([
        {
          dopple_id: doppleId,
          user_id: userId,
          role: 'user',
          content: message.content
        },
        {
          dopple_id: doppleId,
          user_id: userId,
          role: 'dopple',
          content: response.content
        }
      ]);
    
    if (insertError) {
      console.error('메시지 저장 오류:', insertError);
      // 저장 실패해도 응답은 전송
    }
    
    return NextResponse.json({ 
      message: response,
      connectome: chatService.getConnectome(),
      insights: chatService.getTopEntities()
    });
    
  } catch (error) {
    console.error('채팅 처리 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 