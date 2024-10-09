"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SubredditTabsProps {
  children: React.ReactNode
}

export function SubredditTabs({ children }: SubredditTabsProps) {
  return (
    <Tabs defaultValue="top-posts" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="top-posts">Top Posts</TabsTrigger>
        <TabsTrigger value="themes">Themes</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  )
}

export function TopPostsTab({ children }: { children: React.ReactNode }) {
  return <TabsContent value="top-posts">{children}</TabsContent>
}

export function ThemesTab({ children }: { children: React.ReactNode }) {
  return <TabsContent value="themes">{children}</TabsContent>
}