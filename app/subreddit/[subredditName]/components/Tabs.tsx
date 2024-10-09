"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SubredditTabsProps {
  children: React.ReactNode
}

export function SubredditTabs({ children }: SubredditTabsProps) {
  return (
    <Tabs defaultValue="top-posts" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-800 p-1 rounded-lg">
        <TabsTrigger 
          value="top-posts"
          className="text-white font-bold data-[state=active]:bg-orange-500 data-[state=active]:text-white"
        >
          Top Posts
        </TabsTrigger>
        <TabsTrigger 
          value="themes"
          className="text-white font-bold data-[state=active]:bg-orange-500 data-[state=active]:text-white"
        >
          Temas
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  )
}

export function TopPostsTab({ children }: { children: React.ReactNode }) {
  return <TabsContent value="top-posts" className="mt-6">{children}</TabsContent>
}

export function ThemesTab({ children }: { children: React.ReactNode }) {
  return <TabsContent value="themes" className="mt-6">{children}</TabsContent>
}