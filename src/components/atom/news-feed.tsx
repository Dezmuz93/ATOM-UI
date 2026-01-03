
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Rss, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';
import { api } from '@/lib/api';

interface NewsArticle {
  id: string;
  source: string;
  headline: string;
  summary: string;
  timestamp: string;
}

const NewsFeed = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api('/api/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news feed.');
        }
        const data = await response.json();
        setNews(data.articles);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };
  
  const renderContent = () => {
    if (loading) {
      return (
         <div className="space-y-4 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
             </div>
          ))}
        </div>
      )
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-destructive text-center p-4">
            <AlertCircle className="w-12 h-12 mb-4" />
            <h3 className="font-semibold">Failed to Load News Feed</h3>
            <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (news.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
          <Rss className="w-12 h-12 mb-4" />
          <p>No news articles available at the moment.</p>
        </div>
      );
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
            {news.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <h3 className="font-semibold text-foreground">{item.headline}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.summary}</p>
                    <div className="text-xs text-primary/80 mt-2 flex justify-between items-center">
                        <span>{item.source}</span>
                        <span>{timeSince(item.timestamp)}</span>
                    </div>
                </div>
            ))}
            </div>
        </ScrollArea>
    )

  }

  return (
    <Card className="w-full h-full bg-card/50 backdrop-blur-sm flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-primary flex items-center gap-2">
          <Rss />
          Global Intel Brief
        </CardTitle>
        <CardDescription>
          Real-time headlines from verified sources.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export { NewsFeed };
