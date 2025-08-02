import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import ArtworkCard from "@/components/artwork-card";
import ArtistCard from "@/components/artist-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import type { ArtworkWithArtist, User } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: artworks = [], isLoading: artworksLoading } = useQuery<ArtworkWithArtist[]>({
    queryKey: ["/api/artworks", { category: selectedCategory === "all" ? undefined : selectedCategory }],
  });

  const { data: artists = [], isLoading: artistsLoading } = useQuery<User[]>({
    queryKey: ["/api/users/artists"],
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-artspace-gray-50 to-artspace-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl font-playfair font-bold text-artspace-gray-900 leading-tight">
                Welcome back,
                <span className="artspace-accent"> {user?.firstName || 'Artist'}</span>
              </h2>
              <p className="text-xl text-artspace-gray-600 leading-relaxed">
                Discover new artworks, connect with artists, and grow your collection in our vibrant marketplace.
              </p>
              <div className="flex space-x-4">
                <Link href="/marketplace">
                  <Button 
                    className="bg-artspace-accent hover:bg-artspace-accent text-white px-8 py-3 text-lg"
                    data-testid="button-explore-marketplace"
                  >
                    Explore Marketplace
                  </Button>
                </Link>
                <Link href="/upload">
                  <Button 
                    variant="outline" 
                    className="border-artspace-gray-300 text-artspace-gray-700 hover:border-artspace-accent hover:text-artspace-accent px-8 py-3 text-lg"
                    data-testid="button-upload-art"
                  >
                    Upload Your Art
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&w=300&h=400&fit=crop" 
                  alt="Abstract digital art" 
                  className="rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300"
                />
                <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&w=300&h=400&fit=crop" 
                  alt="Geometric digital art" 
                  className="rounded-xl shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300 mt-8"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-playfair font-bold">Featured Artists</h3>
            <Link href="/marketplace">
              <Button variant="link" className="artspace-accent hover:text-orange-600" data-testid="link-view-all-artists">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {artistsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64 bg-white rounded-xl border border-artspace-gray-200 p-4 animate-pulse">
                  <div className="w-full h-48 bg-artspace-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-artspace-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-artspace-gray-200 rounded mb-3"></div>
                  <div className="h-8 bg-artspace-gray-200 rounded"></div>
                </div>
              ))
            ) : (
              artists.slice(0, 4).map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Latest Artworks */}
      <section className="py-16 bg-artspace-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-playfair font-bold">Latest Artworks</h3>
            <div className="flex space-x-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48" data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Digital Painting">Digital Painting</SelectItem>
                  <SelectItem value="3D Art">3D Art</SelectItem>
                  <SelectItem value="Photography">Photography</SelectItem>
                  <SelectItem value="Illustration">Illustration</SelectItem>
                  <SelectItem value="Abstract">Abstract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworksLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
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
              ))
            ) : (
              artworks.slice(0, 12).map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Link href="/marketplace">
              <Button 
                className="bg-artspace-gray-900 text-white hover:bg-artspace-gray-800 px-8 py-3"
                data-testid="button-load-more"
              >
                Load More Artworks
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <Link href="/upload">
        <Button 
          className="fixed bottom-8 right-8 bg-artspace-accent text-white w-16 h-16 rounded-full shadow-lg hover:shadow-xl hover:bg-artspace-accent animate-float"
          data-testid="button-float-upload"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
