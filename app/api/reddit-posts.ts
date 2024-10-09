import { NextApiRequest, NextApiResponse } from 'next';
import { fetchRecentPosts } from '../../lib/reddit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { subreddit } = req.query;
  
  if (typeof subreddit !== 'string') {
    return res.status(400).json({ error: 'Subreddit name is required' });
  }

  try {
    const posts = await fetchRecentPosts(subreddit);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    res.status(500).json({ error: 'Error fetching Reddit posts' });
  }
}