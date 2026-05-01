export const INITIAL_PROGRESS = [
  { level_id: 'vowels-1', category: 'Basics', status: 'unlocked', score: 0 },
  { level_id: 'vowels-2', category: 'Basics', status: 'locked', score: 0 },
  { level_id: 'consonants-1', category: 'Basics', status: 'locked', score: 0 },
  { level_id: 'consonants-2', category: 'Basics', status: 'locked', score: 0 },
  { level_id: 'greetings-1', category: 'Conversation', status: 'locked', score: 0 },
  { level_id: 'greetings-2', category: 'Conversation', status: 'locked', score: 0 },
  { level_id: 'numbers-1', category: 'Basics', status: 'locked', score: 0 },
  { level_id: 'family-1', category: 'Conversation', status: 'locked', score: 0 },
  { level_id: 'food-1', category: 'Daily Life', status: 'locked', score: 0 },
  { level_id: 'travel-1', category: 'Daily Life', status: 'locked', score: 0 },
  { level_id: 'emotions-1', category: 'Advanced', status: 'locked', score: 0 },
  { level_id: 'business-1', category: 'Advanced', status: 'locked', score: 0 },
];

export const LESSONS: Record<string, any> = {
  'vowels-1': {
    title: 'Vowels Part 1 (ಸ್ವರಗಳು)',
    items: [
      { q: 'ಅ', a: 'a', t: 'As in Apple' },
      { q: 'ಆ', a: 'aa', t: 'As in Father' },
      { q: 'ಇ', a: 'i', t: 'As in It' },
      { q: 'ಈ', a: 'ee', t: 'As in Eat' },
    ]
  },
  'vowels-2': {
    title: 'Vowels Part 2',
    items: [
      { q: 'ಉ', a: 'u', t: 'As in Put' },
      { q: 'ಊ', a: 'uu', t: 'As in Moon' },
      { q: 'ಋ', a: 'ru', t: 'As in Rhythm' },
      { q: 'ಎ', a: 'e', t: 'As in Egg' },
      { q: 'ಏ', a: 'ee', t: 'As in Aim' },
    ]
  },
  'consonants-1': {
    title: 'Consonants Part 1 (ವ್ಯಂಜನಗಳು)',
    items: [
      { q: 'ಕ', a: 'ka', t: 'As in Kite' },
      { q: 'ಖ', a: 'kha', t: 'As in Khan' },
      { q: 'ಗ', a: 'ga', t: 'As in Goat' },
      { q: 'ಘ', a: 'gha', t: 'As in Ghost' },
    ]
  },
  'greetings-1': {
    title: 'Basic Greetings',
    items: [
      { q: 'ನಮಸ್ಕಾರ', a: 'Namaskara', t: 'Hello / Respectful Greeting' },
      { q: 'ಹೇಗಿದ್ದೀರಾ?', a: 'Hegiddira?', t: 'How are you?' },
      { q: 'ಧನ್ಯವಾದ', a: 'Dhanyavada', t: 'Thank you' },
      { q: 'ಶುಭ ಮುಂಜಾನೆ', a: 'Shubha munjane', t: 'Good morning' },
    ]
  },
  'numbers-1': {
    title: 'Numbers 1-5',
    items: [
      { q: 'ಒಂದು', a: 'ondu', t: 'One' },
      { q: 'ಎರಡು', a: 'eradu', t: 'Two' },
      { q: 'ಮೂರು', a: 'mooru', t: 'Three' },
      { q: 'ನಾಲ್ಕು', a: 'naalku', t: 'Four' },
      { q: 'ಐದು', a: 'aidu', t: 'Five' },
    ]
  }
};

export const STORIES: any[] = [
  { id: 'market-trip', title: 'A Trip to the Market', level: 'Beginner' },
  { id: 'forest-friend', title: 'The Friendly Elephant', level: 'Intermediate' }
];

