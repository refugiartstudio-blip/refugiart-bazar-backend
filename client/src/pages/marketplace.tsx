import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ArtworkCard from "@/components/artwork-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ArtworkWithArtist } from "@shared/schema";

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data: artworks = [], isLoading } = useQuery<ArtworkWithArtist[]>({
    queryKey: ["/api/artworks", { category: selectedCategory === "all" ? undefined : selectedCategory }],
  });

  // Sort artworks based on selected option
  const sortedArtworks = [...artworks].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
      case "popular":
        return (b.likeCount || 0) - (a.likeCount || 0);
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-artspace-gray-50 to-artspace-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-playfair font-bold text-artspace-gray-900 mb-4">
            Discover Amazing <span className="artspace-accent">Digital Art</span>
          </h2>
          <p className="text-xl text-artspace-gray-600 max-w-2xl mx-auto">
            Browse through thousands of unique artworks from talented artists worldwide
          </p>
        </div>
      </section>

      {/* Filters and Artworks */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-2xl font-playfair font-bold">All Artworks</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48" data-testid="select-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Digital Painting">Digital Painting</SelectItem>
                  <SelectItem value="3D Art">3D Art</SelectItem>
                  <SelectItem value="Photography">Photography</SelectItem>
                  <SelectItem value="Illustration">Illustration</SelectItem>
                  <SelectItem value="Abstract">Abstract</SelectItem>
                  <SelectItem value="Concept Art">Concept Art</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-artspace-gray-600 mb-6" data-testid="text-results-count">
            {isLoading ? "Loading..." : `${sortedArtworks.length} artworks found`}
          </p>

          {/* Artwork Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
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
            ) : sortedArtworks.length > 0 ? (
              sortedArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-artspace-gray-500">No artworks found</p>
                <p className="text-artspace-gray-400 mt-2">Try adjusting your filters or check back later</p>
              </div>
            )}
          </div>

          {/* Load More */}
          {sortedArtworks.length > 0 && (
            <div className="text-center mt-12">
              <Button 
                className="bg-artspace-gray-900 text-white hover:bg-artspace-gray-800 px-8 py-3"
                data-testid="button-load-more-marketplace"
              >
                Load More Artworks
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
