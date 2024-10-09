import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { FaReddit } from 'react-icons/fa';

interface SubredditCardProps {
  name: string;
  onRemove: (name: string) => void;
}

const SubredditCard: React.FC<SubredditCardProps> = ({ name, onRemove }) => {
  return (
    <Link href={`/subreddit/${name}`} className="w-full">
      <Card className="w-auto relative bg-gray-800 text-white border-gray-700 hover:border-orange-500 transition-colors">
        <Button 
          className="absolute top-2 right-2 p-2" 
          variant="ghost" 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(name); }}
        >
          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-400" />
        </Button>
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
          <FaReddit className="text-orange-500 text-3xl" />
          <CardTitle className="text-2xl font-bold text-orange-500 p-0">{`r/${name}`}</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <span className="text-gray-300">Ver análisis del subreddit</span>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SubredditCard;