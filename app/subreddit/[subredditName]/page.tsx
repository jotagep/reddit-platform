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
import { FaReddit } from 'react-icons/fa';

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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-extrabold flex items-center">
            <FaReddit className="text-orange-500 mr-4 text-5xl" />
            r/{subredditName}
          </h1>
          <Link href="/">
            <Button variant="outline" className="text-base bg-gray-700 text-white hover:bg-gray-600 hover:text-white">
              ← Volver
            </Button>
          </Link>
        </div>
        <SubredditTabs>
          <TopPostsTab>
            <h2 className="text-2xl font-semibold mb-4 text-orange-500">Top Posts</h2>
            {error && <p className="text-red-500">{error}</p>}
            {loading ? (
              <p className="text-gray-300">Cargando top posts...</p>
            ) : (
              <TopPostsTable posts={topPosts} />
            )}
          </TopPostsTab>
          <ThemesTab>
            <h2 className="text-2xl font-semibold mb-4 text-orange-500">Temas</h2>
            {error && <p className="text-red-500">{error}</p>}
            {loading ? (
              <p className="text-gray-300">Cargando temas...</p>
            ) : (
              <ThemesSection posts={topPosts} />
            )}
          </ThemesTab>
        </SubredditTabs>
      </div>
    </main>
  );
}