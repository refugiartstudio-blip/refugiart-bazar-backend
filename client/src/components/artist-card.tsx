import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import type { User } from "@shared/schema";

interface ArtistCardProps {
  artist: User;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/users/${artist.id}/follow`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate artist queries to update follow status
      queryClient.invalidateQueries({ queryKey: ["/api/users/artists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", artist.id, "profile"] });
      toast({
        title: "Success",
        description: "Follow status updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFollow = () => {
    if (!user) return;
    if (user.id === artist.id) {
      toast({
        title: "Error",
        description: "You cannot follow yourself.",
        variant: "destructive",
      });
      return;
    }
    followMutation.mutate();
  };

  return (
    <div className="flex-shrink-0 w-64 bg-white rounded-xl border border-artspace-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/artist/${artist.id}`}>
        <img 
          src={artist.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=256&h=200&fit=crop&crop=face"} 
          alt={`${artist.firstName} ${artist.lastName}`}
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
          data-testid={`img-artist-${artist.id}`}
        />
      </Link>
      <div className="p-4">
        <Link href={`/artist/${artist.id}`}>
          <h4 className="font-semibold text-lg hover:text-artspace-accent transition-colors cursor-pointer" data-testid={`text-artist-name-${artist.id}`}>
            {artist.firstName} {artist.lastName}
          </h4>
        </Link>
        <p className="text-artspace-gray-600 text-sm" data-testid={`text-artist-specialization-${artist.id}`}>
          {artist.specialization || 'Digital Artist'}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-artspace-gray-500" data-testid={`text-follower-count-${artist.id}`}>
            {artist.followerCount || 0} followers
          </span>
          {user && user.id !== artist.id && (
            <Button 
              onClick={handleFollow}
              disabled={followMutation.isPending}
              className="bg-artspace-accent text-white px-4 py-1 rounded-full text-sm hover:bg-artspace-accent"
              data-testid={`button-follow-${artist.id}`}
            >
              {followMutation.isPending ? 'Loading...' : 'Follow'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
