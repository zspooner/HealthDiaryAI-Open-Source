import { HealthLog } from '@/hooks/useHealthData';

interface RedditPost {
  title: string;
  selftext: string;
  url: string;
  score: number;
  num_comments: number;
  created_utc: number;
  subreddit: string;
  author: string;
}

interface RedditSearchResult {
  posts: RedditPost[];
  searchTerms: string[];
}

class RedditSearchService {
  private async searchRedditAPI(query: string, subreddit?: string): Promise<RedditPost[]> {
    try {
      const subredditParam = subreddit ? `/r/${subreddit}` : '';
      const url = `https://www.reddit.com${subredditParam}/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=year&limit=10`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Medical-Tracker-App/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.data.children.map((child: any) => ({
        title: child.data.title,
        selftext: child.data.selftext,
        url: `https://reddit.com${child.data.permalink}`,
        score: child.data.score,
        num_comments: child.data.num_comments,
        created_utc: child.data.created_utc,
        subreddit: child.data.subreddit,
        author: child.data.author
      }));
    } catch (error) {
      console.error('Error searching Reddit:', error);
      return [];
    }
  }

  async searchSimilarCases(healthLogs: HealthLog[]): Promise<RedditSearchResult> {
    if (healthLogs.length === 0) {
      return { posts: [], searchTerms: [] };
    }

    // Extract common symptoms and create search terms
    const allSymptoms = healthLogs.flatMap(log => log.symptoms);
    const symptomFrequency = allSymptoms.reduce((acc, symptom) => {
      acc[symptom] = (acc[symptom] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top 3 most common symptoms
    const topSymptoms = Object.entries(symptomFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([symptom]) => symptom);

    const searchTerms = topSymptoms;
    
    // Health-related subreddits to search
    const healthSubreddits = [
      'AskDocs',
      'ChronicIllness', 
      'ChronicPain',
      'medical_advice',
      'HealthAnxiety',
      'DiagnoseMe',
      'medical',
      'Health'
    ];

    const allPosts: RedditPost[] = [];

    // Search for each symptom combination
    for (const symptom of topSymptoms) {
      // Search general Reddit
      const generalPosts = await this.searchRedditAPI(symptom);
      allPosts.push(...generalPosts);

      // Search specific health subreddits
      for (const subreddit of healthSubreddits.slice(0, 3)) { // Limit to avoid rate limiting
        const subredditPosts = await this.searchRedditAPI(symptom, subreddit);
        allPosts.push(...subredditPosts);
      }
    }

    // If we have multiple symptoms, also search for combinations
    if (topSymptoms.length >= 2) {
      const combinedQuery = topSymptoms.slice(0, 2).join(' ');
      const combinedPosts = await this.searchRedditAPI(combinedQuery);
      allPosts.push(...combinedPosts);
    }

    // Remove duplicates based on URL and filter for relevant posts
    const uniquePosts = Array.from(
      new Map(allPosts.map(post => [post.url, post])).values()
    ).filter(post => 
      // Filter for posts that likely contain personal experiences
      post.selftext.length > 100 && // Has substantial content
      (post.title.toLowerCase().includes('i have') || 
       post.title.toLowerCase().includes('experiencing') ||
       post.title.toLowerCase().includes('symptoms') ||
       post.title.toLowerCase().includes('anyone else') ||
       post.selftext.toLowerCase().includes('i have') ||
       post.selftext.toLowerCase().includes('experiencing'))
    ).sort((a, b) => b.score - a.score) // Sort by score (popularity)
    .slice(0, 8); // Limit to top 8 results

    return {
      posts: uniquePosts,
      searchTerms
    };
  }
}

export const redditSearchService = new RedditSearchService();
export type { RedditPost, RedditSearchResult };