import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Heart, X, Star, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loadAmazonians, aggregateStats, addComment, addRating, getComments } from "@/lib/data";
import { toast } from "sonner";

const BossProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [nickname, setNickname] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  const { data: boss, isLoading } = useQuery({
    queryKey: ["boss", id],
    queryFn: async () => {
      const people = await loadAmazonians();
      const person = people.find((p) => p.username === id);
      if (!person) return null as any;
      const [decorated] = aggregateStats([person]);
      return decorated as any;
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      return getComments().filter((c) => c.username === id).sort((a, b) => b.created_at - a.created_at) as any[];
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!newComment.trim()) {
        throw new Error("Comment cannot be empty");
      }
      addComment({ username: id as string, content: newComment, nickname: nickname || "Anonymous", parent_id: null });
    },
    onSuccess: () => {
      toast.success("Comment posted!");
      setNewComment("");
      setNickname("");
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
    },
    onError: () => {
      toast.error("Failed to post comment");
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async (ratingValue: number) => {
      addRating({ username: id as string, rating: ratingValue, nickname: nickname || "Anonymous" });
    },
    onSuccess: () => {
      toast.success("Rating submitted!");
      setRating(0);
      setNickname("");
      queryClient.invalidateQueries({ queryKey: ["boss", id] });
    },
    onError: () => {
      toast.error("Failed to submit rating");
    },
  });

  const handleSubmitRating = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    ratingMutation.mutate(rating);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl font-semibold text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!boss) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-2xl font-bold mb-4">Amazonian not found</div>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="ml-4 text-xl font-bold">{boss.full_name}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header */}
        <Card className="overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3 aspect-square overflow-hidden">
              <img
                src={boss.photo_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600"}
                alt={boss.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 md:w-2/3">
              <h2 className="text-4xl font-bold mb-4">{boss.full_name}</h2>
              <p className="text-xl text-muted-foreground mb-2">{boss.job_title}</p>

              {boss.bio && (
                <p className="text-muted-foreground mb-6 leading-relaxed">{boss.bio}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {boss.average_rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-secondary mb-1">
                    {boss.total_likes}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Heart className="w-4 h-4" /> Likes
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-destructive mb-1">
                    {boss.total_dislikes}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <X className="w-4 h-4" /> Dislikes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Rate Section */}
        <Card className="p-6 mb-8">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" />
            Rate This Boss
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredStar || rating)
                        ? "fill-primary text-primary"
                        : "text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>

            <Input
              placeholder="Nickname (optional)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="max-w-xs"
            />

            <Button
              onClick={handleSubmitRating}
              disabled={rating === 0}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Submit Rating
            </Button>
          </div>
        </Card>

        {/* Comments Section */}
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Comments ({comments?.length || 0})
          </h3>

          {/* Add Comment */}
          <div className="mb-8 space-y-4">
            <Textarea
              placeholder="Share your experience working with this boss..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-32"
            />
            <div className="flex gap-4">
              <Input
                placeholder="Nickname (optional)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="max-w-xs"
              />
              <Button
                onClick={() => commentMutation.mutate()}
                disabled={!newComment.trim()}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Post Comment
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <Card key={comment.id} className="p-4 bg-muted/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-primary">
                      {comment.user_nickname || "Anonymous"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-foreground mb-3 leading-relaxed">{comment.content}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      {comment.upvotes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-destructive transition-colors">
                      <ThumbsDown className="w-4 h-4" />
                      {comment.downvotes}
                    </button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to share your experience!
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BossProfile;
