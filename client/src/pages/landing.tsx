import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-artspace-gray-50 to-artspace-gray-100">
      {/* Header */}
      <header className="border-b border-artspace-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-playfair font-bold text-artspace-gray-900">ArtSpace</h1>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-artspace-accent hover:bg-artspace-accent text-white"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl font-playfair font-bold text-artspace-gray-900 leading-tight">
                Discover & Collect 
                <span className="artspace-accent"> Digital Art</span>
              </h2>
              <p className="text-xl text-artspace-gray-600 leading-relaxed">
                Explore thousands of unique digital artworks from talented artists worldwide. 
                Buy, sell, and showcase your collection in our vibrant marketplace.
              </p>
              <div className="flex space-x-4">
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-artspace-accent hover:bg-artspace-accent text-white px-8 py-3 text-lg"
                  data-testid="button-start-exploring"
                >
                  Start Exploring
                </Button>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  variant="outline" 
                  className="border-artspace-gray-300 text-artspace-gray-700 hover:border-artspace-accent hover:text-artspace-accent px-8 py-3 text-lg"
                  data-testid="button-become-artist"
                >
                  Become an Artist
                </Button>
              </div>
            </div>
            <div className="relative">
              {/* Featured artwork grid */}
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

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-artspace-accent to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-playfair font-bold text-white mb-6">
            Join Our Creative Community
          </h3>
          <p className="text-xl text-orange-100 mb-8 leading-relaxed">
            Whether you're an artist looking to showcase your work or a collector searching for unique pieces, 
            ArtSpace is your gateway to the digital art world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-white text-artspace-accent hover:bg-gray-100 px-8 py-4 text-lg"
              data-testid="button-start-selling"
            >
              Start Selling Art
            </Button>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-artspace-accent px-8 py-4 text-lg"
              data-testid="button-explore-marketplace"
            >
              Explore Marketplace
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-artspace-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-playfair font-bold mb-4">ArtSpace</h4>
            <p className="text-artspace-gray-400 mb-8">
              The premier marketplace for digital art, connecting artists and collectors worldwide.
            </p>
            <div className="border-t border-artspace-gray-800 pt-8">
              <p className="text-artspace-gray-400">&copy; 2024 ArtSpace. All rights reserved. Built for artists, by artists.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
