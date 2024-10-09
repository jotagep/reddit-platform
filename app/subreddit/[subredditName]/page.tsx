"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { SubredditTabs, TopPostsTab, ThemesTab } from './components/Tabs';
import { TopPostsTable } from './components/TopPostsTable';
import { ThemesSection } from './components/ThemesSection';
import type { RedditPost } from '@/lib/reddit';
import type{ WithCategory } from '@/lib/openai';

export default function SubredditPage() {
  const params = useParams();
  const subredditName = params.subredditName as string;
  const [topPosts, setTopPosts] = useState<WithCategory<RedditPost>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const response = await fetch(`/api/reddit-posts?subreddit=${params.subredditName}`);
        if (!response.ok) {
          throw new Error('Error al obtener los posts');
        }
        const data = await response.json();
        setTopPosts(data);
      } catch (error) {
        setError('Error al obtener los posts de Reddit');
        console.error('Error al obtener los posts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [params.subredditName]);

  return (
    <main className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline">← Volver</Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">r/{subredditName}</h1>
      <SubredditTabs>
        <TopPostsTab>
          <h2 className="text-2xl font-semibold mb-4">Top Posts</h2>
          {error && <p className="text-red-500">{error}</p>}
          {loading ? (
            <p>Cargando top posts...</p>
          ) : (
            <TopPostsTable posts={topPosts} />
          )}
        </TopPostsTab>
        <ThemesTab>
          <h2 className="text-2xl font-semibold mb-4">Temas</h2>
          {error && <p className="text-red-500">{error}</p>}
          {loading ? (
            <p>Cargando temas...</p>
          ) : (
            <ThemesSection posts={topPosts} />
          )}
        </ThemesTab>
      </SubredditTabs>
    </main>
  );
}