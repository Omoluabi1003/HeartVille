import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const rawOrigins = process.env.CORS_ORIGIN ?? '*';
const allowedOrigins =
  rawOrigins === '*'
    ? undefined
    : rawOrigins.split(',').map((origin) => origin.trim()).filter(Boolean);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins ?? '*',
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.join(__dirname, '../public');

const shouldServeMarketingApp = (req) =>
  req.method === 'GET' &&
  !req.path.startsWith('/api') &&
  !req.path.startsWith('/socket.io') &&
  !req.path.includes('.') &&
  req.accepts('html');

if (allowedOrigins) {
  app.use(cors({ origin: allowedOrigins }));
} else {
  app.use(cors());
}
app.use(express.json());
app.use(express.static(staticDir));

const CURRENT_USER_ID = 'user-1';

const profiles = [
  {
    id: 'user-1',
    name: 'Nova Carter',
    age: 29,
    location: 'Austin, TX',
    occupation: 'Product designer at a climate-tech startup',
    tagline: 'Weekday UX nerd, weekend vintage camper explorer',
    bio: 'Curious human who loves prototyping products, playlists, and picnic spreads. Most weekends you can find me chasing the best breakfast tacos or off-grid in my renovated camper van.',
    interests: ['Live music', 'Van life', 'Analog photography', 'National parks', 'Cold brew experiments'],
    prompts: [
      {
        question: 'The hallmark of a great Sunday morning is…',
        answer: 'Sunrise paddle boarding followed by plotting our next tiny adventure.'
      },
      {
        question: 'I geek out on',
        answer: 'Service design, community-built cities, and campfire cooking gadgets.'
      },
      {
        question: 'Green flags',
        answer: 'You’re empathetic, communicate openly, and love surprising friends with thoughtful playlists.'
      }
    ],
    compatibility: 97,
    compatibilityWhy: 'Shared love for intentional living, creative projects, and spontaneous travel days.',
    vibe: 'Warm, intentional, adventure-ready',
    image: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'user-2',
    name: 'Maya Green',
    age: 31,
    location: 'Denver, CO',
    occupation: 'Sustainability strategist',
    tagline: 'Mountain trail chaser with a soft spot for cozy bookstores',
    bio: 'My superpower is turning climate data into community action. When I’m not organizing zero-waste pop-ups, I’m training for my next trail race or hosting a themed dinner party.',
    interests: ['Trail running', 'Community gardening', 'Fermentation', 'Indie bookstores', 'Astrophotography'],
    prompts: [
      {
        question: 'A recent shower thought',
        answer: 'What if every city had a “library of things” so we never had to buy single-use gear again?'
      },
      {
        question: 'Most used emoji',
        answer: '🌱 — because everything can grow if you tend to it.'
      },
      {
        question: 'On my nightstand',
        answer: 'A stack of climate fiction, a Polaroid camera, and lavender oil for winding down.'
      }
    ],
    compatibility: 92,
    compatibilityWhy: 'You both geek out over impact projects, good storytelling, and altitude adventures.',
    vibe: 'Grounded, generous, purposeful',
    image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'user-3',
    name: 'Jasper Lin',
    age: 27,
    location: 'Seattle, WA',
    occupation: 'Machine learning engineer',
    tagline: 'Coffee tasting flights > bar crawls',
    bio: 'I build responsible AI by day and chase the best cortados by night. Currently learning to forage mushrooms and taking improv classes to stay out of my comfort zone.',
    interests: ['Third-wave coffee', 'Improv comedy', 'Foraging', 'Studio pottery', 'Cozy sci-fi'],
    prompts: [
      {
        question: 'In another life I’d be',
        answer: 'A neighborhood cafe owner who curates vinyl listening nights.'
      },
      {
        question: 'Best travel story',
        answer: 'Built a popup espresso bar for my hostel in Kyoto and made friends for life.'
      },
      {
        question: 'I’m learning',
        answer: 'How to surf the Washington coast without sacrificing feeling in my toes.'
      }
    ],
    compatibility: 88,
    compatibilityWhy: 'Complementary balance of grounded energy and playful spontaneity.',
    vibe: 'Thoughtful, witty, quietly bold',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'user-4',
    name: 'Sasha Ibarra',
    age: 34,
    location: 'Brooklyn, NY',
    occupation: 'Community architect',
    tagline: 'Hosting supper clubs & slow fashion swaps',
    bio: 'I design spaces for people to feel seen — sometimes that’s a park, sometimes it’s a neighborhood dinner. Loud laugher, big feeler, always planning the next community experiment.',
    interests: ['Supper clubs', 'Documentary film', 'Slow fashion', 'Urban gardening', 'Ceramics'],
    prompts: [
      {
        question: 'Let’s debate',
        answer: 'Best underrated New York bakery and why it deserves a Michelin star.'
      },
      {
        question: 'Six months from now',
        answer: 'Hosting a neighborhood night market under string lights.'
      },
      {
        question: 'Two truths and a lie',
        answer: 'I once catered a wedding with zero food waste, I’ve run a marathon in crocs, I collect antique postcards.'
      }
    ],
    compatibility: 85,
    compatibilityWhy: 'You connect over community building and creative expression with room to inspire each other.',
    vibe: 'Magnetic, nurturing, celebratory',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  },
];

