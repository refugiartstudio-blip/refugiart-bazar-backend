import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ShoppingCart, Search, Menu, X } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to marketplace with search term
      window.location.href = `/marketplace?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-artspace-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <h1 className="text-2xl font-playfair font-bold text-artspace-gray-900 cursor-pointer" data-testid="link-home">
              ArtSpace
            </h1>
          </Link>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Search artists, artwork..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-artspace-gray-100 border-0 rounded-full py-2 px-4 pl-10 focus:bg-white focus:ring-2 focus:ring-artspace-accent focus:outline-none transition-all"
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-artspace-gray-400" />
            </form>
          </div>
          
          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/marketplace">
              <Button 
                variant="ghost" 
                className={`text-artspace-gray-700 hover:text-artspace-accent transition-colors ${
                  location === '/marketplace' ? 'text-artspace-accent' : ''
                }`}
                data-testid="link-marketplace"
              >
                Marketplace
              </Button>
            </Link>
            <Link href="/upload">
              <Button 
                variant="ghost" 
                className={`text-artspace-gray-700 hover:text-artspace-accent transition-colors ${
                  location === '/upload' ? 'text-artspace-accent' : ''
                }`}
                data-testid="link-sell"
              >
                Sell
              </Button>
            </Link>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="relative p-2 text-artspace-gray-700 hover:text-artspace-accent transition-colors"
                data-testid="button-favorites"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                className="relative p-2 text-artspace-gray-700 hover:text-artspace-accent transition-colors"
                data-testid="button-cart"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              
              {/* Profile with RB Balance */}
              <div className="flex items-center space-x-3 bg-artspace-gray-100 rounded-full px-3 py-1">
                <span className="text-sm font-medium text-artspace-gray-700" data-testid="text-rb-balance">
                  {user?.rbBalance || '0'} RB
                </span>
                <div className="relative">
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-artspace-accent transition-all"
                    onClick={() => window.location.href = '/api/logout'}
                    data-testid="img-profile"
                  />
                </div>
              </div>
            </div>
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-artspace-gray-200">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <Input
                type="text"
                placeholder="Search artists, artwork..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-artspace-gray-100 border-0 rounded-full py-2 px-4 pl-10 focus:bg-white focus:ring-2 focus:ring-artspace-accent focus:outline-none transition-all"
                data-testid="input-search-mobile"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-artspace-gray-400" />
            </form>

            {/* Mobile Links */}
            <div className="space-y-2">
              <Link href="/marketplace">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-artspace-gray-700 hover:text-artspace-accent"
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid="link-marketplace-mobile"
                >
                  Marketplace
                </Button>
              </Link>
              <Link href="/upload">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-artspace-gray-700 hover:text-artspace-accent"
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid="link-sell-mobile"
                >
                  Sell
                </Button>
              </Link>
              <div className="flex items-center justify-between pt-4 border-t border-artspace-gray-200">
                <span className="text-sm font-medium text-artspace-gray-700" data-testid="text-rb-balance-mobile">
                  {user?.rbBalance || '0'} RB
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-sm"
                  data-testid="button-logout-mobile"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
