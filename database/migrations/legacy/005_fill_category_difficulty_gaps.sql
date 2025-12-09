-- Fill remaining gaps in category/difficulty matrix
-- Focused on missing difficulty levels using multi-category approach

INSERT INTO questions (question, answers, correct_answer_index, categories, difficulty) VALUES

-- Food and Cooking - filling major gaps (1, 2, 3, 5, 7, 8)
(
  'Which common kitchen ingredient, produced by bees, never spoils and has been found edible in ancient Egyptian tombs?',
  ARRAY['Olive oil', 'Honey', 'Salt', 'Vinegar'],
  1,
  ARRAY['Food and Cooking', 'General Knowledge'],
  0.05
),

(
  'What Italian dish, whose name means "little strings," is traditionally served with tomato sauce or meatballs?',
  ARRAY['Ravioli', 'Spaghetti', 'Lasagna', 'Fettuccine'],
  1,
  ARRAY['Food and Cooking'],
  0.18
),

(
  'Which cooking method uses dry heat in an enclosed space, commonly used for bread, cakes, and roasted meats?',
  ARRAY['Grilling', 'Baking', 'Steaming', 'Frying'],
  1,
  ARRAY['Food and Cooking'],
  0.25
),

(
  'What fermentation process, used in making cheese and yogurt, involves beneficial bacteria converting lactose into lactic acid?',
  ARRAY['Alcoholic fermentation', 'Lactic acid fermentation', 'Acetic fermentation', 'Malolactic fermentation'],
  1,
  ARRAY['Food and Cooking', 'Science and Technology'],
  0.68
),

(
  'Which culinary technique involves cooking food slowly in fat at low temperatures, traditionally used to preserve duck or pork?',
  ARRAY['Braising', 'Confit', 'Sous vide', 'Poaching'],
  1,
  ARRAY['Food and Cooking'],
  0.78
),

-- Music and Performing Arts - filling gaps (1, 2, 6, 8)
(
  'How many strings does a standard acoustic guitar have?',
  ARRAY['4', '5', '6', '7'],
  2,
  ARRAY['Music and Performing Arts', 'General Knowledge'],
  0.08
),

(
  'What is the name of the curved stick used by a conductor to lead an orchestra?',
  ARRAY['Staff', 'Wand', 'Baton', 'Rod'],
  2,
  ARRAY['Music and Performing Arts'],
  0.19
),

(
  'Which baroque composer, who went blind late in life, is famous for works like the Brandenburg Concertos and the Goldberg Variations?',
  ARRAY['Handel', 'Bach', 'Vivaldi', 'Telemann'],
  1,
  ARRAY['Music and Performing Arts', 'History', 'Art, Literature, and Culture'],
  0.62
),

(
  'What complex musical form, characterized by intricate counterpoint and typically featuring exposition, development, and recapitulation sections, was perfected by Mozart and Beethoven?',
  ARRAY['Rondo', 'Sonata', 'Canon', 'Theme and Variations'],
  1,
  ARRAY['Music and Performing Arts'],
  0.82
),

-- Mythology and Religion - filling gaps (1, 2, 6, 8)
(
  'In Christianity, how many apostles did Jesus have?',
  ARRAY['10', '11', '12', '13'],
  2,
  ARRAY['Mythology and Religion', 'General Knowledge'],
  0.09
),

(
  'What sacred river in India is considered holy in the Hindu religion?',
  ARRAY['Indus', 'Ganges', 'Brahmaputra', 'Yamuna'],
  1,
  ARRAY['Mythology and Religion', 'Geography, Nature, and Environment'],
  0.22
),

(
  'In Egyptian mythology, which god with the head of a jackal was responsible for guiding souls to the afterlife and weighing their hearts?',
  ARRAY['Ra', 'Osiris', 'Anubis', 'Horus'],
  2,
  ARRAY['Mythology and Religion', 'History'],
  0.58
),