const matchHistory = [
  {
    id: 'match-1',
    userId: CURRENT_USER_ID,
    targetId: 'user-2',
    compatibility: 92,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    conversationStarters: [
      'Ask Maya about her latest zero-waste pop-up experiment.',
      'Compare trail running routes you both adore.',
      'Swap climate fiction recommendations for cozy fall nights.'
    ],
  },
  {
    id: 'match-2',
    userId: CURRENT_USER_ID,
    targetId: 'user-4',
    compatibility: 85,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    conversationStarters: [
      'Invite Sasha to your favorite community event this month.',
      'Share a dream supper club menu and see what she’d add.',
      'Ask about the last neighborhood experiment that surprised her.'
    ],
  },
];

const messagePreviews = [
  {
    matchId: 'match-1',
    name: 'Maya Green',
    preview: 'Loved your idea about a neighborhood library of things! Want to brainstorm over chai? ☕️',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    matchId: 'match-2',
    name: 'Sasha Ibarra',
    preview: 'String lights & a vinyl DJ? Say less. Let’s co-host the next one. 🎧',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

const compatibilityInsights = {
  totalLikesThisWeek: 18,
  topInterests: [
    { label: 'Community events', count: 12 },
    { label: 'Live music', count: 9 },
    { label: 'Mindful travel', count: 7 },
  ],
  responseRate: 92,
  connectionStrength: 88,
  highlight: 'You spark the most conversations when you mention intentional travel and creative communities. Keep leaning into stories that show how you build spaces for others.',
};

const catalogueAlbum = {
  id: 'omoluabi-catalogue-album',
  title: 'Omoluabi Catalogue Album',
  curator: 'Omoluabi Records',
  releaseDate: '2025-08-15',
  description:
    'An Omoluabi concept album that follows the emotional arc of intentional dating—from first sparks to grounded connection across Lagos, London, and beyond.',
  coverArt:
    'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=900&q=80',
  tags: ['afro-fusion', 'intentional pop', 'concept album'],
  tracks: [
    {
      id: 'track-starlit-signals',
      title: 'Starlit Signals',
      artist: 'Nova Carter',
      duration: '3:18',
      mood: 'Dreamy electro-soul for reflective night walks after a new match.',
      url: 'https://suno.com/s/starlit-signals-heartville',
      tags: ['dreamy', 'electro-soul', 'night drive'],
    },
    {
      id: 'track-lantern-conversations',
      title: 'Lantern Conversations',
      artist: 'Maya Green & Jasper Lin',
      duration: '2:54',
      mood: 'Acoustic warmth for the first real conversation that lingers past midnight.',
      url: 'https://suno.com/s/lantern-conversations-heartville',
      tags: ['acoustic', 'warm', 'duet'],
    },
    {
      id: 'NLfUnFJQPLg3HEmE',
      title: 'Love Without Empathy',
      artist: 'McD',
      duration: '2:58',
      mood: 'A moody alt-pop reflection on choosing empathy over performance.',
      url: 'https://suno.com/s/NLfUnFJQPLg3HEmE',
      tags: ['alt-pop', 'moody', 'introspective', 'omoluabi'],
      spotlight: true,
    },
  ],
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/profiles', (_req, res) => {
  res.json({ profiles });
});

app.get('/api/profiles/:id', (req, res) => {
  const profile = profiles.find((p) => p.id === req.params.id);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json({ profile });
});

app.get('/api/matches', (req, res) => {
  const userId = req.query.userId ?? CURRENT_USER_ID;
  const matches = matchHistory
    .filter((match) => match.userId === userId)
    .map((match) => ({
      ...match,
      profile: profiles.find((profile) => profile.id === match.targetId),
    }));
  res.json({ matches });
});

app.get('/api/messages', (req, res) => {
  const userId = req.query.userId ?? CURRENT_USER_ID;
  const matchesForUser = matchHistory.filter((match) => match.userId === userId);
  const relevantPreviews = messagePreviews.filter((preview) =>
    matchesForUser.some((match) => match.id === preview.matchId)
  );
  res.json({ messages: relevantPreviews });
});

app.get('/api/insights', (_req, res) => {
  res.json({ insights: compatibilityInsights });
});

app.get('/api/catalogue', (_req, res) => {
  res.json({ album: catalogueAlbum });
});

app.get('/api/tracks/search', (req, res) => {
  const query = (req.query.q ?? '').toString().trim().toLowerCase();
  const tracks = catalogueAlbum.tracks ?? [];

  if (!query) {
    return res.json({ tracks });
  }

  const results = tracks.filter((track) => {
    const haystack = [
      track.title,
      track.artist,
      track.mood,
      ...(track.tags ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });

  res.json({ tracks: results });
});

app.post('/api/matches', (req, res) => {
  const userId = req.body?.userId ?? CURRENT_USER_ID;
  const targetId = req.body?.targetId;
  const isSuperLike = Boolean(req.body?.superLike);

  if (!targetId) {
    return res.status(400).json({ error: 'targetId is required' });
  }

  const profile = profiles.find((candidate) => candidate.id === targetId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const existingMatch = matchHistory.find(
    (match) => match.userId === userId && match.targetId === targetId
  );

  const baseCompatibility = profile.compatibility ?? 80;
  const compatibility = Math.min(99, baseCompatibility + (isSuperLike ? 3 : 0));

  const match = existingMatch ?? {
    id: `match-${Date.now()}`,
    userId,
    targetId,
    compatibility,
    createdAt: new Date().toISOString(),
    conversationStarters: [
      `Ask ${profile.name.split(' ')[0]} about their favorite ${profile.interests[0].toLowerCase()}.`,
      `Share a story that shows your ${profile.vibe.toLowerCase()} energy.`,
      'Plan a mini-adventure you could co-create this month.',
    ],
  };

  if (!existingMatch) {
    matchHistory.unshift(match);
    io.emit('new-match', {
      ...match,
      profile,
    });
  }

  res.status(existingMatch ? 200 : 201).json({
    match: {
      ...match,
      profile,
      newlyCreated: !existingMatch,
    },
  });
});

app.post('/api/rewind', (req, res) => {
  const { targetId } = req.body ?? {};
  if (!targetId) {
    return res.status(400).json({ error: 'targetId is required' });
  }
  const index = matchHistory.findIndex(
    (match) => match.userId === CURRENT_USER_ID && match.targetId === targetId
  );
  if (index === -1) {
    return res.status(404).json({ error: 'Match not found' });
  }
  matchHistory.splice(index, 1);
  res.json({ success: true });
});

app.get('/api/recommendations', (_req, res) => {
  const recommended = profiles
    .filter((profile) => profile.id !== CURRENT_USER_ID)
    .map((profile) => ({
      id: profile.id,
      name: profile.name,
      compatibility: profile.compatibility,
      vibe: profile.vibe,
      highlight: profile.compatibilityWhy,
    }));
  res.json({ recommendations: recommended });
});

app.get('*', (req, res, next) => {
  if (!shouldServeMarketingApp(req)) {
    return next();
  }

  return res.sendFile('index.html', { root: staticDir }, (error) => {
    if (error) {
      next(error);
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Heartville API running on http://localhost:${PORT}`);
});

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.emit('welcome', { message: 'Connected to Heartville live updates' });
});
