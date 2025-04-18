-- 대화 테이블
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  dopple_id TEXT NOT NULL,
  title TEXT,
  summary TEXT,
  start_time BIGINT NOT NULL,
  end_time BIGINT,
  message_count INT DEFAULT 0,
  last_message TEXT,
  last_message_time BIGINT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 대화만 볼 수 있음
CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 대화만 생성할 수 있음
CREATE POLICY "Users can insert their own conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 대화만 업데이트할 수 있음
CREATE POLICY "Users can update their own conversations"
  ON conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  dopple_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  image_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 메시지만 볼 수 있음
CREATE POLICY "Users can view their own messages"
  ON chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 메시지만 생성할 수 있음
CREATE POLICY "Users can insert their own messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 메시지 카운트 증가를 위한 함수
CREATE OR REPLACE FUNCTION increment(x INT, row_id TEXT, tbl TEXT, col TEXT)
RETURNS INT LANGUAGE SQL SECURITY DEFINER AS $$
  UPDATE "public"."conversations"
  SET "message_count" = "message_count" + x
  WHERE "id" = row_id
  RETURNING "message_count";
$$; 