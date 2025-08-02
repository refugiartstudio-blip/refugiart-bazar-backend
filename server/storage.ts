import {
  users,
  artworks,
  likes,
  comments,
  follows,
  purchases,
  type User,
  type UpsertUser,
  type Artwork,
  type InsertArtwork,
  type Comment,
  type InsertComment,
  type Like,
  type InsertLike,
  type Follow,
  type InsertFollow,
  type Purchase,
  type InsertPurchase,
  type ArtworkWithArtist,
  type CommentWithUser,
  type ArtistProfile,
} from "@shared/schema";
import { randomUUID } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserBalance(userId: string, amount: string): Promise<void>;
  getUsersByRole(isArtist: number): Promise<User[]>;
  getArtistProfile(artistId: string, currentUserId?: string): Promise<ArtistProfile | undefined>;
  
  // Artwork operations
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  getArtwork(id: string): Promise<Artwork | undefined>;
  getArtworkWithArtist(id: string, currentUserId?: string): Promise<ArtworkWithArtist | undefined>;
  getArtworks(limit?: number, offset?: number, category?: string): Promise<ArtworkWithArtist[]>;
  getArtworksByArtist(artistId: string): Promise<Artwork[]>;
  updateArtworkAvailability(artworkId: string, isAvailable: number): Promise<void>;
  incrementArtworkViews(artworkId: string): Promise<void>;
  
  // Like operations
  toggleLike(userId: string, artworkId: string): Promise<boolean>;
  isArtworkLiked(userId: string, artworkId: string): Promise<boolean>;
  updateArtworkLikeCount(artworkId: string): Promise<void>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByArtwork(artworkId: string): Promise<CommentWithUser[]>;
  
  // Follow operations
  toggleFollow(followerId: string, followeeId: string): Promise<boolean>;
  isFollowing(followerId: string, followeeId: string): Promise<boolean>;
  updateFollowCounts(userId: string): Promise<void>;
  
  // Purchase operations
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchasesByUser(userId: string): Promise<Purchase[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private artworks: Map<string, Artwork>;
  private likes: Map<string, Like>;
  private comments: Map<string, Comment>;
  private follows: Map<string, Follow>;
  private purchases: Map<string, Purchase>;

  constructor() {
    this.users = new Map();
    this.artworks = new Map();
    this.likes = new Map();
    this.comments = new Map();
    this.follows = new Map();
    this.purchases = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      ...existingUser,
      ...userData,
      id: userData.id || randomUUID(),
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserBalance(userId: string, amount: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.rbBalance = amount;
      user.updatedAt = new Date();
      this.users.set(userId, user);
    }
  }

  async getUsersByRole(isArtist: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isArtist === isArtist);
  }

  async getArtistProfile(artistId: string, currentUserId?: string): Promise<ArtistProfile | undefined> {
    const artist = this.users.get(artistId);
    if (!artist) return undefined;

    const artworkCount = Array.from(this.artworks.values()).filter(a => a.artistId === artistId).length;
    const isFollowing = currentUserId ? await this.isFollowing(currentUserId, artistId) : false;

    return {
      ...artist,
      artworkCount,
      isFollowing,
    };
  }

  // Artwork operations
  async createArtwork(artworkData: InsertArtwork): Promise<Artwork> {
    const artwork: Artwork = {
      ...artworkData,
      id: randomUUID(),
      likeCount: 0,
      viewCount: 0,
      isAvailable: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.artworks.set(artwork.id, artwork);
    return artwork;
  }

  async getArtwork(id: string): Promise<Artwork | undefined> {
    return this.artworks.get(id);
  }

  async getArtworkWithArtist(id: string, currentUserId?: string): Promise<ArtworkWithArtist | undefined> {
    const artwork = this.artworks.get(id);
    if (!artwork) return undefined;

    const artist = this.users.get(artwork.artistId);
    if (!artist) return undefined;

    const isLiked = currentUserId ? await this.isArtworkLiked(currentUserId, id) : false;

    return {
      ...artwork,
      artist,
      isLiked,
    };
  }

  async getArtworks(limit = 20, offset = 0, category?: string): Promise<ArtworkWithArtist[]> {
    let artworkList = Array.from(this.artworks.values());
    
    if (category && category !== 'all') {
      artworkList = artworkList.filter(a => a.category === category);
    }

    // Sort by creation date, newest first
    artworkList.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    
    const paginatedArtworks = artworkList.slice(offset, offset + limit);
    
    const result: ArtworkWithArtist[] = [];
    for (const artwork of paginatedArtworks) {
      const artist = this.users.get(artwork.artistId);
      if (artist) {
        result.push({
          ...artwork,
          artist,
        });
      }
    }
    
    return result;
  }

  async getArtworksByArtist(artistId: string): Promise<Artwork[]> {
    return Array.from(this.artworks.values()).filter(a => a.artistId === artistId);
  }

  async updateArtworkAvailability(artworkId: string, isAvailable: number): Promise<void> {
    const artwork = this.artworks.get(artworkId);
    if (artwork) {
      artwork.isAvailable = isAvailable;
      artwork.updatedAt = new Date();
      this.artworks.set(artworkId, artwork);
    }
  }

  async incrementArtworkViews(artworkId: string): Promise<void> {
    const artwork = this.artworks.get(artworkId);
    if (artwork) {
      artwork.viewCount = (artwork.viewCount || 0) + 1;
      artwork.updatedAt = new Date();
      this.artworks.set(artworkId, artwork);
    }
  }

  // Like operations
  async toggleLike(userId: string, artworkId: string): Promise<boolean> {
    const existingLike = Array.from(this.likes.values()).find(
      like => like.userId === userId && like.artworkId === artworkId
    );

    if (existingLike) {
      this.likes.delete(existingLike.id);
      await this.updateArtworkLikeCount(artworkId);
      return false;
    } else {
      const like: Like = {
        id: randomUUID(),
        userId,
        artworkId,
        createdAt: new Date(),
      };
      this.likes.set(like.id, like);
      await this.updateArtworkLikeCount(artworkId);
      return true;
    }
  }

  async isArtworkLiked(userId: string, artworkId: string): Promise<boolean> {
    return Array.from(this.likes.values()).some(
      like => like.userId === userId && like.artworkId === artworkId
    );
  }

  async updateArtworkLikeCount(artworkId: string): Promise<void> {
    const likeCount = Array.from(this.likes.values()).filter(like => like.artworkId === artworkId).length;
    const artwork = this.artworks.get(artworkId);
    if (artwork) {
      artwork.likeCount = likeCount;
      artwork.updatedAt = new Date();
      this.artworks.set(artworkId, artwork);
    }
  }

  // Comment operations
  async createComment(commentData: InsertComment): Promise<Comment> {
    const comment: Comment = {
      ...commentData,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.comments.set(comment.id, comment);
    return comment;
  }

  async getCommentsByArtwork(artworkId: string): Promise<CommentWithUser[]> {
    const artworkComments = Array.from(this.comments.values())
      .filter(comment => comment.artworkId === artworkId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    const result: CommentWithUser[] = [];
    for (const comment of artworkComments) {
      const user = this.users.get(comment.userId);
      if (user) {
        result.push({
          ...comment,
          user,
        });
      }
    }
    
    return result;
  }

  // Follow operations
  async toggleFollow(followerId: string, followeeId: string): Promise<boolean> {
    const existingFollow = Array.from(this.follows.values()).find(
      follow => follow.followerId === followerId && follow.followeeId === followeeId
    );

    if (existingFollow) {
      this.follows.delete(existingFollow.id);
      await this.updateFollowCounts(followerId);
      await this.updateFollowCounts(followeeId);
      return false;
    } else {
      const follow: Follow = {
        id: randomUUID(),
        followerId,
        followeeId,
        createdAt: new Date(),
      };
      this.follows.set(follow.id, follow);
      await this.updateFollowCounts(followerId);
      await this.updateFollowCounts(followeeId);
      return true;
    }
  }

  async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
    return Array.from(this.follows.values()).some(
      follow => follow.followerId === followerId && follow.followeeId === followeeId
    );
  }

  async updateFollowCounts(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;

    const followingCount = Array.from(this.follows.values()).filter(f => f.followerId === userId).length;
    const followerCount = Array.from(this.follows.values()).filter(f => f.followeeId === userId).length;

    user.followingCount = followingCount;
    user.followerCount = followerCount;
    user.updatedAt = new Date();
    this.users.set(userId, user);
  }

  // Purchase operations
  async createPurchase(purchaseData: InsertPurchase): Promise<Purchase> {
    const purchase: Purchase = {
      ...purchaseData,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.purchases.set(purchase.id, purchase);
    return purchase;
  }

  async getPurchasesByUser(userId: string): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).filter(p => p.buyerId === userId);
  }
}

export const storage = new MemStorage();
