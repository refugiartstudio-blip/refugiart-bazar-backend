import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import type { ArtworkWithArtist } from "@shared/schema";

interface ArtworkCardProps {
  artwork: ArtworkWithArtist;
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(artwork.isLiked || false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/artworks/${artwork.id}/like`);
      return response.json();
    },
    onSuccess: (data) => {
      setIsLiked(data.isLiked);
      // Invalidate artwork queries to update like counts
      queryClient.invalidateQueries({ queryKey: ["/api/artworks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/artworks", artwork.id] });
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
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    likeMutation.mutate();
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group">
      <Link href={`/artwork/${artwork.id}`} className="block">
        <div className="relative">
          <img 
            src={artwork.imageUrl} 
            alt={artwork.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid={`img-artwork-${artwork.id}`}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <Button 
              className="bg-white text-artspace-gray-900 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
              data-testid={`button-view-details-${artwork.id}`}
            >
              View Details
            </Button>
          </div>
          <Button
            variant="ghost"
            className="absolute top-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 hover:bg-white/20"
            onClick={handleLike}
            disabled={likeMutation.isPending}
            data-testid={`button-like-${artwork.id}`}
          >
            <Heart 
              className={`h-5 w-5 transition-all duration-200 ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-white hover:text-red-500'
              } ${likeMutation.isPending ? 'animate-pulse' : ''}`} 
            />
          </Button>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/artwork/${artwork.id}`}>
          <h4 className="font-semibold text-lg mb-1 hover:text-artspace-accent transition-colors cursor-pointer" data-testid={`text-artwork-title-${artwork.id}`}>
            {artwork.title}
          </h4>
        </Link>
        <Link href={`/artist/${artwork.artist.id}`}>
          <p className="text-artspace-gray-600 text-sm mb-2 hover:text-artspace-accent transition-colors cursor-pointer" data-testid={`text-artist-name-${artwork.id}`}>
            by {artwork.artist.firstName} {artwork.artist.lastName}
          </p>
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-artspace-accent font-bold text-lg" data-testid={`text-price-${artwork.id}`}>
            {artwork.price} RB
          </span>
          <div className="flex items-center space-x-2 text-sm text-artspace-gray-500">
            <Heart className="h-3 w-3" />
            <span data-testid={`text-like-count-${artwork.id}`}>{artwork.likeCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
