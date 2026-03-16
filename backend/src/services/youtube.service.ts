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

const buildFallbackVideos = (courseName: string): YouTubeVideoRecommendation[] => {
  const query = encodeURIComponent(`${courseName} course`);
  return [
    {
      id: 'fallback-1',
      title: `${courseName} full course search`,
      channelTitle: 'YouTube',
      description: `Search results for ${courseName} full course content on YouTube.`,
      thumbnailUrl: 'https://i.ytimg.com/vi/default/hqdefault.jpg',
      videoUrl: `https://www.youtube.com/results?search_query=${query}`,
      publishedAt: new Date().toISOString()
    },
    {
      id: 'fallback-2',
      title: `${courseName} beginner roadmap search`,
      channelTitle: 'YouTube',
      description: `Search results for beginner-friendly ${courseName} learning videos.`,
      thumbnailUrl: 'https://i.ytimg.com/vi/default/hqdefault.jpg',
      videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${courseName} beginner tutorial`)}`,
      publishedAt: new Date().toISOString()
    }
  ];
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
    throw new Error(`YouTube API error: ${response.status} ${errorText}`);
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