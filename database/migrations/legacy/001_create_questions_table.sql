-- Questions table schema for Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answers TEXT[] NOT NULL CHECK (array_length(answers, 1) >= 2),
  correct_answer_index INTEGER NOT NULL CHECK (correct_answer_index >= 0),
  category TEXT NOT NULL,
  difficulty NUMERIC NOT NULL CHECK (difficulty >= 0 AND difficulty <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to questions
CREATE POLICY "Questions are viewable by everyone" 
  ON questions FOR SELECT 
  USING (true);

-- Only authenticated users can insert/update/delete (for admin later)
CREATE POLICY "Authenticated users can insert questions" 
  ON questions FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update questions" 
  ON questions FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete questions" 
  ON questions FOR DELETE 
  TO authenticated 
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_questions_updated_at 
  BEFORE UPDATE ON questions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample questions
INSERT INTO questions (question, answers, correct_answer_index, category, difficulty) VALUES
  ('What is the capital of France?', ARRAY['London', 'Paris', 'Berlin', 'Madrid'], 1, 'Geography', 0.1),
  ('Which planet is known as the Red Planet?', ARRAY['Venus', 'Jupiter', 'Mars', 'Saturn'], 2, 'Science', 0.15),
  ('Who painted the Mona Lisa?', ARRAY['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'], 2, 'Art', 0.3),
  ('What is the largest ocean on Earth?', ARRAY['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'], 3, 'Geography', 0.2),
  ('In what year did World War II end?', ARRAY['1943', '1944', '1945', '1946'], 2, 'History', 0.35),
  ('What is the chemical symbol for gold?', ARRAY['Go', 'Gd', 'Au', 'Ag'], 2, 'Science', 0.4),
  ('Who wrote "Romeo and Juliet"?', ARRAY['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], 1, 'Literature', 0.2),
  ('What is the speed of light in vacuum?', ARRAY['299,792 km/s', '150,000 km/s', '450,000 km/s', '100,000 km/s'], 0, 'Science', 0.7);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS questions_category_idx ON questions(category);
CREATE INDEX IF NOT EXISTS questions_difficulty_idx ON questions(difficulty);
