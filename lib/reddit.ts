import snoowrap from 'snoowrap';

// Configurar el cliente de Snoowrap
const r = new snoowrap({
  userAgent: 'reddit-analytics-platform',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

export interface RedditPost {
  title: string;
  content: string;
  url: string;
  author: string;
  created_utc: number;
  num_comments: number;
  score: number;
  thumbnail: string;
}

export async function fetchTopPosts(subredditName: string): Promise<RedditPost[]> {
  const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

  try {
    const posts = await r.getSubreddit(subredditName).getTop({time: 'day', limit: 100});

    const topPosts = posts
      .filter((post: any) => post.created_utc > oneDayAgo)
      .map((post: any) => ({
        title: post.title,
        content: post.selftext,
        url: post.url,
        author: post.author.name,
        created_utc: post.created_utc,
        num_comments: post.num_comments,
        score: post.score,
        thumbnail: post.thumbnail,
      }));

    return topPosts;
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return [];
  }
}