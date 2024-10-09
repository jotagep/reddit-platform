import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

interface SubredditCardProps {
  name: string;
  onRemove: (name: string) => void;
}

const SubredditCard: React.FC<SubredditCardProps> = ({ name, onRemove }) => {
  return (
    <Link href={`/subreddit/${name}`} className="w-full">
      <Card className="w-auto relative">
        <Button className="absolute top-4 right-4 p-3" variant="ghost" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(name); }}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
        <CardHeader>
          <CardTitle>{`r/${name}`}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <span>Detalles del subreddit</span>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SubredditCard;