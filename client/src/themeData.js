export const THEME_DATA = {
  romantic: {
    label: 'Romantic Experience',
    title: 'Roses &\nCandlelight',
    tagline: 'Walk into a room where the world melts away — just warm candlelight, the scent of fresh roses, and the one person who matters most.',
    story: 'The door opens. Thousands of rose petals lie scattered across the floor, leading your gaze toward a candlelit tablescape glowing in amber and gold. Soft strings play in the background — a song chosen just for tonight. Every detail exists for a single purpose: to make this moment impossible to forget.',
    tags: ['Perfect for Proposals 💍', 'Best for Anniversaries ❤️', 'Date Night ✨'],
    video: '/themes/romantic/romantic.mp4',
    gallery: [
      { src: '/themes/romantic/romantic1.webp', label: 'Rose Setup' },
      { src: '/themes/romantic/romantic2.webp', label: 'Candlelit Table' },
      { src: '/themes/romantic/romantic3.webp', label: 'Petal Arrangement' },
      { src: '/themes/romantic/romantic4.webp', label: 'Intimate Corner' },
      { src: null, emoji: '🌹', label: 'Rose Arch' },
      { src: null, emoji: '🕯️', label: 'Candle Path' }
    ],
    includes: [
      'Rose petal arrangement', 'Scented candle setup',
      'String fairy lights', 'Welcome drink for 2',
      'Personalized message board', 'Background music setup',
      'Photography assistance', 'Complimentary dessert'
    ],
    price: '₹4,999',
    priceNote: 'for 2 guests · 2 hrs',
    urgency: 'Only 2 slots left this weekend',
    bgFallback: '/themes/romantic/romantic1.webp'
  },
  birthday: {
    label: 'Birthday Celebration',
    title: 'Your\nSpecial Day',
    tagline: 'Because every birthday deserves a room that screams celebration — vibrant, joyful, and entirely yours.',
    story: "The moment they walk in, eyes wide, hands over their mouth — that's the reaction we live for. Balloon arches frame the room in colour, a custom banner bears their name, and the air hums with the anticipation of a night that's about to become a story they'll tell for years.",
    tags: ['Solo Birthdays 🎂', 'Group Parties 🎉', 'Milestone Moments 🥂'],
    video: null,
    gallery: [
      { src: null, emoji: '🎂', label: 'Cake Setup' },
      { src: null, emoji: '🎈', label: 'Balloon Arch' },
      { src: null, emoji: '🎁', label: 'Gift Station' },
      { src: null, emoji: '🎉', label: 'Confetti Rain' },
      { src: null, emoji: '🤳', label: 'Photo Booth' },
      { src: null, emoji: '🕯️', label: 'Candle Moment' }
    ],
    includes: [
      'Balloon arch & décor', 'Custom birthday banner',
      'Themed table setup', 'Cake cutting service',
      'Party poppers & confetti', 'Polaroid photo station',
      'Music & ambiance setup', 'Party favors'
    ],
    price: '₹6,499',
    priceNote: 'up to 10 guests · 3 hrs',
    urgency: 'Only 3 slots left this weekend',
    bgFallback: null
  },
  surprise: {
    label: 'Surprise Experience',
    title: 'The Grand\nReveal',
    tagline: 'You handle showing up. We handle every last secret — perfectly timed, perfectly set, perfectly impossible to expect.',
    story: "They think they're coming in for something ordinary. Then the door opens. The setup is breathtaking. The music swells. Every face in the room is watching — and in that split second, everything shifts. The surprise lands exactly as planned, and the look on their face makes every detail worth it.",
    tags: ['Surprise Proposals 💍', 'Blind Celebrations 🙈', 'Secret Events 🎊'],
    video: null,
    gallery: [
      { src: null, emoji: '🎁', label: 'The Reveal' },
      { src: null, emoji: '✨', label: 'Sparkle Moment' },
      { src: null, emoji: '🎊', label: 'Confetti Drop' },
      { src: null, emoji: '🥂', label: 'Toast Time' },
      { src: null, emoji: '📸', label: 'Capture It' },
      { src: null, emoji: '🌟', label: 'Magic Setup' }
    ],
    includes: [
      'Secret coordination service', 'Dramatic reveal setup',
      'Flash mob arrangement', 'Hidden camera assistance',
      'Custom message timing', 'Surprise music cue',
      'Gift wrapping service', 'Keepsake memory box'
    ],
    price: '₹5,999',
    priceNote: 'up to 8 guests · 2.5 hrs',
    urgency: 'Only 1 slot left this weekend',
    bgFallback: null
  }
};
