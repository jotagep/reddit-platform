import { NextResponse } from 'next/server';
import { fetchTopPosts } from '../../../lib/reddit';
import { analyzePostsBatch } from '../../../lib/openai';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');
  
  if (!subreddit) {
    return NextResponse.json({ error: 'Se requiere el nombre del subreddit' }, { status: 400 });
  }

  try {
    const posts = await fetchTopPosts(subreddit);
    const analyzedPosts = await analyzePostsBatch(posts);
    return NextResponse.json(analyzedPosts);
  } catch (error) {
    console.error('Error al obtener los posts de Reddit:', error);
    return NextResponse.json({ error: 'Error al obtener los posts de Reddit' }, { status: 500 });
  }
}