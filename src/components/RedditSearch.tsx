import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ExternalLink, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RedditPost {
  title: string;
  url: string;
  subreddit: string;
  author: string;
  score: number;
  created_utc: number;
  num_comments: number;
  selftext?: string;
}

export const RedditSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RedditPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchReddit = async () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Search in health-related subreddits
      const subreddits = ['AskDocs', 'medical', 'HealthAnxiety', 'ChronicIllness', 'autoimmune', 'migraine', 'ibs', 'fibromyalgia'];
      const searchTerms = encodeURIComponent(query);
      const subredditQuery = subreddits.map(sub => `subreddit:${sub}`).join(' OR ');
      
      const response = await fetch(
        `https://www.reddit.com/search.json?q=${searchTerms} (${subredditQuery})&sort=relevance&limit=10&raw_json=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch Reddit data');
      }
      
      const data = await response.json();
      const posts = data.data.children.map((child: any) => child.data);
      setResults(posts);
      
      if (posts.length === 0) {
        toast({
          title: "No results found",
          description: "Try different search terms or check back later",
        });
      }
    } catch (error) {
      console.error('Reddit search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to search Reddit at the moment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>Reddit Case Search</CardTitle>
          </div>
          <CardDescription>
            Search for similar health experiences in medical Reddit communities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter symptoms or conditions (e.g., 'chronic fatigue headache')"
              onKeyPress={(e) => e.key === 'Enter' && searchReddit()}
              className="flex-1"
            />
            <Button onClick={searchReddit} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Search Results</h3>
          {results.map((post, index) => (
            <Card key={index} className="shadow-card">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base leading-tight mb-2">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>r/{post.subreddit}</span>
                      <span>by u/{post.author}</span>
                      <span>{formatDate(post.created_utc)}</span>
                      <span>{post.score} upvotes</span>
                      <span>{post.num_comments} comments</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a 
                      href={`https://reddit.com${post.url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </Button>
                </div>
              </CardHeader>
              {post.selftext && post.selftext.length > 0 && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.selftext.length > 200 
                      ? `${post.selftext.substring(0, 200)}...` 
                      : post.selftext
                    }
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};