import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AddBoss = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    company: "",
    photoUrl: "",
    bio: "",
  });

  const addBossMutation = useMutation({
    mutationFn: async () => {
      if (!formData.name.trim() || !formData.position.trim()) {
        throw new Error("Name and position are required");
      }

      const { data, error } = await supabase
        .from("bosses")
        .insert({
          name: formData.name,
          position: formData.position,
          company: formData.company || null,
          photo_url: formData.photoUrl || null,
          bio: formData.bio || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Boss added successfully!");
      queryClient.invalidateQueries({ queryKey: ["bosses"] });
      navigate(`/boss/${data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add boss");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBossMutation.mutate();
  };

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
          <h1 className="ml-4 text-xl font-bold">Add a Boss</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Add a New Boss</h2>
            <p className="text-muted-foreground">
              Help others by adding information about a boss or manager not yet in our database.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-base font-semibold">
                Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., John Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="position" className="text-base font-semibold">
                Position *
              </Label>
              <Input
                id="position"
                placeholder="e.g., Senior Manager"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="company" className="text-base font-semibold">
                Company
              </Label>
              <Input
                id="company"
                placeholder="e.g., Tech Corp Inc."
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="photoUrl" className="text-base font-semibold">
                Photo URL
              </Label>
              <Input
                id="photoUrl"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Paste a URL to an image (optional)
              </p>
            </div>

            <div>
              <Label htmlFor="bio" className="text-base font-semibold">
                Bio / Description
              </Label>
              <Textarea
                id="bio"
                placeholder="Share some information about this person's management style, personality, or notable characteristics..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-2 min-h-32"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                disabled={addBossMutation.isPending}
              >
                {addBossMutation.isPending ? "Adding..." : "Add Boss"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddBoss;
