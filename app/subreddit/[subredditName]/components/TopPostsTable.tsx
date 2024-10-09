import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { WithCategory } from '@/lib/openai';
import type { RedditPost } from '@/lib/reddit';

type SortField = 'title' | 'author' | 'created_utc' | 'num_comments' | 'score';

interface TopPostsTableProps {
  posts: WithCategory<RedditPost>[];
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'solutionRequests': return 'bg-blue-500';
    case 'painAndAnger': return 'bg-red-500';
    case 'adviceRequests': return 'bg-green-500';
    case 'moneyTalk': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

const getCategoryName = (category: string) => {
  switch (category) {
    case 'solutionRequests': return 'Solución';
    case 'painAndAnger': return 'Dolor y enojo';
    case 'adviceRequests': return 'Consejo';
    case 'moneyTalk': return 'Dinero';
    default: return 'Otro';
  }
};

export function TopPostsTable({ posts }: TopPostsTableProps) {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [posts, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead className="text-center">
      <Button variant="ghost" onClick={() => handleSort(field)}>
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader field="title">Título</SortableHeader>
          <SortableHeader field="author">Autor</SortableHeader>
          <SortableHeader field="num_comments">Comentarios</SortableHeader>
          <SortableHeader field="score">Puntuación</SortableHeader>
          <TableHead className="text-center">Categorías</TableHead>
          <SortableHeader field="created_utc">Fecha</SortableHeader>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedPosts.map((post, index) => (
          <TableRow key={index}>
            <TableCell>
              <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {post.title}
              </a>
            </TableCell>
            <TableCell>{post.author}</TableCell>
            <TableCell className="text-center">{post.num_comments}</TableCell>
            <TableCell className="text-center">{post.score}</TableCell>
            <TableCell className="flex flex-wrap gap-1 justify-center">
              <>
                {Object.entries(post.category).map(([category, isPresent]) => 
                  isPresent && (
                    <Badge key={category} className={`text-xs ${getCategoryColor(category)}`}>
                      {getCategoryName(category)}
                    </Badge>
                  )
                )}
              </>
            </TableCell>
            <TableCell className="text-center">{new Date(post.created_utc * 1000).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}