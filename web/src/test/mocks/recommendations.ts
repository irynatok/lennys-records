import type { Episode, Guest, LightningRound } from '../../data/types';

export const mockGuest: Guest = {
  name: 'Test Guest',
  titles: ['CEO', 'Product Leader'],
  reach: {
    platforms: ['Twitter'],
    websites: ['https://example.com'],
    products: ['Test Product'],
  },
};

export const mockLightningRound: LightningRound = {
  books: [
    {
      title: 'The Lean Startup',
      author: 'Eric Ries',
      why: 'Great insights on product development',
      url: 'https://example.com/book',
    },
  ],
  tv_movies: [
    {
      title: 'The Social Network',
      type: 'movie',
      why: 'Inspiring story about startups',
      url: 'https://example.com/movie',
    },
  ],
  products: [
    {
      name: 'Notion',
      why: 'Best productivity tool',
      url: 'https://notion.so',
    },
  ],
  life_motto: 'Keep building',
  interview_question: 'Tell me about yourself',
  productivity_tip: 'Use time blocking',
};

export const mockEpisode: Episode = {
  filename: 'test-episode.txt',
  guests: [mockGuest],
  lightning_round: mockLightningRound,
  substack_url: 'https://example.com/article',
  where_to_find: [
    { label: 'Twitter', url: 'https://twitter.com/test' },
    { label: 'Website', url: 'https://example.com' },
  ],
};

export const mockEpisodes: Episode[] = [
  mockEpisode,
  {
    ...mockEpisode,
    filename: 'test-episode-2.txt',
    guests: [
      {
        ...mockGuest,
        name: 'Second Guest',
      },
    ],
    lightning_round: {
      ...mockLightningRound,
      books: [
        {
          title: 'Zero to One',
          author: 'Peter Thiel',
          why: 'Different perspective on innovation',
          url: null,
        },
      ],
    },
  },
];
