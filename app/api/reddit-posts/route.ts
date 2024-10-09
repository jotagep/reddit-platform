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
    // Obtener posts utilizando la nueva lógica de caché
    const posts = await fetchTopPosts(subreddit);

    // Analizar los posts utilizando la nueva lógica de caché
    const analyzedPosts = await analyzePostsBatch(posts);

    return NextResponse.json(analyzedPosts);
  } catch (error) {
    console.error('Error al obtener y analizar los posts de Reddit:', error);
    return NextResponse.json({ error: 'Error al procesar los posts de Reddit' }, { status: 500 });
  }
}