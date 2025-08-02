import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import UploadForm from "@/components/upload-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Palette, Upload } from "lucide-react";

export default function UploadArtwork() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-artspace-gray-200 rounded w-48 mb-6"></div>
            <div className="bg-white rounded-xl border border-artspace-gray-200 p-8">
              <div className="h-6 bg-artspace-gray-200 rounded w-64 mb-6"></div>
              <div className="space-y-4">
                <div className="h-32 bg-artspace-gray-200 rounded"></div>
                <div className="h-10 bg-artspace-gray-200 rounded"></div>
                <div className="h-24 bg-artspace-gray-200 rounded"></div>
                <div className="h-10 bg-artspace-gray-200 rounded"></div>
                <div className="h-10 bg-artspace-gray-200 rounded"></div>
                <div className="h-12 bg-artspace-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-artspace-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-artspace-gray-50 to-artspace-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/marketplace">
              <Button 
                variant="ghost" 
                className="text-artspace-gray-600 hover:text-artspace-accent"
                data-testid="button-back-to-marketplace"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-artspace-accent bg-opacity-10 p-4 rounded-full">
                <Upload className="h-12 w-12 text-artspace-accent" />
              </div>
            </div>
            <h1 className="text-4xl font-playfair font-bold text-artspace-gray-900 mb-4">
              Share Your <span className="artspace-accent">Creative Vision</span>
            </h1>
            <p className="text-xl text-artspace-gray-600 max-w-2xl mx-auto leading-relaxed">
              Upload your digital artwork to our marketplace and connect with art lovers worldwide. 
              Set your price and start earning from your creativity.
            </p>
          </div>
        </div>
      </section>

      {/* Upload Form Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <UploadForm />
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white border-artspace-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <Palette className="h-6 w-6 text-artspace-accent" />
                <h3 className="text-xl font-semibold text-artspace-gray-900">Tips for Success</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-artspace-gray-700">
                <div>
                  <h4 className="font-semibold mb-2">High-Quality Images</h4>
                  <p className="text-sm">Upload high-resolution images (at least 1200px) for the best presentation of your artwork.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Compelling Descriptions</h4>
                  <p className="text-sm">Write detailed descriptions that tell the story behind your artwork and inspire potential buyers.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Fair Pricing</h4>
                  <p className="text-sm">Research similar artworks to price competitively while valuing your time and skill appropriately.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Proper Categories</h4>
                  <p className="text-sm">Choose the most accurate category to help collectors discover your work through search and filters.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
