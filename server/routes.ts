import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertArtworkSchema, 
  insertCommentSchema, 
  insertLikeSchema, 
  insertFollowSchema,
  insertPurchaseSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get('/api/users/artists', async (req, res) => {
    try {
      const artists = await storage.getUsersByRole(1);
      res.json(artists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ message: "Failed to fetch artists" });
    }
  });

  app.get('/api/users/:id/profile', async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.claims?.sub;
      const profile = await storage.getArtistProfile(id, currentUserId);
      
      if (!profile) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching artist profile:", error);
      res.status(500).json({ message: "Failed to fetch artist profile" });
    }
  });

  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bio, specialization, isArtist } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.upsertUser({
        ...user,
        bio,
        specialization,
        isArtist: isArtist ? 1 : 0,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Artwork routes
  app.get('/api/artworks', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const category = req.query.category as string;
      
      const artworks = await storage.getArtworks(limit, offset, category);
      res.json(artworks);
    } catch (error) {
      console.error("Error fetching artworks:", error);
      res.status(500).json({ message: "Failed to fetch artworks" });
    }
  });

  app.get('/api/artworks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.claims?.sub;
      
      // Increment view count
      await storage.incrementArtworkViews(id);
      
      const artwork = await storage.getArtworkWithArtist(id, currentUserId);
      
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }
      
      res.json(artwork);
    } catch (error) {
      console.error("Error fetching artwork:", error);
      res.status(500).json({ message: "Failed to fetch artwork" });
    }
  });

  app.post('/api/artworks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const artworkData = insertArtworkSchema.parse({
        ...req.body,
        artistId: userId,
      });
      
      const artwork = await storage.createArtwork(artworkData);
      res.status(201).json(artwork);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid artwork data", errors: error.errors });
      }
      console.error("Error creating artwork:", error);
      res.status(500).json({ message: "Failed to create artwork" });
    }
  });

  app.get('/api/artists/:id/artworks', async (req, res) => {
    try {
      const { id } = req.params;
      const artworks = await storage.getArtworksByArtist(id);
      res.json(artworks);
    } catch (error) {
      console.error("Error fetching artist artworks:", error);
      res.status(500).json({ message: "Failed to fetch artist artworks" });
    }
  });

  // Like routes
  app.post('/api/artworks/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id: artworkId } = req.params;
      
      const isLiked = await storage.toggleLike(userId, artworkId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Comment routes
  app.get('/api/artworks/:id/comments', async (req, res) => {
    try {
      const { id } = req.params;
      const comments = await storage.getCommentsByArtwork(id);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/artworks/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id: artworkId } = req.params;
      
      const commentData = insertCommentSchema.parse({
        ...req.body,
        userId,
        artworkId,
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Follow routes
  app.post('/api/users/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const { id: followeeId } = req.params;
      
      if (followerId === followeeId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      const isFollowing = await storage.toggleFollow(followerId, followeeId);
      res.json({ isFollowing });
    } catch (error) {
      console.error("Error toggling follow:", error);
      res.status(500).json({ message: "Failed to toggle follow" });
    }
  });

  // Purchase routes
  app.post('/api/artworks/:id/purchase', isAuthenticated, async (req: any, res) => {
    try {
      const buyerId = req.user.claims.sub;
      const { id: artworkId } = req.params;
      
      const artwork = await storage.getArtwork(artworkId);
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }
      
      if (artwork.isAvailable === 0) {
        return res.status(400).json({ message: "Artwork is no longer available" });
      }

      if (artwork.artistId === buyerId) {
        return res.status(400).json({ message: "Cannot purchase your own artwork" });
      }

      const buyer = await storage.getUser(buyerId);
      if (!buyer) {
        return res.status(404).json({ message: "Buyer not found" });
      }

      const buyerBalance = parseFloat(buyer.rbBalance || "0");
      const artworkPrice = parseFloat(artwork.price);

      if (buyerBalance < artworkPrice) {
        return res.status(400).json({ message: "Insufficient RB balance" });
      }

      // Create purchase record
      const purchaseData = insertPurchaseSchema.parse({
        buyerId,
        artworkId,
        price: artwork.price,
      });
      
      const purchase = await storage.createPurchase(purchaseData);
      
      // Update artwork availability
      await storage.updateArtworkAvailability(artworkId, 0);
      
      // Update buyer balance
      const newBuyerBalance = (buyerBalance - artworkPrice).toFixed(2);
      await storage.updateUserBalance(buyerId, newBuyerBalance);
      
      // Update artist balance
      const artist = await storage.getUser(artwork.artistId);
      if (artist) {
        const artistBalance = parseFloat(artist.rbBalance || "0");
        const newArtistBalance = (artistBalance + artworkPrice).toFixed(2);
        await storage.updateUserBalance(artwork.artistId, newArtistBalance);
      }
      
      res.status(201).json(purchase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid purchase data", errors: error.errors });
      }
      console.error("Error processing purchase:", error);
      res.status(500).json({ message: "Failed to process purchase" });
    }
  });

  app.get('/api/users/purchases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchases = await storage.getPurchasesByUser(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
