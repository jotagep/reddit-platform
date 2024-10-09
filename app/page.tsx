"use client";

import React from 'react';
import SubredditCard from '@/components/SubredditCard';
import AddSubredditModal from '@/components/AddSubredditModal';

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
    <main className="container mx-auto p-4">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">Reddit Analytics Platform</h1>
        <AddSubredditModal onAddSubreddit={handleAddSubreddit} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subreddits.map(subreddit => (
          <SubredditCard
            key={subreddit}
            name={subreddit}
            onRemove={handleRemoveSubreddit}
          />
        ))}
      </div>
    </main>
  );
}
