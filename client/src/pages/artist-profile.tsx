import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import ArtworkCard from "@/components/artwork-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Image, Heart, Calendar } from "lucide-react";
import type { ArtistProfile, Artwork, ArtworkWithArtist } from "@shared/schema";

export default function ArtistProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: artist, isLoading: artistLoading } = useQuery<ArtistProfile>({
    queryKey: ["/api/users", id, "profile"],
    enabled: !!id,
  });

  const { data: artworks = [], isLoading: artworksLoading } = useQuery<Artwork[]>({
    queryKey: ["/api/artists", id, "artworks"],
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/users/${id}/follow`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", id, "profile"] });
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
    if (user.id === artist?.id) {
      toast({
        title: "Error",
        description: "You cannot follow yourself.",
        variant: "destructive",
      });
      return;
    }
    followMutation.mutate();
  };

  // Convert artworks to ArtworkWithArtist format for ArtworkCard
  const artworksWithArtist: ArtworkWithArtist[] = artworks.map(artwork => ({
    ...artwork,
    artist: artist!,
  }));

  if (artistLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="text-center mb-12">
              <div className="w-32 h-32 bg-artspace-gray-200 rounded-full mx-auto mb-6"></div>
              <div className="h-8 bg-artspace-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-artspace-gray-200 rounded w-48 mx-auto mb-6"></div>
              <div className="h-12 bg-artspace-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-artspace-gray-900 mb-4">Artist Not Found</h2>
            <p className="text-artspace-gray-600 mb-8">The artist profile you're looking for doesn't exist.</p>
            <Link href="/marketplace">
              <Button className="bg-artspace-accent hover:bg-artspace-accent text-white">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Artist Hero Section */}
      <section className="py-20 bg-gradient-to-r from-artspace-gray-50 to-artspace-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img
            src={artist.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=200&h=200&fit=crop&crop=face"}
            alt={`${artist.firstName} ${artist.lastName}`}
            className="w-32 h-32 rounded-full object-cover mx-auto mb-6 shadow-lg"
            data-testid="img-artist-profile"
          />
          <h1 className="text-4xl font-playfair font-bold text-artspace-gray-900 mb-2" data-testid="text-artist-name">
            {artist.firstName} {artist.lastName}
          </h1>
          <p className="text-xl text-artspace-gray-600 mb-4" data-testid="text-artist-specialization">
            {artist.specialization || 'Digital Artist'}
          </p>
          {artist.bio && (
            <p className="text-artspace-gray-700 max-w-2xl mx-auto mb-6 leading-relaxed" data-testid="text-artist-bio">
              {artist.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex justify-center space-x-8 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-artspace-accent" data-testid="text-artwork-count">
                {artist.artworkCount}
              </div>
              <div className="text-sm text-artspace-gray-600">Artworks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-artspace-accent" data-testid="text-follower-count">
                {artist.followerCount || 0}
              </div>
              <div className="text-sm text-artspace-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-artspace-accent" data-testid="text-member-since">
                {new Date(artist.createdAt!).getFullYear()}
              </div>
              <div className="text-sm text-artspace-gray-600">Member Since</div>
            </div>
          </div>

          {/* Actions */}
          {user && user.id !== artist.id && (
            <Button
              onClick={handleFollow}
              disabled={followMutation.isPending}
              className={`px-8 py-3 text-lg ${
                artist.isFollowing
                  ? 'bg-artspace-gray-200 text-artspace-gray-700 hover:bg-artspace-gray-300'
                  : 'bg-artspace-accent text-white hover:bg-artspace-accent'
              }`}
              data-testid="button-follow-artist"
            >
              {followMutation.isPending
                ? "Loading..."
                : artist.isFollowing
                ? "Following"
                : "Follow Artist"
              }
            </Button>
          )}
        </div>
      </section>

      {/* Artist's Artworks */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-playfair font-bold text-artspace-gray-900">
              Artworks by {artist.firstName}
            </h3>
            {artist.isArtist === 1 && (
              <Badge variant="secondary" className="px-3 py-1">
                <Image className="h-4 w-4 mr-2" />
                Verified Artist
              </Badge>
            )}
          </div>

          {artworksLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                  <div className="w-full h-64 bg-artspace-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-artspace-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-artspace-gray-200 rounded mb-2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-artspace-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-artspace-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : artworksWithArtist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artworksWithArtist.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12" data-testid="text-no-artworks">
              <Image className="h-16 w-16 text-artspace-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-artspace-gray-900 mb-2">No Artworks Yet</h4>
              <p className="text-artspace-gray-600">
                {user?.id === artist.id
                  ? "You haven't uploaded any artworks yet. Start creating!"
                  : `${artist.firstName} hasn't uploaded any artworks yet.`
                }
              </p>
              {user?.id === artist.id && (
                <Link href="/upload">
                  <Button className="mt-4 bg-artspace-accent hover:bg-artspace-accent text-white" data-testid="button-upload-first-artwork">
                    Upload Your First Artwork
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
