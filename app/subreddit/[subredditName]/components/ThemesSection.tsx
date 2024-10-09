import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopPostsTable } from './TopPostsTable';
import type { RedditPost } from '@/lib/reddit';
import type { WithCategory, PostAnalysis } from '@/lib/openai';

interface ThemesSectionProps {
  posts: WithCategory<RedditPost>[];
}

export function ThemesSection({ posts }: ThemesSectionProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const themes = {
    solutionRequests: "Solicitudes de solución",
    painAndAnger: "Dolor y enojo",
    adviceRequests: "Solicitudes de consejo",
    moneyTalk: "Conversaciones sobre dinero"
  };

  const getPostsByTheme = (theme: string) => {
    return posts.filter(post => post.category[theme as keyof PostAnalysis]);
  };

  const handleThemeClick = (theme: string) => {
    setSelectedTheme(theme === selectedTheme ? null : theme);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(themes).map(([key, title]) => (
          <Card 
            key={key} 
            className={`cursor-pointer hover:shadow-lg transition-shadow bg-gray-800 text-white
              ${selectedTheme === key ? 'border-orange-500 border-2' : 'border-gray-700'}`}
            onClick={() => handleThemeClick(key)}
          >
            <CardHeader>
              <CardTitle className="text-orange-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{getPostsByTheme(key).length} posts</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedTheme && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4 text-orange-500">{themes[selectedTheme as keyof typeof themes]}</h3>
          <TopPostsTable posts={getPostsByTheme(selectedTheme)} />
        </div>
      )}
    </div>
  );
}