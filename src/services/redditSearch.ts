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
      // Use Supabase Edge Function as proxy to avoid CORS issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('https://opiuyyiqkmmiffaagqnk.supabase.co/functions/v1/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          redditSearch: {
            query,
            subreddit: subreddit || null
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('Reddit search proxy failed, returning empty results');
        return [];
      }

      const data = await response.json();
      
      // If the response contains Reddit posts, return them
      if (data.redditPosts && Array.isArray(data.redditPosts)) {
        return data.redditPosts.map((post: any) => ({
          title: post.title,
          selftext: post.selftext,
          url: post.url,
          score: post.score,
          num_comments: post.num_comments,
          created_utc: post.created_utc,
          subreddit: post.subreddit,
          author: post.author
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error searching Reddit via proxy:', error);
      return [];
    }
  }

  async searchSimilarCases(healthLogs: HealthLog[], searchType: 'general' | 'medical' = 'general'): Promise<RedditSearchResult> {
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
    
    // If no symptoms found, return empty result
    if (searchTerms.length === 0) {
      return { posts: [], searchTerms: [] };
    }
    
    // Health-related subreddits to search - different focus based on search type
    const healthSubreddits = searchType === 'medical' ? [
      'AskDocs',
      'DiagnoseMe',
      'medical_advice',
      'medical',
      'ChronicIllness',
      'ChronicPain'
    ] : [
      'Health',
      'HealthAnxiety',
      'Wellness',
      'nutrition',
      'fitness',
      'sleep',
      'mentalhealth'
    ];

    const allPosts: RedditPost[] = [];

    // Search for each symptom combination with different strategies
    for (const symptom of topSymptoms) {
      if (searchType === 'medical') {
        // Medical search: focus on diagnosis and medical advice
        const medicalQueries = [
          symptom,
          `${symptom} diagnosis`,
          `${symptom} medical advice`,
          `${symptom} doctor`
        ];
        
        for (const query of medicalQueries) {
          const generalPosts = await this.searchRedditAPI(query);
          allPosts.push(...generalPosts);

          // Search specific medical subreddits
          for (const subreddit of healthSubreddits.slice(0, 3)) {
            const subredditPosts = await this.searchRedditAPI(query, subreddit);
            allPosts.push(...subredditPosts);
          }
        }
      } else {
        // General search: focus on lifestyle and wellness
        const generalQueries = [
          symptom,
          `${symptom} lifestyle`,
          `${symptom} wellness`,
          `${symptom} natural`
        ];
        
        for (const query of generalQueries) {
          const generalPosts = await this.searchRedditAPI(query);
          allPosts.push(...generalPosts);

          // Search specific wellness subreddits
          for (const subreddit of healthSubreddits.slice(0, 3)) {
            const subredditPosts = await this.searchRedditAPI(query, subreddit);
            allPosts.push(...subredditPosts);
          }
        }
      }
    }

    // If we have multiple symptoms, also search for combinations
    if (topSymptoms.length >= 2) {
      const combinedQuery = topSymptoms.slice(0, 2).join(' ');
      const additionalQuery = searchType === 'medical' 
        ? `${combinedQuery} diagnosis medical`
        : `${combinedQuery} lifestyle wellness`;
      
      const combinedPosts = await this.searchRedditAPI(combinedQuery);
      const additionalPosts = await this.searchRedditAPI(additionalQuery);
      allPosts.push(...combinedPosts, ...additionalPosts);
    }

    // Remove duplicates based on URL and filter for relevant posts
    const uniquePosts = Array.from(
      new Map(allPosts.map(post => [post.url, post])).values()
    ).filter(post => {
      // Filter for posts that likely contain relevant content
      if (post.selftext.length < 100) return false; // Has substantial content
      
      const title = post.title.toLowerCase();
      const text = post.selftext.toLowerCase();
      
      if (searchType === 'medical') {
        // Medical search: look for diagnosis, medical advice, doctor discussions
        return (
          title.includes('diagnosis') ||
          title.includes('medical advice') ||
          title.includes('doctor') ||
          title.includes('symptoms') ||
          title.includes('i have') ||
          title.includes('experiencing') ||
          text.includes('diagnosis') ||
          text.includes('medical advice') ||
          text.includes('doctor') ||
          text.includes('symptoms') ||
          text.includes('i have') ||
          text.includes('experiencing')
        );
      } else {
        // General search: look for lifestyle, wellness, personal experiences
        return (
          title.includes('lifestyle') ||
          title.includes('wellness') ||
          title.includes('natural') ||
          title.includes('i have') ||
          title.includes('experiencing') ||
          title.includes('anyone else') ||
          text.includes('lifestyle') ||
          text.includes('wellness') ||
          text.includes('natural') ||
          text.includes('i have') ||
          text.includes('experiencing')
        );
      }
    }).sort((a, b) => b.score - a.score) // Sort by score (popularity)
    .slice(0, 8); // Limit to top 8 results

    return {
      posts: uniquePosts,
      searchTerms
    };
  }
}

export const redditSearchService = new RedditSearchService();
export type { RedditPost, RedditSearchResult };