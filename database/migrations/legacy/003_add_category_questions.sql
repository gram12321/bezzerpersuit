-- Add sample questions for each category
-- Following question design guide: reasoning over rote memory

INSERT INTO questions (question, answers, correct_answer_index, categories, difficulty) VALUES

-- Geography, Nature, and Environment
(
  'Which mountain range forms a natural border between Europe and Asia?',
  ARRAY['Alps', 'Ural Mountains', 'Himalayas', 'Carpathians'],
  1,
  ARRAY['Geography, Nature, and Environment', 'General Knowledge'],
  0.4
),

-- Science and Technology
(
  'What happens to water when it freezes in terms of density?',
  ARRAY['It becomes denser', 'It becomes less dense', 'Density stays the same', 'It loses all density'],
  1,
  ARRAY['Science and Technology', 'General Knowledge'],
  0.5
),

-- Art, Literature, and Culture
(
  'Which artistic movement, characterized by dreamlike imagery and unexpected juxtapositions, was led by Salvador Dalí?',
  ARRAY['Impressionism', 'Cubism', 'Surrealism', 'Expressionism'],
  2,
  ARRAY['Art, Literature, and Culture', 'History'],
  0.45
),

-- History
(
  'Which ancient empire was known for building an extensive network of roads including the famous Appian Way?',
  ARRAY['Greek Empire', 'Roman Empire', 'Persian Empire', 'Egyptian Empire'],
  1,
  ARRAY['History', 'Geography, Nature, and Environment'],
  0.3
),

-- Sports, Games, and Entertainment
(
  'In chess, which piece can only move diagonally?',
  ARRAY['Rook', 'Knight', 'Bishop', 'Queen'],
  2,
  ARRAY['Sports, Games, and Entertainment', 'General Knowledge'],
  0.2
),

-- Food and Cooking
(
  'Which fermented product, originating from Korea, is made primarily from napa cabbage and Korean radishes?',
  ARRAY['Sauerkraut', 'Kimchi', 'Miso', 'Tempeh'],
  1,
  ARRAY['Food and Cooking', 'Art, Literature, and Culture'],
  0.35
),

-- Music and Performing Arts
(
  'Which woodwind instrument has a double reed and is known for tuning orchestras?',
  ARRAY['Clarinet', 'Flute', 'Oboe', 'Saxophone'],
  2,
  ARRAY['Music and Performing Arts', 'General Knowledge'],
  0.5
),

-- Business and Economics
(
  'What economic principle states that as price increases, quantity demanded decreases?',
  ARRAY['Law of Supply', 'Law of Demand', 'Elasticity', 'Market Equilibrium'],
  1,
  ARRAY['Business and Economics', 'General Knowledge'],
  0.4
),

-- Mythology and Religion
(
  'In Greek mythology, who was forced to roll a boulder up a hill for eternity?',
  ARRAY['Prometheus', 'Tantalus', 'Sisyphus', 'Icarus'],
  2,
  ARRAY['Mythology and Religion', 'Art, Literature, and Culture'],
  0.45
),

-- General Knowledge
(
  'How many sides does a hexagon have?',
  ARRAY['5', '6', '7', '8'],
  1,
  ARRAY['General Knowledge'],
  0.15
),

-- Multi-category bonus questions
(
  'Which Italian city-state, famous for its canals and Renaissance art, was once a major maritime power?',
  ARRAY['Florence', 'Milan', 'Venice', 'Genoa'],
  2,
  ARRAY['History', 'Geography, Nature, and Environment', 'Art, Literature, and Culture'],
  0.35
),

(
  'What natural phenomenon is measured using the Richter scale?',
  ARRAY['Tornados', 'Earthquakes', 'Hurricanes', 'Tsunamis'],
  1,
  ARRAY['Science and Technology', 'Geography, Nature, and Environment'],
  0.3
),

(
  'Which sport uses terms like "love," "deuce," and "advantage"?',
  ARRAY['Badminton', 'Tennis', 'Squash', 'Table Tennis'],
  1,
  ARRAY['Sports, Games, and Entertainment'],
  0.25
),

(
  'What is the main ingredient in traditional Japanese miso soup besides water?',
  ARRAY['Soy sauce', 'Fermented soybean paste', 'Fish stock', 'Rice vinegar'],
  1,
  ARRAY['Food and Cooking', 'Art, Literature, and Culture'],
  0.4
),

(
  'Which composer became completely deaf but continued to compose masterpieces including his Ninth Symphony?',
  ARRAY['Mozart', 'Bach', 'Beethoven', 'Vivaldi'],
  2,
  ARRAY['Music and Performing Arts', 'History'],
  0.3
),

(
  'What type of business structure protects owners from personal liability for company debts?',
  ARRAY['Sole Proprietorship', 'Partnership', 'Limited Liability Company', 'Franchise'],
  2,
  ARRAY['Business and Economics'],
  0.5
),

(
  'In Norse mythology, what is the name of the hall where warriors who died in battle are taken?',
  ARRAY['Asgard', 'Valhalla', 'Midgard', 'Niflheim'],
  1,
  ARRAY['Mythology and Religion', 'History'],
  0.4
);

-- Verify insertion
SELECT 
  categories,
  COUNT(*) as question_count
FROM questions
GROUP BY categories
ORDER BY question_count DESC;
