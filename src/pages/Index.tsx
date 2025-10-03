import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, TrendingUp, Users, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { loadAmazonians, aggregateStats, getTrending } from "@/lib/data";
// Resolve the logo via URL so Vite bundles it reliably
const logoUrl = new URL("../data/rate.jpeg", import.meta.url).href;

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const people = await loadAmazonians();
      const decorated = aggregateStats(people);
      const totalRatings = decorated.reduce((s, p: any) => s + (p.total_ratings || 0), 0);
      return { totalBosses: decorated.length, totalRatings };
    },
  });

  const { data: topBosses } = useQuery({
    queryKey: ["topBosses"],
    queryFn: async () => {
      const people = await loadAmazonians();
      const decorated = aggregateStats(people)
        .sort((a: any, b: any) => (b.average_rating || 0) - (a.average_rating || 0))
        .slice(0, 3);
      return decorated as any[];
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

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
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJoc2woMjQwIDYlIDkwJSAvIDAuMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
       
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
            Find. Rate. Bounce.
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
        
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-2 backdrop-blur-sm bg-card/50 p-2 rounded-2xl border shadow-lg">
                <Input
                  placeholder="Search by name, team, or position"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="border-0 bg-transparent focus-visible:ring-0 text-lg"
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity rounded-xl px-8"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/swipe")}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover:scale-105 rounded-xl px-8 py-6 text-lg shadow-lg"
              >
                Start Swiping
                <Heart className="ml-2 w-5 h-5" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/employees")}
                className="border-2 hover:bg-muted/50 transition-all hover:scale-105 rounded-xl px-8 py-6 text-lg shadow-lg"
              >
                Browse All
                <Users className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 text-left backdrop-blur-sm bg-card/30 border border-border/40 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start">
              <div className="rounded-xl p-2 bg-primary/10 text-primary">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-4xl font-bold text-foreground">
              {stats?.totalBosses || 0}
            </div>
            <div className="text-muted-foreground font-medium">Amazonians Rated</div>
          </Card>

          <Card className="p-6 text-center backdrop-blur-sm bg-card/50 border-2 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-secondary" />
            <div className="text-4xl font-bold text-foreground mb-2">
              {stats?.totalRatings || 0}
            </div>
            <div className="text-muted-foreground font-medium">Total Ratings</div>
          </Card>

          <Card className="p-6 text-center backdrop-blur-sm bg-card/50 border-2 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Heart className="w-12 h-12 mx-auto mb-4 text-accent" />
            <div className="text-4xl font-bold text-foreground mb-2">100%</div>
            <div className="text-muted-foreground font-medium">Anonymous</div>
          </Card>
        </div>
      </section>

      {/* Top Rated Section */}
      {topBosses && topBosses.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Top Rated Amazonians
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {topBosses.map((boss) => (
              <Card
                key={boss.username}
                className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105"
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
        </section>
      )}
    </div>
  );
};

export default Index;
