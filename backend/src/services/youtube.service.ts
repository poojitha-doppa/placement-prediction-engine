import { config } from '../config/index.js';

export interface YouTubeVideoRecommendation {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  publishedAt: string;
}

interface YouTubeSearchResponse {
  items?: any[];
}

interface CuratedVideoSeed {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
}

const defaultPublishedAt = '2024-01-01T00:00:00.000Z';

const curatedLibrary: Array<{
  keywords: string[];
  videos: CuratedVideoSeed[];
}> = [
  {
    keywords: ['dsa', 'data structures', 'algorithms', 'leetcode'],
    videos: [
      {
        id: 'curated-dsa-1',
        title: 'Data Structures and Algorithms Full Course',
        channelTitle: 'freeCodeCamp.org',
        description: 'A structured long-form DSA course useful for interview preparation and fundamentals.',
        thumbnailUrl: 'https://i.ytimg.com/vi/8hly31xKli0/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=8hly31xKli0'
      },
      {
        id: 'curated-dsa-2',
        title: 'Dynamic Programming, Graphs, and Patterns for Interviews',
        channelTitle: 'NeetCode',
        description: 'A practical interview-focused learning path for common DSA patterns.',
        thumbnailUrl: 'https://i.ytimg.com/vi/oBt53YbR9Kk/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=oBt53YbR9Kk'
      }
    ]
  },
  {
    keywords: ['system design', 'distributed systems', 'architecture'],
    videos: [
      {
        id: 'curated-sd-1',
        title: 'System Design Interview Course',
        channelTitle: 'freeCodeCamp.org',
        description: 'A broad introduction to scalable systems and interview-ready design thinking.',
        thumbnailUrl: 'https://i.ytimg.com/vi/F2FmTdLtb_4/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=F2FmTdLtb_4'
      },
      {
        id: 'curated-sd-2',
        title: 'System Design Concepts Explained',
        channelTitle: 'Gaurav Sen',
        description: 'Strong conceptual explanations for system design fundamentals and tradeoffs.',
        thumbnailUrl: 'https://i.ytimg.com/vi/UzLMhqg3_Wc/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=UzLMhqg3_Wc'
      }
    ]
  },
  {
    keywords: ['react', 'frontend', 'web development', 'javascript', 'typescript'],
    videos: [
      {
        id: 'curated-react-1',
        title: 'React Course for Beginners',
        channelTitle: 'freeCodeCamp.org',
        description: 'A practical React course for building real frontend projects from scratch.',
        thumbnailUrl: 'https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8'
      },
      {
        id: 'curated-react-2',
        title: 'TypeScript Full Course',
        channelTitle: 'freeCodeCamp.org',
        description: 'A solid TypeScript course to improve reliability and large-app development skills.',
        thumbnailUrl: 'https://i.ytimg.com/vi/30LWjhZzg50/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=30LWjhZzg50'
      }
    ]
  },
  {
    keywords: ['node', 'backend', 'express', 'api', 'mongodb', 'database'],
    videos: [
      {
        id: 'curated-backend-1',
        title: 'Node.js and Express.js Full Course',
        channelTitle: 'freeCodeCamp.org',
        description: 'A backend-focused course that covers Express, APIs, and server fundamentals.',
        thumbnailUrl: 'https://i.ytimg.com/vi/Oe421EPjeBE/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE'
      },
      {
        id: 'curated-backend-2',
        title: 'MongoDB Course for Beginners',
        channelTitle: 'freeCodeCamp.org',
        description: 'A practical MongoDB learning resource for CRUD, schema design, and querying.',
        thumbnailUrl: 'https://i.ytimg.com/vi/ofme2o29ngU/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=ofme2o29ngU'
      }
    ]
  },
  {
    keywords: ['python', 'machine learning', 'ml', 'ai'],
    videos: [
      {
        id: 'curated-ml-1',
        title: 'Machine Learning for Everybody',
        channelTitle: 'freeCodeCamp.org',
        description: 'An accessible practical machine learning course for building intuition and projects.',
        thumbnailUrl: 'https://i.ytimg.com/vi/i_LwzRVP7bg/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=i_LwzRVP7bg'
      },
      {
        id: 'curated-ml-2',
        title: 'Python Full Course for Beginners',
        channelTitle: 'freeCodeCamp.org',
        description: 'A Python foundation course that supports ML, automation, and interview prep.',
        thumbnailUrl: 'https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw'
      }
    ]
  }
];

const buildSearchSeed = (courseName: string, title: string, description: string, query: string): CuratedVideoSeed => ({
  id: `search-${Buffer.from(query).toString('base64').replace(/=+$/g, '')}`,
  title,
  channelTitle: 'YouTube Search',
  description,
  thumbnailUrl: 'https://i.ytimg.com/vi/default/hqdefault.jpg',
  videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
});

const buildFallbackVideos = (courseName: string): YouTubeVideoRecommendation[] => {
  const normalizedCourse = courseName.trim().toLowerCase();
  const curatedVideos = curatedLibrary.find((entry) =>
    entry.keywords.some((keyword) => normalizedCourse.includes(keyword))
  )?.videos;

  const genericVideos: CuratedVideoSeed[] = [
    buildSearchSeed(
      courseName,
      `${courseName} interview-focused learning path`,
      `Curated search results for practical ${courseName} preparation videos and tutorials.`,
      `${courseName} roadmap tutorial interview preparation`
    ),
    buildSearchSeed(
      courseName,
      `${courseName} beginner to advanced practice`,
      `Search results for structured ${courseName} beginner-to-advanced playlists and problem-solving sessions.`,
      `${courseName} beginner to advanced full course`
    )
  ];

  return [...(curatedVideos || []), ...genericVideos]
    .slice(0, 4)
    .map((video) => ({
      ...video,
      publishedAt: defaultPublishedAt
    }));
};

export const getYouTubeRecommendations = async (
  courseName: string,
  level: string,
  maxResults = 6
): Promise<YouTubeVideoRecommendation[]> => {
  if (!config.youtubeApiKey) {
    return buildFallbackVideos(courseName);
  }

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    maxResults: String(maxResults),
    order: 'relevance',
    q: `${courseName} ${level} full course tutorial`,
    key: config.youtubeApiKey,
    videoEmbeddable: 'true'
  });

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
  if (!response.ok) {
    const errorText = await response.text();
    console.warn(`YouTube API error ${response.status}. Falling back to curated recommendations. ${errorText}`);
    return buildFallbackVideos(courseName);
  }

  const payload = await response.json() as YouTubeSearchResponse;
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (items.length === 0) {
    return buildFallbackVideos(courseName);
  }

  return items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    description: item.snippet.description,
    thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
    videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    publishedAt: item.snippet.publishedAt
  }));
};
