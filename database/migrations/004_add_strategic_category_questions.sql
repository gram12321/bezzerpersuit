-- Add strategic questions to fill gaps in category/difficulty matrix
-- Each question designed to cover multiple categories when possible

INSERT INTO questions (question, answers, correct_answer_index, categories, difficulty) VALUES

-- High difficulty questions (0.7-1.0) - currently missing across most categories
(
  'Which German physicist, whose uncertainty principle challenged classical mechanics, won the Nobel Prize in Physics in 1932?',
  ARRAY['Max Planck', 'Werner Heisenberg', 'Niels Bohr', 'Erwin Schrödinger'],
  1,
  ARRAY['Science and Technology', 'History'],
  0.75
),

(
  'Which Renaissance polymath wrote backwards in mirror script in his notebooks and designed early concepts for helicopters and tanks?',
  ARRAY['Michelangelo', 'Leonardo da Vinci', 'Galileo Galilei', 'Nicolaus Copernicus'],
  1,
  ARRAY['Art, Literature, and Culture', 'History', 'Science and Technology'],
  0.65
),

(
  'What economic phenomenon, named after a British economist, describes the situation where bad products drive good products out of the market?',
  ARRAY['Keynesian Trap', 'Gresham''s Law', 'Nash Equilibrium', 'Laffer Curve'],
  1,
  ARRAY['Business and Economics'],
  0.85
),

(
  'In Greek mythology, which hero was required to complete twelve labors as penance, including slaying the Nemean Lion?',
  ARRAY['Perseus', 'Theseus', 'Hercules', 'Achilles'],
  2,
  ARRAY['Mythology and Religion', 'Art, Literature, and Culture'],
  0.25
),

(
  'Which spice, derived from the stigma of a flower and requiring thousands of flowers to produce one pound, is the world''s most expensive by weight?',
  ARRAY['Vanilla', 'Saffron', 'Cardamom', 'Truffles'],
  1,
  ARRAY['Food and Cooking', 'Geography, Nature, and Environment'],
  0.55
),

(
  'What is the name of the rapid, complex musical composition style where a single melodic line is successively taken up by different voices, as perfected by Bach?',
  ARRAY['Canon', 'Fugue', 'Sonata', 'Rondo'],
  1,
  ARRAY['Music and Performing Arts'],
  0.7
),

(
  'Which racquet sport, played on a grass court at Wimbledon, uses terms like "deuce" and "advantage" in its scoring system?',
  ARRAY['Badminton', 'Tennis', 'Squash', 'Table Tennis'],
  1,
  ARRAY['Sports, Games, and Entertainment'],
  0.15
),

(
  'Which ancient Indian strategy game, whose name means "four divisions" in Sanskrit, is considered the ancestor of modern chess?',
  ARRAY['Go', 'Pachisi', 'Chaturanga', 'Mancala'],
  2,
  ARRAY['Sports, Games, and Entertainment', 'History'],
  0.8
),

(
  'What type of rock is formed when magma cools and solidifies beneath the Earth''s surface?',
  ARRAY['Sedimentary', 'Metamorphic', 'Igneous', 'Volcanic'],
  2,
  ARRAY['Geography, Nature, and Environment', 'Science and Technology'],
  0.45
),

(
  'Which ancient wonder of the world was a massive statue of the Greek god Helios that stood at the entrance to a harbor?',
  ARRAY['Statue of Zeus', 'Colossus of Rhodes', 'Lighthouse of Alexandria', 'Mausoleum at Halicarnassus'],
  1,
  ARRAY['History', 'Art, Literature, and Culture', 'Geography, Nature, and Environment'],
  0.5
),

(
  'Which number is both the only even prime number and the base of the binary system used in computing?',
  ARRAY['0', '1', '2', '4'],
  2,
  ARRAY['General Knowledge', 'Science and Technology'],
  0.1
),

(
  'What business metric, commonly expressed as a percentage, measures how much profit you gain compared to what you spent?',
  ARRAY['Profit Margin', 'Return on Investment', 'Break-even Point', 'Cash Flow'],
  1,
  ARRAY['Business and Economics', 'General Knowledge'],
  0.2
),

(
  'What French cooking technique uses a two-step hot-then-cold water process to preserve color and texture in vegetables before freezing?',
  ARRAY['Braising', 'Blanching', 'Sautéing', 'Parboiling'],
  1,
  ARRAY['Food and Cooking', 'Art, Literature, and Culture'],
  0.6
),

(
  'Which Italian musical term, literally meaning "growing," indicates that performers should gradually increase volume?',
  ARRAY['Diminuendo', 'Crescendo', 'Forte', 'Allegro'],
  1,
  ARRAY['Music and Performing Arts', 'General Knowledge'],
  0.35
),

(
  'In Norse mythology, Odin owned a legendary steed with eight legs that could travel between worlds. Which mythical creature shares this unusual characteristic of having more than four legs?',
  ARRAY['Pegasus', 'Sleipnir', 'Unicorn', 'Hippogriff'],
  1,
  ARRAY['Mythology and Religion', 'Art, Literature, and Culture'],
  0.65
),

(
  'Which phenomenon causes the sky to appear blue during the day?',
  ARRAY['Reflection', 'Refraction', 'Rayleigh scattering', 'Atmospheric absorption'],
  2,
  ARRAY['Science and Technology', 'General Knowledge', 'Geography, Nature, and Environment'],
  0.7
),

(
  'What is the term for a business that is owned and operated by its members who also use its services?',
  ARRAY['Corporation', 'Cooperative', 'Franchise', 'Partnership'],
  1,
  ARRAY['Business and Economics'],
  0.3
),

(
  'Which ancient empire built Machu Picchu high in the Andes Mountains?',
  ARRAY['Aztec', 'Maya', 'Inca', 'Olmec'],
  2,
  ARRAY['History', 'Geography, Nature, and Environment'],
  0.25
),

(
  'Which Shakespeare comedy features fairies, a magical forest, and a mischievous sprite who famously declares "Lord, what fools these mortals be!"?',
  ARRAY['As You Like It', 'The Tempest', 'A Midsummer Night''s Dream', 'Much Ado About Nothing'],
  2,
  ARRAY['Art, Literature, and Culture'],
  0.4
),

(
  'What Olympic sport combines cross-country skiing and rifle shooting?',
  ARRAY['Nordic Combined', 'Biathlon', 'Modern Pentathlon', 'Ski Jumping'],
  1,
  ARRAY['Sports, Games, and Entertainment'],
  0.55
);

-- Verify coverage
SELECT 
  unnest(categories) as category,
  CASE 
    WHEN difficulty <= 0.1 THEN '1. Trivial'
    WHEN difficulty <= 0.2 THEN '2. Easy Pickings'
    WHEN difficulty <= 0.3 THEN '3. Comfort Zone'
    WHEN difficulty <= 0.4 THEN '4. Brain Tickler'
    WHEN difficulty <= 0.5 THEN '5. Requires Finesse'
    WHEN difficulty <= 0.6 THEN '6. Tricky Territory'
    WHEN difficulty <= 0.7 THEN '7. Brain Buster'
    WHEN difficulty <= 0.8 THEN '8. High-Wire Act'
    WHEN difficulty <= 0.9 THEN '9. PhD-Level Madness'
    ELSE '10. Impossible'
  END as difficulty_level,
  COUNT(*) as count
FROM questions
GROUP BY category, difficulty_level
ORDER BY category, difficulty_level;
