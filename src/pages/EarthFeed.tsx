
import { useState, useEffect } from "react";
import { Calendar, ExternalLink, Filter, Leaf } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Article {
  title: string;
  description: string;
  content: string;
  url: string;
  image?: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
  category: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5b43?auto=format&fit=crop&q=80&w=500";

const CATEGORIES = ["All", "Climate News", "Sustainable Living", "Green Tech", "Plant & Wildlife", "Environmental Policy"];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Green Tech": ["renewable", "solar", "wind", "electric", "ev", "battery", "energy", "tech", "innovation", "hydrogen", "power", "grid", "clean energy", "turbine", "panel"],
  "Sustainable Living": ["sustainable", "eco", "lifestyle", "recycling", "waste", "plastic", "home", "food", "organic", "fashion", "garden", "compost", "vegan", "diet", "green living"],
  "Plant & Wildlife": ["wildlife", "forest", "biodiversity", "animals", "species", "conservation", "nature", "ocean", "marine", "bird", "fish", "park", "reserve", "tree", "plant", "coral", "reef", "amazon", "safari", "extinction"],
  "Environmental Policy": ["policy", "law", "government", "agreement", "treaty", "cop2", "un", "regulation", "ban", "tax", "politics", "campaign", "activist", "protest"],
  "Climate News": ["climate", "warming", "emissions", "carbon", "glacier", "ice", "weather", "temperature", "disaster", "flood", "fire", "heat", "drought", "storm", "melt"]
};

// Helper: Count matching keywords
const countMatches = (text: string, keywords: string[]) => {
  return keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);
};

const determineCategory = (title: string, description: string): string => {
  const text = `${title} ${description}`.toLowerCase();

  let bestCategory = "Climate News";
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = countMatches(text, keywords);
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    }
  }

  // If no specific keywords match, check generally
  if (maxMatches === 0) {
    if (text.includes("tech") || text.includes("energy")) return "Green Tech";
    if (text.includes("wild") || text.includes("nature")) return "Plant & Wildlife";
    if (text.includes("green") || text.includes("eco")) return "Sustainable Living";
  }

  return bestCategory;
};

