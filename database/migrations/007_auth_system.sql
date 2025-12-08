-- Authentication System Migration
-- Creates users, player_stats, and game_sessions tables with RLS policies

-- =====================================================
-- 1. USERS TABLE (Profile Data)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- =====================================================
-- 2. PLAYER_STATS TABLE (Aggregated Statistics)
-- =====================================================
CREATE TABLE IF NOT EXISTS player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  UNIQUE(user_id)
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_player_stats_user_id ON player_stats(user_id);

-- =====================================================
-- 3. GAME_SESSIONS TABLE (Individual Game History)
-- =====================================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- nullable for anonymous play
  score INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_completed ON game_sessions(completed);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Player stats policies
CREATE POLICY "Users can view their own stats"
  ON player_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON player_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON player_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Game sessions policies
CREATE POLICY "Users can view their own game sessions"
  ON game_sessions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own game sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own game sessions"
  ON game_sessions FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- 5. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to create player_stats when user is created
CREATE OR REPLACE FUNCTION create_player_stats_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO player_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create player_stats
CREATE TRIGGER create_player_stats_on_user_insert
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_player_stats_for_new_user();

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function to update player stats after a game session
CREATE OR REPLACE FUNCTION update_player_stats_from_session(session_id UUID)
RETURNS VOID AS $$
DECLARE
  session_record RECORD;
BEGIN
  -- Get the session data
  SELECT * INTO session_record FROM game_sessions WHERE id = session_id;
  
  IF session_record.user_id IS NULL THEN
    -- Skip if anonymous session
    RETURN;
  END IF;

  -- Update player stats
  UPDATE player_stats
  SET
    questions_answered = questions_answered + session_record.questions_answered,
    correct_answers = correct_answers + session_record.correct_answers,
    incorrect_answers = incorrect_answers + session_record.incorrect_answers
  WHERE user_id = session_record.user_id;
END;
$$ LANGUAGE plpgsql;
