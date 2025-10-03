import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { loadAmazonians, searchAmazonians, aggregateStats } from "@/lib/data";

// Resolve the logo via URL so Vite bundles it reliably
const logoUrl = new URL("../data/rate.jpeg", import.meta.url).href;

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [] as any[];
      const people = await loadAmazonians();
      const filtered = searchAmazonians(people, searchQuery);
      const decorated = aggregateStats(filtered);
      return decorated as any[];
    },
    enabled: searchQuery.trim().length > 0,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Link to="/" className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <div
          className="relative h-40 w-40 rounded-full shadow-2xl overflow-hidden ring-1 ring-border/40 animate-[spin_12s_linear_infinite]"
          style={{
            background:
              "radial-gradient( circle at 30% 30%, rgba(255,255,255,0.85), rgba(255,255,255,0.08) 40%), conic-gradient(from 220deg at 50% 50%, hsl(var(--primary)) 0%, hsl(var(--secondary)) 35%, hsl(var(--primary)) 70%, hsl(var(--secondary)) 100%)",
          }}
        >
          <img src={logoUrl} alt="RateAmazonian" className="absolute inset-0 h-full w-full object-cover rounded-full opacity-95" />
          <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-white/50 blur-xl" />
        </div>
      </Link>
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            
            <div className="flex-1 flex gap-2 bg-muted/50 p-2 rounded-xl">
              <Input
                placeholder="Search by name, team, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0"
                autoFocus
              />
              <Button size="icon" className="rounded-lg">
                <SearchIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Searching...</div>
        ) : results && results.length > 0 ? (
          <>
            <div className="mb-6 text-muted-foreground">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((boss) => (
                <Card
                  key={boss.id}
                  className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => navigate(`/boss/${boss.username}`)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={boss.photo_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"}
                      alt={boss.full_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{boss.full_name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {boss.job_title}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-primary">
                        {boss.average_rating.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ({boss.total_ratings} ratings)
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : searchQuery.trim() ? (
          <div className="text-center py-12">
            <div className="text-2xl font-bold mb-2">No results found</div>
            <p className="text-muted-foreground mb-6">
              Try searching with different keywords
            </p>
            {/* Add Boss disabled intentionally */}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            Start typing to search...
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
