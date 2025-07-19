import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MessageCircle, ThumbsUp, Calendar } from 'lucide-react';
import type { RedditSearchResult } from '@/services/redditSearch';

interface RedditResultsCardProps {
  results: RedditSearchResult;
}

export const RedditResultsCard: React.FC<RedditResultsCardProps> = ({ results }) => {
  if (results.posts.length === 0) {
    return (
      <Card className="shadow-card mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Similar Reddit Cases
          </CardTitle>
          <CardDescription>
            No similar cases found. Try logging more symptoms for better matches.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <Card className="shadow-card mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Similar Reddit Cases
        </CardTitle>
        <CardDescription>
          Found {results.posts.length} similar cases based on symptoms: {results.searchTerms.join(', ')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {results.posts.map((post, index) => (
            <div key={post.url} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Badge variant="outline" className="text-xs">
                      r/{post.subreddit}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.created_utc)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {post.score}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {post.num_comments}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 shrink-0"
                  onClick={() => window.open(post.url, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              
              {post.selftext && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {truncateText(post.selftext, 200)}
                </p>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            <strong>Disclaimer:</strong> These are user-generated posts from Reddit for informational purposes only. 
            They should not be considered medical advice. Always consult with healthcare professionals for proper diagnosis and treatment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};