"use client";

import React from 'react';
import SubredditCard from '@/components/SubredditCard';
import AddSubredditModal from '@/components/AddSubredditModal';
import { FaReddit } from 'react-icons/fa';

// Simulamos una lista de subreddits predeterminados
const defaultSubreddits = ['ollama', 'openai', 'reactjs', 'nextjs'];

export default function Home() {
  const [subreddits, setSubreddits] = React.useState(defaultSubreddits);

  const handleRemoveSubreddit = (name: string) => {
    setSubreddits(subreddits.filter(subreddit => subreddit !== name));
  };

  const handleAddSubreddit = (name: string) => {
    // Aquí deberíamos validar que el subreddit existe
    // Por ahora, simplemente lo añadimos a la lista
    setSubreddits([...subreddits, name]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-extrabold flex items-center">
            <FaReddit className="text-orange-500 mr-4 text-5xl" />
            Reddit Analytics Platform
          </h1>
          <AddSubredditModal onAddSubreddit={handleAddSubreddit} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subreddits.map(subreddit => (
            <SubredditCard
              key={subreddit}
              name={subreddit}
              onRemove={handleRemoveSubreddit}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
