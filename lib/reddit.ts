/* eslint-disable @typescript-eslint/no-explicit-any */
import snoowrap from 'snoowrap';
import { supabase } from './supabase';

// Configurar el cliente de Snoowrap
const r = new snoowrap({
  userAgent: 'reddit-analytics-platform',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

export interface RedditPost {
  id?: string;
  title: string;
  content: string;
  url: string;
  author: string;
  created_utc: Date;
  num_comments: number;
  score: number;
  thumbnail: string;
}

async function fetchFromRedditAPI(subredditName: string): Promise<RedditPost[]> {
  const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

  try {
    const posts = await r.getSubreddit(subredditName).getTop({time: 'day', limit: 20});

    return posts
      .filter((post: any) => post.created_utc > oneDayAgo)
      .map((post: any) => ({
        title: post.title,
        content: post.selftext,
        url: post.url,
        author: post.author.name,
        created_utc: new Date(post.created_utc * 1000),
        num_comments: post.num_comments,
        score: post.score,
        thumbnail: post.thumbnail,
      }));
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return [];
  }
}

export async function fetchTopPosts(subredditName: string): Promise<RedditPost[]> {
  // Buscar en Supabase primero
  const { data: subreddit } = await supabase
    .from('subreddits')
    .select('*')
    .eq('name', subredditName)
    .single();

  if (subreddit && (new Date().getTime() - new Date(subreddit.last_updated).getTime()) < 24 * 60 * 60 * 1000) {
    // Si los datos tienen menos de 24 horas, obtenerlos de Supabase
    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .eq('subreddit_id', subreddit.id);

    return posts as RedditPost[];
  } else {
    // Si no hay datos o son antiguos, obtener de Reddit y guardar en Supabase
    const posts = await fetchFromRedditAPI(subredditName);
    
    // Guardar o actualizar el subreddit
    try {
      const { data: updatedSubreddit } = await supabase
        .from('subreddits')
      .upsert({ name: subredditName, last_updated: new Date().toISOString() })
      .select()
      .single();

    // Guardar los posts
    if (updatedSubreddit) {
      await supabase
        .from('posts')
        .upsert(posts.map(post => ({
          subreddit_id: updatedSubreddit.id,
          title: post.title,
          content: post.content,
          author: post.author,
          created_utc: post.created_utc,
          score: post.score,
          num_comments: post.num_comments,
          url: post.url,
          thumbnail: post.thumbnail
        })));
      }
    } catch (error) {
      console.error('Error updating subreddit:', error);
    }

    return posts;
  }
}