const EarthFeed = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Frequency: Fetches on component mount and when user clicks "Load More"
  const fetchNews = async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    setError(null);

    // Initial load cache check (v5)
    if (isInitialLoad) {
      const CACHE_KEY = "earthly_news_cache_v5";
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { articles: cachedArticles, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          if (age < 3600000 && Array.isArray(cachedArticles) && cachedArticles.length > 0) {
            console.log("Using cached news data:", cachedArticles.length);
            setArticles(cachedArticles);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Failed to parse news cache", e);
          sessionStorage.removeItem(CACHE_KEY);
        }
      }
    }

    try {
      const apiKey = import.meta.env.VITE_GNEWS_API_KEY;

      // Multi-fetch strategy: We cycle queries or fetch random pages to simulate "new" news
      // GNews free tier doesn't support deep pagination well, so we use diverse queries
      const queries = [
        `"climate change" OR "global warming"`,
        `"sustainable living" OR biodiversity`,
        `"green technology" OR "renewable energy"`
      ];

      const requests = queries.map(q =>
        fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&max=15&page=${page}&sortby=publishedAt&token=${apiKey}`)
          .then(res => res.json())
          .catch(err => ({ articles: [] }))
      );

      const results = await Promise.all(requests);

      let newArticles: any[] = [];
      results.forEach((data: any) => {
        if (data.articles) {
          newArticles = [...newArticles, ...data.articles];
        }
      });

      if (newArticles.length === 0 && isInitialLoad) {
        // Fallback to single broad search if multi-fetch fails completely
        const response = await fetch(`https://gnews.io/api/v4/search?q=environment&lang=en&max=15&token=${apiKey}`);
        const data = await response.json();
        if (data.articles) newArticles = data.articles;
      }

      if (newArticles.length > 0) {
        // Filter out imageless
        const validArticles = newArticles.filter((article: any) =>
          article.image || article.urlToImage
        );

        const processedNewArticles = validArticles.map((article: any) => ({
          ...article,
          category: determineCategory(article.title || "", article.description || "")
        }));

        setArticles(prevArticles => {
          // Normalize and Dedupe against EXISTING articles
          const seenKeys = new Set(prevArticles.map(a => `${a.url}|${a.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50)}`));

          const uniqueNew = processedNewArticles.filter((item: Article) => {
            const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50);
            const uniqueKey = `${item.url}|${normalizedTitle}`;

            if (seenKeys.has(uniqueKey)) return false;
            seenKeys.add(uniqueKey); // Add to seenKeys for current batch deduplication
            return true;
          });

          // Append NEW articles to the list
          const combined = [...prevArticles, ...uniqueNew];

          // Update cache if it's the initial set
          if (isInitialLoad) {
            sessionStorage.setItem("earthly_news_cache_v5", JSON.stringify({
              articles: combined,
              timestamp: Date.now()
            }));
          }

          return combined;
        });

      } else if (isInitialLoad) {
        throw new Error("No articles found");
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      if (isInitialLoad) setError("Unable to load environmental news. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(true);
  }, []);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    fetchNews(false);
  };

  const visibleArticles = articles.filter(article => {
    if (selectedCategory === "All") return true;
    return article.category === selectedCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Climate News": return "bg-red-100 text-red-800";
      case "Sustainable Living": return "bg-green-100 text-green-800";
      case "Green Tech": return "bg-blue-100 text-blue-800";
      case "Plant & Wildlife": return "bg-emerald-100 text-emerald-800";
      case "Environmental Policy": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 fade-in">Earth Feed</h1>
          <p className="text-xl text-muted-foreground fade-in stagger-1">
            Daily doses of environmental news and insights
          </p>
        </div>

        {/* Filter Section */}
        <Card className="eco-card mb-8 fade-in stagger-2">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Filter by Category</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`hover-scale transition-all duration-200 ${selectedCategory === category ? "bg-gradient-primary" : ""
                  }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </Card>

        {/* Feed Section */}
        <div className="space-y-6 mb-8">
          {loading ? (
            // Skeleton Loader
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={`skeleton-${index}`} className="eco-card p-0 overflow-hidden">
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  {/* Image Skeleton */}
                  <div className="md:w-48 h-48 md:h-32 flex-shrink-0 bg-muted animate-pulse rounded-lg" />

                  {/* Content Skeleton */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-6 bg-muted animate-pulse rounded w-24" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded w-full" />
                      <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-4 bg-muted animate-pulse rounded w-32" />
                      <div className="h-9 bg-muted animate-pulse rounded w-28" />
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          ) : visibleArticles.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Leaf className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No environmental stories found for this category
              </h3>
              <p className="text-muted-foreground text-sm">
                Try switching categories to explore more news
              </p>
            </div>
          ) : (
            visibleArticles.map((item, index) => (
              <Card
                key={item.url} // Use unique URL as key
                className="eco-card hover-lift fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image */}
                  <div className="md:w-48 h-48 md:h-32 flex-shrink-0">
                    <img
                      src={item.image || item.urlToImage || FALLBACK_IMAGE}
                      alt={item.title || "Environmental news image"}
                      className="w-full h-full object-cover rounded-lg bg-muted"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Prevent infinite loop if fallback itself fails
                        if (target.src !== FALLBACK_IMAGE) {
                          target.src = FALLBACK_IMAGE;
                        }
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold leading-tight hover:text-primary transition-colors">
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          {item.title}
                        </a>
                      </h3>
                      <Badge className={`${getCategoryColor(item.category)} whitespace-nowrap flex-shrink-0`}>
                        {item.category}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{getRelativeTime(item.publishedAt)}</span>
                      </div>
                      {item.url ? (
                        <Button variant="outline" size="sm" className="hover-scale" asChild>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Read More
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="hover-scale" disabled>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read More
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}

          {visibleArticles.length > 0 && !loading && (
            <div className="text-center pt-8 fade-in">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                size="lg"
                className="hover-scale"
              >
                Load More Articles
              </Button>
            </div>
          )}
        </div>

        {/* Update Info */}
        <div className="text-center text-sm text-muted-foreground fade-in">
          <p>Updated daily from trusted sources</p>
        </div>
      </div>
    </div>
  );
};

export default EarthFeed;
