import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loadAmazonians, aggregateStats } from "@/lib/data";
import { toast } from "sonner";

const Swipe = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);

  const { data: bosses, isLoading } = useQuery({
    queryKey: ["bosses"],
    queryFn: async () => {
      const people = await loadAmazonians();
      return aggregateStats(people) as any[];
    },
  });

  const reactionMutation = useMutation({
    mutationFn: async (_: { bossId: string; type: "like" | "dislike" }) => {
      // Placeholder: could track local reactions later
    },
  });

  const currentBoss = bosses?.[currentIndex];

  const handleSwipe = (direction: "left" | "right") => {
    if (!currentBoss) return;

    setSwipeDirection(direction);
    
    const reactionType = direction === "right" ? "like" : "dislike";
    reactionMutation.mutate({ bossId: currentBoss.id, type: reactionType });

    toast.success(
      direction === "right" 
        ? `You liked ${currentBoss.name}!` 
        : `You disliked ${currentBoss.name}`
    );

    setTimeout(() => {
      setSwipeDirection(null);
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  };

  const handleViewProfile = () => {
    if (currentBoss) {
      navigate(`/boss/${currentBoss.username}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl font-semibold text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!bosses || bosses.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-2xl font-bold mb-4">No bosses to swipe yet!</div>
        <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  if (currentIndex >= bosses.length) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-3xl font-bold mb-4">You've seen them all!</div>
        <Button onClick={() => setCurrentIndex(0)} className="mb-2">
          Start Over
        </Button>
        <Button variant="outline" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col">
      {/* Header */}
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="text-lg font-semibold text-muted-foreground">
          {currentIndex + 1} / {bosses.length}
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Swipe Card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="relative w-full max-w-md">
          {currentBoss && (
            <div
              className={`relative ${
                swipeDirection === "left"
                  ? "animate-swipe-left"
                  : swipeDirection === "right"
                  ? "animate-swipe-right"
                  : ""
              }`}
            >
              {/* Card */}
              <div
                className="bg-card rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
                onClick={handleViewProfile}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={currentBoss.photo_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600"}
                    alt={currentBoss.full_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h2 className="text-3xl font-bold mb-2">{currentBoss.full_name}</h2>
                    <p className="text-lg mb-1 opacity-90">{currentBoss.job_title}</p>
                    
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <span className="text-2xl font-bold">
                          {currentBoss.average_rating.toFixed(1)}
                        </span>
                        <span className="text-sm">★</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm opacity-90">
                        <Heart className="w-4 h-4 fill-current" />
                        <span>{currentBoss.total_likes}</span>
                        <span className="mx-1">•</span>
                        <X className="w-4 h-4" />
                        <span>{currentBoss.total_dislikes}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {currentBoss.bio && (
                  <div className="p-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {currentBoss.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-6 mt-8">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleSwipe("left")}
                  className="w-20 h-20 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-white transition-all hover:scale-110"
                >
                  <X className="w-8 h-8" />
                </Button>

                <Button
                  size="lg"
                  onClick={() => handleSwipe("right")}
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover:scale-110"
                >
                  <Heart className="w-8 h-8" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Swipe;