export const STORY_CONTENT: Record<string, any> = {
  'market-trip': {
    title: 'A Trip to the Market (ಮಾರುಕಟ್ಟೆಗೆ ಪ್ರಯಾಣ)',
    scenes: [
      {
        id: 'start',
        text: 'ನಮಸ್ಕಾರ! ನಾನು ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗುತ್ತಿದ್ದೇನೆ.',
        transliteration: 'Namaskara! Naanu maarukattege hoguttiddene.',
        translation: 'Hello! I am going to the market.',
        image: 'https://picsum.photos/seed/market/800/400',
        choices: [
          { text: 'ನಾನೂ ಬರುತ್ತೇನೆ (I will also come)', next: 'join' },
          { text: 'ಶುಭ ಪ್ರಯಾಣ (Have a good trip)', next: 'goodbye' }
        ]
      },
      {
        id: 'join',
        text: 'ಬನ್ನಿ! ನಮಗೆ ಹಣ್ಣುಗಳು ಬೇಕು.',
        transliteration: 'Banni! Namage hannugalu beku.',
        translation: 'Come! We need fruits.',
        image: 'https://picsum.photos/seed/fruits/800/400',
        choices: [
          { text: 'ಸೇಬು ಎಷ್ಟಿದೆ? (How much is the apple?)', next: 'apple' },
          { text: 'ಬಾಳೆಹಣ್ಣು ಬೇಕು (I want banana)', next: 'banana' }
        ]
      },
      {
        id: 'apple',
        text: 'ಸೇಬು ಹತ್ತು ರೂಪಾಯಿ.',
        transliteration: 'Sebu hattu roopaayi.',
        translation: 'Apple is ten rupees.',
        image: 'https://picsum.photos/seed/apple/800/400',
        choices: [
          { text: 'ಧನ್ಯವಾದ (Thank you)', next: 'end' }
        ]
      },
      {
        id: 'banana',
        text: 'ಬಾಳೆಹಣ್ಣು ಐದು ರೂಪಾಯಿ.',
        transliteration: 'Baalehannu aidu roopaayi.',
        translation: 'Banana is five rupees.',
        image: 'https://picsum.photos/seed/banana/800/400',
        choices: [
          { text: 'ಧನ್ಯವಾದ (Thank you)', next: 'end' }
        ]
      },
      {
        id: 'goodbye',
        text: 'ಧನ್ಯವಾದ! ಮತ್ತೆ ಸಿಗೋಣ.',
        transliteration: 'Dhanyavada! Matte sigona.',
        translation: 'Thank you! See you again.',
        image: 'https://picsum.photos/seed/bye/800/400',
        choices: [
          { text: 'ಮತ್ತೆ ಸಿಗೋಣ (See you again)', next: 'end' }
        ]
      },
      {
        id: 'end',
        text: 'ಕಥೆ ಮುಗಿಯಿತು.',
        transliteration: 'Kathe mugiyitu.',
        translation: 'The story ended.',
        image: 'https://picsum.photos/seed/end/800/400',
        choices: []
      }
    ]
  }
};

export const CULTURE: any[] = [
  {
    id: 'hampi',
    title: 'The Glory of Hampi',
    description: 'Hampi was the capital of the Vijayanagara Empire. It is a UNESCO World Heritage site known for its stunning architecture.',
    image: 'https://picsum.photos/seed/hampi/800/400',
    kannada_fact: 'ಹಂಪಿ ವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯದ ರಾಜಧಾನಿಯಾಗಿತ್ತು.'
  },
  {
    id: 'yakshagana',
    title: 'Yakshagana Art',
    description: 'A traditional folk dance-drama from coastal Karnataka, combining dance, music, and dialogue.',
    image: 'https://picsum.photos/seed/dance/800/400',
    kannada_fact: 'ಯಕ್ಷಗಾನ ಕರ್ನಾಟಕದ ಒಂದು ಪ್ರಸಿದ್ಧ ಕಲೆ.'
  },
  {
    id: 'kuvempu',
    title: 'Kuvempu (Rashtrakavi)',
    description: 'Kuppali Venkatappa Puttappa, popularly known as Kuvempu, was a great Kannada poet and writer.',
    image: 'https://picsum.photos/seed/poet/800/400',
    kannada_fact: 'ಕುವೆಂಪು ಅವರು ಕನ್ನಡದ ಶ್ರೇಷ್ಠ ಕವಿ.'
  }
];
