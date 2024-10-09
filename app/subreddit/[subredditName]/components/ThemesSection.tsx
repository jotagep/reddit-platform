import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { RedditPost } from '@/lib/reddit';
import type { WithCategory, PostAnalysis } from '@/lib/openai';

interface ThemesSectionProps {
  posts: WithCategory<RedditPost>[];
}

export function ThemesSection({ posts }: ThemesSectionProps) {
  const themes = {
    solutionRequests: "Solicitudes de solución",
    painAndAnger: "Dolor y enojo",
    adviceRequests: "Solicitudes de consejo",
    moneyTalk: "Conversaciones sobre dinero"
  };

  const getPostsByTheme = (theme: string) => {
    return posts.filter(post => post.category[theme as keyof PostAnalysis]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(themes).map(([key, title]) => (
        <Sheet key={key}>
          <SheetTrigger asChild>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{getPostsByTheme(key).length} posts</p>
              </CardContent>
            </Card>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="text-xl font-bold">{title}</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              {getPostsByTheme(key).map((post, index) => (
                <div key={index} className="mb-4 border-b border-gray-200 pb-4">
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {post.title}
                  </a>
                  <p className="text-sm text-gray-500">por <span className="font-bold">{post.author}</span></p>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}