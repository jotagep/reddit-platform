"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { SubredditTabs, TopPostsTab, ThemesTab } from './components/Tabs';
import { TopPostsTable } from './components/TopPostsTable';
import { ThemesSection } from './components/ThemesSection';
import type { RedditPost } from '@/lib/reddit';
import type { WithCategory } from '@/lib/openai';

export default function SubredditPage() {
  const params = useParams();
  const subredditName = params.subredditName as string;
  const [topPosts, setTopPosts] = useState<WithCategory<RedditPost>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/reddit-posts?subreddit=${subredditName}`);
        if (!response.ok) {
          throw new Error('Error al obtener los posts');
        }
        const data = await response.json();
        setTopPosts(data);
      } catch (error) {
        setError('Error al obtener y analizar los posts de Reddit');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [subredditName]);

  return (
    <main className="container mx-auto p-4 pb-12">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">r/{subredditName}</h1>
        <Link href="/">
          <Button variant="outline">← Volver</Button>
        </Link>
      </div>
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