(
  'What ancient Zoroastrian concept of cosmic dualism influenced later monotheistic religions with its eternal conflict between good and evil forces?',
  ARRAY['Yin and Yang', 'Ahura Mazda vs Angra Mainyu', 'Brahman and Maya', 'Logos and Chaos'],
  1,
  ARRAY['Mythology and Religion', 'History'],
  0.88
),

-- Sports, Games, and Entertainment - filling gaps (4, 5, 7, 9)
(
  'In which sport would you perform a \"slam dunk\" by jumping and forcing the ball through the hoop from above?',
  ARRAY['Volleyball', 'Basketball', 'Handball', 'Netball'],
  1,
  ARRAY['Sports, Games, and Entertainment'],
  0.32
),

(
  'What card game, often associated with casinos, aims to reach a hand value of 21 without going over?',
  ARRAY['Poker', 'Blackjack', 'Baccarat', 'Rummy'],
  1,
  ARRAY['Sports, Games, and Entertainment'],
  0.48
),

(
  'Which martial art, developed in Brazil, emphasizes ground fighting and submission holds, and was prominently featured in early UFC competitions?',
  ARRAY['Judo', 'Brazilian Jiu-Jitsu', 'Sambo', 'Wrestling'],
  1,
  ARRAY['Sports, Games, and Entertainment', 'Geography, Nature, and Environment'],
  0.72
),

(
  'In competitive speedcubing, what advanced algorithm-based method, named after its creator Jessica Fridrich, is used by most world record holders to solve the Rubik''s Cube?',
  ARRAY['Roux Method', 'CFOP Method', 'Petrus Method', 'ZZ Method'],
  1,
  ARRAY['Sports, Games, and Entertainment'],
  0.92
),

-- Business and Economics - filling gaps (6, 7, 8, 10)
(
  'What economic indicator, measuring the total value of all goods and services produced in a country, is commonly used to gauge economic health?',
  ARRAY['CPI', 'GDP', 'Interest Rate', 'Unemployment Rate'],
  1,
  ARRAY['Business and Economics'],
  0.57
),

(
  'Which investment strategy involves buying and holding a diversified portfolio across multiple asset classes to minimize risk?',
  ARRAY['Day trading', 'Asset allocation', 'Short selling', 'Leveraged investing'],
  1,
  ARRAY['Business and Economics'],
  0.69
),

(
  'What macroeconomic theory, developed by John Maynard Keynes, advocates for government intervention during recessions through increased spending?',
  ARRAY['Supply-side economics', 'Keynesian economics', 'Monetarism', 'Austrian economics'],
  1,
  ARRAY['Business and Economics', 'History'],
  0.77
),

(
  'Which complex financial derivative, whose misuse contributed to the 2008 financial crisis, involves bundling mortgages and selling them as securities?',
  ARRAY['Stock options', 'Credit default swaps', 'Collateralized debt obligations', 'Futures contracts'],
  2,
  ARRAY['Business and Economics'],
  0.95
),

-- High difficulty questions (9-10) for remaining categories
(
  'What rhetorical device, used extensively in James Joyce''s "Finnegans Wake," involves blending multiple words to create new meanings with layered significance?',
  ARRAY['Synecdoche', 'Portmanteau', 'Metonymy', 'Chiasmus'],
  1,
  ARRAY['Art, Literature, and Culture'],
  0.89
),

(
  'Which geological process, occurring at convergent plate boundaries, causes one tectonic plate to slide beneath another into the mantle?',
  ARRAY['Rifting', 'Subduction', 'Obduction', 'Transform faulting'],
  1,
  ARRAY['Geography, Nature, and Environment', 'Science and Technology'],
  0.84
),

(
  'What quantum field theory prediction, experimentally confirmed in 2012 with the discovery of a particle at CERN, explains how particles acquire mass?',
  ARRAY['String theory', 'Higgs mechanism', 'Supersymmetry', 'Loop quantum gravity'],
  1,
  ARRAY['Science and Technology'],
  0.94
);

-- Verify improved coverage
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
