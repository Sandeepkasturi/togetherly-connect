
const YOUTUBE_API_KEY = 'AIzaSyBa9yTXXXXXXXXXXXXXXXXXXXXXXXX'; // This should be replaced with actual API key

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
      maxres?: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

export interface CategoryContent {
  title: string;
  videos: YouTubeVideo[];
}

export const fetchLatestMovies = async (): Promise<YouTubeVideo[]> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=latest+movies+trailer+2024&type=video&maxResults=20&order=relevance&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching latest movies:', error);
    return [];
  }
};

export const fetchLatestSongs = async (): Promise<YouTubeVideo[]> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=latest+songs+music+2024&type=video&maxResults=20&order=relevance&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching latest songs:', error);
    return [];
  }
};

export const fetchLatestPodcasts = async (): Promise<YouTubeVideo[]> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=latest+podcasts+2024&type=video&maxResults=20&order=relevance&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching latest podcasts:', error);
    return [];
  }
};

export const getAllCategories = async (): Promise<CategoryContent[]> => {
  const [movies, songs, podcasts] = await Promise.all([
    fetchLatestMovies(),
    fetchLatestSongs(),
    fetchLatestPodcasts()
  ]);

  return [
    { title: 'Latest Movies', videos: movies },
    { title: 'Latest Songs', videos: songs },
    { title: 'Latest Podcasts', videos: podcasts }
  ];
};
