import os
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

# MongoDB connection
MONGO_DETAILS = os.getenv("MONGO_DETAILS")
if not MONGO_DETAILS or not MONGO_DETAILS.startswith(("mongodb://", "mongodb+srv://")):
    MONGO_DETAILS = "mongodb://localhost:27017"
    print(f"Using default MongoDB connection: {MONGO_DETAILS}")
else:
    print("Using provided MongoDB connection string")

client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.refugiart_bazar

app = FastAPI(
    title="Refugiart Bazar API",
    description="A social marketplace platform for independent artists",
    version="1.0.0"
)
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class User(BaseModel):
    id: str
    email: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    profileImageUrl: Optional[str] = None
    rbBalance: float = 1250.00
    bio: Optional[str] = None
    specialization: Optional[str] = None
    isArtist: int = 0  # 0 = buyer, 1 = artist
    isAdmin: int = 0   # 0 = regular user, 1 = admin
    followerCount: int = 0
    followingCount: int = 0
    createdAt: datetime
    updatedAt: datetime

class UserCreate(BaseModel):
    email: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    profileImageUrl: Optional[str] = None
    bio: Optional[str] = None
    specialization: Optional[str] = None
    isArtist: int = 0

class Artwork(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    imageUrl: str
    price: float
    category: str
    artistId: str
    likeCount: int = 0
    viewCount: int = 0
    isAvailable: int = 1  # 0 = sold, 1 = available
    createdAt: datetime
    updatedAt: datetime

class ArtworkCreate(BaseModel):
    title: str
    description: Optional[str] = None
    imageUrl: str
    price: float
    category: str

class Comment(BaseModel):
    id: str
    content: str
    userId: str
    artworkId: str
    createdAt: datetime

class CommentCreate(BaseModel):
    content: str

class Like(BaseModel):
    id: str
    userId: str
    artworkId: str
    createdAt: datetime

class Follow(BaseModel):
    id: str
    followerId: str
    followeeId: str
    createdAt: datetime

class Purchase(BaseModel):
    id: str
    buyerId: str
    artworkId: str
    price: float
    createdAt: datetime

# Health check endpoints
@app.get("/")
async def root():
    return {"message": "API Refugiart Bazar está no ar 🎨"}

@app.get("/ping-db")
async def ping_db():
    try:
        await database.command("ping")
        return {"message": "Conectado ao MongoDB com sucesso ✅"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# User endpoints
@app.post("/api/users", response_model=User)
async def create_user(user_data: UserCreate):
    user_dict = user_data.dict()
    user_dict["id"] = str(uuid.uuid4())
    user_dict["createdAt"] = datetime.now()
    user_dict["updatedAt"] = datetime.now()
    user_dict["rbBalance"] = 1250.00
    user_dict["followerCount"] = 0
    user_dict["followingCount"] = 0
    user_dict["isAdmin"] = 0
    
    result = await database.users.insert_one(user_dict)
    if result.inserted_id:
        created_user = await database.users.find_one({"id": user_dict["id"]})
        if created_user:
            created_user.pop("_id", None)
            return User(**created_user)
    raise HTTPException(status_code=400, detail="Failed to create user")

@app.get("/api/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await database.users.find_one({"id": user_id})
    if user:
        user.pop("_id", None)
        return User(**user)
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/api/users/artists", response_model=List[User])
async def get_artists():
    cursor = database.users.find({"isArtist": 1})
    artists = []
    async for artist in cursor:
        artist.pop("_id", None)
        artists.append(User(**artist))
    return artists

@app.patch("/api/users/{user_id}")
async def update_user(user_id: str, user_data: UserCreate):
    update_data = user_data.dict(exclude_unset=True)
    update_data["updatedAt"] = datetime.now()
    
    result = await database.users.update_one(
        {"id": user_id}, 
        {"$set": update_data}
    )
    
    if result.modified_count:
        updated_user = await database.users.find_one({"id": user_id})
        if updated_user:
            updated_user.pop("_id", None)
            return User(**updated_user)
    raise HTTPException(status_code=404, detail="User not found")

# Artwork endpoints
@app.get("/api/artworks", response_model=List[dict])
async def get_artworks(category: Optional[str] = None, limit: int = 20, offset: int = 0):
    query = {}
    if category and category != "all":
        query["category"] = category
    
    cursor = database.artworks.find(query).sort("createdAt", -1).skip(offset).limit(limit)
    artworks = []
    
    async for artwork in cursor:
        artwork.pop("_id", None)
        # Get artist info
        artist = await database.users.find_one({"id": artwork["artistId"]})
        if artist:
            artist.pop("_id", None)
            artwork["artist"] = artist
        artworks.append(artwork)
    
    return artworks

@app.get("/api/artworks/{artwork_id}")
async def get_artwork(artwork_id: str):
    artwork = await database.artworks.find_one({"id": artwork_id})
    if not artwork:
        raise HTTPException(status_code=404, detail="Artwork not found")
    
    artwork.pop("_id", None)
    
    # Get artist info
    artist = await database.users.find_one({"id": artwork["artistId"]})
    if artist:
        artist.pop("_id", None)
        artwork["artist"] = artist
    
    # Increment view count
    await database.artworks.update_one(
        {"id": artwork_id}, 
        {"$inc": {"viewCount": 1}}
    )
    
    return artwork

@app.post("/api/artworks", response_model=Artwork)
async def create_artwork(artwork_data: ArtworkCreate, artist_id: str = "mock-user-id"):
    artwork_dict = artwork_data.dict()
    artwork_dict["id"] = str(uuid.uuid4())
    artwork_dict["artistId"] = artist_id
    artwork_dict["createdAt"] = datetime.now()
    artwork_dict["updatedAt"] = datetime.now()
    artwork_dict["likeCount"] = 0
    artwork_dict["viewCount"] = 0
    artwork_dict["isAvailable"] = 1
    
    result = await database.artworks.insert_one(artwork_dict)
    if result.inserted_id:
        created_artwork = await database.artworks.find_one({"id": artwork_dict["id"]})
        if created_artwork:
            created_artwork.pop("_id", None)
            return Artwork(**created_artwork)
    raise HTTPException(status_code=400, detail="Failed to create artwork")

@app.get("/api/artists/{artist_id}/artworks", response_model=List[Artwork])
async def get_artworks_by_artist(artist_id: str):
    cursor = database.artworks.find({"artistId": artist_id})
    artworks = []
    async for artwork in cursor:
        artwork.pop("_id", None)
        artworks.append(Artwork(**artwork))
    return artworks

# Like endpoints
@app.post("/api/artworks/{artwork_id}/like")
async def toggle_like(artwork_id: str, user_id: str = "mock-user-id"):
    # Check if like exists
    existing_like = await database.likes.find_one({"userId": user_id, "artworkId": artwork_id})
    
    if existing_like:
        # Remove like
        await database.likes.delete_one({"id": existing_like["id"]})
        await database.artworks.update_one(
            {"id": artwork_id}, 
            {"$inc": {"likeCount": -1}}
        )
        return {"isLiked": False}
    else:
        # Add like
        like_dict = {
            "id": str(uuid.uuid4()),
            "userId": user_id,
            "artworkId": artwork_id,
            "createdAt": datetime.now()
        }
        await database.likes.insert_one(like_dict)
        await database.artworks.update_one(
            {"id": artwork_id}, 
            {"$inc": {"likeCount": 1}}
        )
        return {"isLiked": True}

# Comment endpoints
@app.get("/api/artworks/{artwork_id}/comments")
async def get_comments(artwork_id: str):
    cursor = database.comments.find({"artworkId": artwork_id}).sort("createdAt", -1)
    comments = []
    
    async for comment in cursor:
        comment.pop("_id", None)
        # Get user info
        user = await database.users.find_one({"id": comment["userId"]})
        if user:
            user.pop("_id", None)
            comment["user"] = user
        comments.append(comment)
    
    return comments

@app.post("/api/artworks/{artwork_id}/comments", response_model=Comment)
async def create_comment(artwork_id: str, comment_data: CommentCreate, user_id: str = "mock-user-id"):
    comment_dict = comment_data.dict()
    comment_dict["id"] = str(uuid.uuid4())
    comment_dict["userId"] = user_id
    comment_dict["artworkId"] = artwork_id
    comment_dict["createdAt"] = datetime.now()
    
    result = await database.comments.insert_one(comment_dict)
    if result.inserted_id:
        created_comment = await database.comments.find_one({"id": comment_dict["id"]})
        if created_comment:
            created_comment.pop("_id", None)
            return Comment(**created_comment)
    raise HTTPException(status_code=400, detail="Failed to create comment")

# Follow endpoints
@app.post("/api/users/{user_id}/follow")
async def toggle_follow(user_id: str, follower_id: str = "mock-user-id"):
    if follower_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    # Check if follow exists
    existing_follow = await database.follows.find_one({"followerId": follower_id, "followeeId": user_id})
    
    if existing_follow:
        # Unfollow
        await database.follows.delete_one({"id": existing_follow["id"]})
        await database.users.update_one(
            {"id": user_id}, 
            {"$inc": {"followerCount": -1}}
        )
        await database.users.update_one(
            {"id": follower_id}, 
            {"$inc": {"followingCount": -1}}
        )
        return {"isFollowing": False}
    else:
        # Follow
        follow_dict = {
            "id": str(uuid.uuid4()),
            "followerId": follower_id,
            "followeeId": user_id,
            "createdAt": datetime.now()
        }
        await database.follows.insert_one(follow_dict)
        await database.users.update_one(
            {"id": user_id}, 
            {"$inc": {"followerCount": 1}}
        )
        await database.users.update_one(
            {"id": follower_id}, 
            {"$inc": {"followingCount": 1}}
        )
        return {"isFollowing": True}

# Purchase endpoints
@app.post("/api/artworks/{artwork_id}/purchase", response_model=Purchase)
async def purchase_artwork(artwork_id: str, buyer_id: str = "mock-user-id"):
    # Get artwork
    artwork = await database.artworks.find_one({"id": artwork_id})
    if not artwork:
        raise HTTPException(status_code=404, detail="Artwork not found")
    
    if artwork["isAvailable"] == 0:
        raise HTTPException(status_code=400, detail="Artwork is no longer available")
    
    if artwork["artistId"] == buyer_id:
        raise HTTPException(status_code=400, detail="Cannot purchase your own artwork")
    
    # Get buyer
    buyer = await database.users.find_one({"id": buyer_id})
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    
    if buyer["rbBalance"] < artwork["price"]:
        raise HTTPException(status_code=400, detail="Insufficient RB balance")
    
    # Create purchase
    purchase_dict = {
        "id": str(uuid.uuid4()),
        "buyerId": buyer_id,
        "artworkId": artwork_id,
        "price": artwork["price"],
        "createdAt": datetime.now()
    }
    
    result = await database.purchases.insert_one(purchase_dict)
    if result.inserted_id:
        # Update artwork availability
        await database.artworks.update_one(
            {"id": artwork_id}, 
            {"$set": {"isAvailable": 0}}
        )
        
        # Update buyer balance
        new_buyer_balance = buyer["rbBalance"] - artwork["price"]
        await database.users.update_one(
            {"id": buyer_id}, 
            {"$set": {"rbBalance": new_buyer_balance}}
        )
        
        # Update artist balance
        artist = await database.users.find_one({"id": artwork["artistId"]})
        if artist:
            new_artist_balance = artist["rbBalance"] + artwork["price"]
            await database.users.update_one(
                {"id": artwork["artistId"]}, 
                {"$set": {"rbBalance": new_artist_balance}}
            )
        
        created_purchase = await database.purchases.find_one({"id": purchase_dict["id"]})
        if created_purchase:
            created_purchase.pop("_id", None)
            return Purchase(**created_purchase)
    
    raise HTTPException(status_code=400, detail="Failed to process purchase")

@app.get("/api/users/{user_id}/purchases", response_model=List[Purchase])
async def get_user_purchases(user_id: str):
    cursor = database.purchases.find({"buyerId": user_id})
    purchases = []
    async for purchase in cursor:
        purchase.pop("_id", None)
        purchases.append(Purchase(**purchase))
    return purchases

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)