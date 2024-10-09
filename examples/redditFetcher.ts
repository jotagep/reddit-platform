import snoowrap from 'snoowrap';
import dotenv from 'dotenv';

dotenv.config();

// Configurar el cliente de Snoowrap
const r = new snoowrap({
  userAgent: 'jotagep-reddit-app',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

interface RedditPost {
  title: string;
  content: string;
  score: number;
  numComments: number;
  date: Date;
  url: string;
  author: string;
}

export async function fetchRecentPosts(subreddit: string): Promise<RedditPost[]> {
  const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

  try {
    const posts = await r.getSubreddit(subreddit).getNew({ limit: 100 });
    
    const recentPosts = posts
      .filter((post) => post.created_utc > oneDayAgo)
      .map((post) => ({
        title: post.title,
        content: post.selftext,
        score: post.score,
        numComments: post.num_comments,
        date: new Date(post.created_utc * 1000),
        url: post.url,
        author: post.author.name,
      }));

    return recentPosts;
  } catch (error) {
    console.error('Error al obtener los posts de Reddit:', error);
    return [];
  }
}

// Ejemplo de uso
async function main() {
  const ollamaPosts = await fetchRecentPosts('ollama');
  console.log('Posts recientes de r/ollama:', ollamaPosts);
}

main();