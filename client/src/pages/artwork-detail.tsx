import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Eye, MessageCircle, User, Calendar } from "lucide-react";
import { Link } from "wouter";
import type { ArtworkWithArtist, CommentWithUser } from "@shared/schema";

export default function ArtworkDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  const { data: artwork, isLoading: artworkLoading } = useQuery<ArtworkWithArtist>({
    queryKey: ["/api/artworks", id],
    enabled: !!id,
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/artworks", id, "comments"],
    enabled: !!id,
  });

  // Set initial like status when artwork loads
  useState(() => {
    if (artwork?.isLiked !== undefined) {
      setIsLiked(artwork.isLiked);
    }
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/artworks/${id}/like`);
      return response.json();
    },
    onSuccess: (data) => {
      setIsLiked(data.isLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/artworks", id] });
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

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/artworks/${id}/comments`, { content });
      return response.json();
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/artworks", id, "comments"] });
      toast({
        title: "Success",
        description: "Comment added successfully!",
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
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/artworks/${id}/purchase`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful!",
        description: "Congratulations on your new artwork!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/artworks", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        title: "Purchase Failed",
        description: (error as Error).message || "Failed to purchase artwork. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!user) return;
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (!comment.trim() || !user) return;
    commentMutation.mutate(comment);
  };

  const handlePurchase = () => {
    if (!user) return;
    purchaseMutation.mutate();
  };

  if (artworkLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="w-full h-96 bg-artspace-gray-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-artspace-gray-200 rounded"></div>
                <div className="h-6 bg-artspace-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-artspace-gray-200 rounded w-1/2"></div>
                <div className="h-12 bg-artspace-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-artspace-gray-900 mb-4">Artwork Not Found</h2>
            <p className="text-artspace-gray-600 mb-8">The artwork you're looking for doesn't exist or has been removed.</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Artwork Image */}
          <div className="relative">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full h-auto max-h-[600px] object-cover rounded-xl shadow-lg"
              data-testid={`img-artwork-detail-${artwork.id}`}
            />
          </div>

          {/* Artwork Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-playfair font-bold text-artspace-gray-900 mb-2" data-testid="text-artwork-title">
                {artwork.title}
              </h1>
              <Link href={`/artist/${artwork.artist.id}`}>
                <p className="text-xl text-artspace-gray-600 hover:text-artspace-accent transition-colors cursor-pointer" data-testid="text-artist-name">
                  by {artwork.artist.firstName} {artwork.artist.lastName}
                </p>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-artspace-gray-500">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span data-testid="text-like-count">{artwork.likeCount || 0} likes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span data-testid="text-view-count">{artwork.viewCount || 0} views</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(artwork.createdAt!).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Description */}
            {artwork.description && (
              <div>
                <h3 className="text-lg font-semibold text-artspace-gray-900 mb-2">Description</h3>
                <p className="text-artspace-gray-700 leading-relaxed" data-testid="text-artwork-description">
                  {artwork.description}
                </p>
              </div>
            )}

            {/* Category */}
            <div>
              <span className="inline-block bg-artspace-gray-100 text-artspace-gray-700 px-3 py-1 rounded-full text-sm" data-testid="text-artwork-category">
                {artwork.category}
              </span>
            </div>

            {/* Price and Actions */}
            <div className="border-t border-artspace-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-artspace-accent" data-testid="text-artwork-price">
                  {artwork.price} RB
                </span>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleLike}
                    disabled={!user || likeMutation.isPending}
                    className={`${isLiked ? 'text-red-500 border-red-500' : ''}`}
                    data-testid="button-like-artwork"
                  >
                    <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    {isLiked ? 'Liked' : 'Like'}
                  </Button>
                </div>
              </div>

              {artwork.isAvailable === 1 && user && user.id !== artwork.artist.id && (
                <Button
                  onClick={handlePurchase}
                  disabled={purchaseMutation.isPending}
                  className="w-full bg-artspace-accent hover:bg-artspace-accent text-white py-3 text-lg"
                  data-testid="button-purchase-artwork"
                >
                  {purchaseMutation.isPending ? "Processing..." : "Purchase Artwork"}
                </Button>
              )}

              {artwork.isAvailable === 0 && (
                <Button disabled className="w-full py-3 text-lg" data-testid="button-sold-out">
                  Sold Out
                </Button>
              )}

              {user && user.id === artwork.artist.id && (
                <div className="text-center text-artspace-gray-500 py-3">
                  This is your artwork
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 border-t border-artspace-gray-200 pt-8">
          <div className="flex items-center space-x-2 mb-6">
            <MessageCircle className="h-6 w-6 text-artspace-gray-600" />
            <h3 className="text-2xl font-playfair font-bold text-artspace-gray-900">
              Comments ({comments.length})
            </h3>
          </div>

          {/* Add Comment */}
          {user && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex space-x-4">
                  <img
                    src={user.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"}
                    alt="Your profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <Textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mb-3"
                      data-testid="textarea-comment"
                    />
                    <Button
                      onClick={handleComment}
                      disabled={!comment.trim() || commentMutation.isPending}
                      className="bg-artspace-accent hover:bg-artspace-accent text-white"
                      data-testid="button-post-comment"
                    >
                      {commentMutation.isPending ? "Posting..." : "Post Comment"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {commentsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="flex space-x-4">
                      <div className="w-10 h-10 bg-artspace-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-artspace-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-artspace-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-artspace-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <div className="flex space-x-4">
                      <img
                        src={comment.user.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"}
                        alt={`${comment.user.firstName} ${comment.user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                        data-testid={`img-commenter-${comment.id}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Link href={`/artist/${comment.user.id}`}>
                            <span className="font-semibold text-artspace-gray-900 hover:text-artspace-accent transition-colors cursor-pointer" data-testid={`text-commenter-name-${comment.id}`}>
                              {comment.user.firstName} {comment.user.lastName}
                            </span>
                          </Link>
                          <span className="text-sm text-artspace-gray-500">
                            {new Date(comment.createdAt!).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-artspace-gray-700" data-testid={`text-comment-content-${comment.id}`}>
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-artspace-gray-500" data-testid="text-no-comments">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
