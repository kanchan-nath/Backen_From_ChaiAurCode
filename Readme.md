# Building a Production-Ready YouTube Clone Backend

A complete guide to building a full-featured video streaming platform backend with Node.js, Express, MongoDB, and Cloudinary.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack Deep Dive](#tech-stack-deep-dive)
3. [Project Architecture](#project-architecture)
4. [Models Documentation](#models-documentation)
5. [Controllers Documentation](#controllers-documentation)
6. [Routes API Reference](#routes-api-reference)
7. [MongoDB Array Operations & Aggregation](#mongodb-array-operations--aggregation)
8. [Setup Instructions](#setup-instructions)
9. [Key Learnings](#key-learnings)
10. [Best Practices & Troubleshooting](#best-practices--troubleshooting)

---

## Project Overview

This is a complete backend system for a video-sharing platform (YouTube clone) that handles:
- User authentication and authorization
- Video upload and management
- User subscriptions
- Comments and likes
- Video streaming
- Channel management
- Playlists
- Community tweets

---

## Tech Stack Deep Dive

### Core Framework & Runtime

**Express.js** (`^4.18.2`)
- The backbone of our application
- Handles HTTP requests, routing, and middleware
- Lightweight and flexible for building RESTful APIs

### Database & ODM

**Mongoose** (`^8.0.0`)
- MongoDB object modeling tool
- Provides schema validation, middleware hooks, and query building
- Essential for defining models like User, Video, Comment, Subscription

**mongoose-aggregate-paginate-v2** (`^1.0.6`)
- Adds pagination to MongoDB aggregation queries
- Perfect for paginating video feeds, comments, and search results
- Syntax: `Model.aggregatePaginate(aggregateQuery, options)`

### Authentication & Security

**bcrypt** (`^5.1.1`)
- Hashes passwords before storing in database
- Protects user credentials even if database is compromised
- Usage: `bcrypt.hash()` for registration, `bcrypt.compare()` for login

**jsonwebtoken** (`^9.0.2`)
- Creates and verifies JWT tokens
- Implements stateless authentication
- Generates access tokens (short-lived) and refresh tokens (long-lived)

**cookie-parser** (`^1.4.6`)
- Parses cookies from incoming requests
- Essential for storing JWT tokens in HTTP-only cookies
- More secure than localStorage for token storage

### File Handling

**Multer** (`^1.4.5-lts.1`)
- Middleware for handling multipart/form-data
- Handles video and thumbnail uploads from frontend
- Stores files temporarily on server before cloud upload

**Cloudinary** (`^2.8.0`)
- Cloud storage for videos, thumbnails, and avatars
- Provides CDN for fast media delivery
- Handles video transcoding and optimization automatically

### Configuration & CORS

**dotenv** (`^16.3.1`)
- Loads environment variables from .env file
- Keeps sensitive data (API keys, DB URLs) out of code
- Essential for different environments (dev, production)

**cors** (`^2.8.5`)
- Enables Cross-Origin Resource Sharing
- Allows frontend (different domain) to access backend APIs
- Configurable for specific origins and credentials

### Development Tools

**nodemon** (`^3.0.1`)
- Auto-restarts server on file changes
- Saves time during development
- Script: `nodemon -r dotenv/config src/index.js`

**prettier** (`^3.0.3`)
- Code formatter for consistent styling
- Enforces code quality standards
- Integrates with most code editors

---

## Project Architecture

### Folder Structure

```
src/
├── controllers/    # Request handlers
├── models/         # Mongoose schemas
├── routes/         # API endpoints
├── middlewares/    # Auth, file upload, error handling
├── utils/          # Helper functions (ApiError, ApiResponse, asyncHandler)
├── db/             # Database connection
└── index.js        # Entry point
```

### Database Connection (db/index.js)

```javascript
// Connects to MongoDB using Mongoose
// Uses environment variable MONGODB_URI + DB_NAME constant
// Logs connection success with host info
// Exits process on connection failure
```

### Middleware Layer

**multer.middleware.js**
- Configures Multer for file uploads
- Saves files to `./public/temp` directory
- Preserves original filename
- Used for handling video/image uploads before Cloudinary

**auth.middleware.js (verifyJWT)**
- Authentication middleware
- Extracts JWT from cookies or Authorization header
- Verifies token and attaches user to `req.user`
- Excludes password and refreshToken from user object
- Throws 401 errors for invalid/missing tokens

### Utils Layer

**ApiResponse.js**
- Standardized success response class
- Fields: `statusCode`, `data`, `message`, `success`
- `success` auto-set to true if statusCode < 400
- Ensures consistent API response format

**ApiError.js**
- Custom error class extending Error
- Fields: `statusCode`, `data` (null), `message`, `success` (false), `errors` array
- Captures stack trace for debugging
- Provides structured error handling

**asyncHandler.js**
- Higher-order function wrapper for async route handlers
- Catches promise rejections and passes to Express error handler
- Eliminates need for try-catch in every controller

**cloudinary.js**
- **uploadOnCloudinary**: Uploads files to Cloudinary (auto-detects resource type)
- Stores in "backend_assets" folder
- Deletes local temp file after upload (using `fs.unlinkSync`)
- Returns full Cloudinary response (url, public_id, duration, etc.)
- **deleteCloudinary**: Deletes asset from Cloudinary by public_id

---

## Models Documentation

### 1. User Model (user.model.js)

Core user model with authentication capabilities.

**Fields:**
- `username` - Unique, lowercase, indexed
- `email` - Unique, lowercase
- `fullName` - Required, indexed
- `avatar` - Cloudinary URL (required)
- `coverImage` - Cloudinary URL
- `watchHistory` - Array of Video references
- `password` - Hashed using bcrypt
- `refreshToken` - For token refresh mechanism

**Methods:**
- `isPasswordCorrect(password)` - Verifies password using bcrypt
- `generateAccessToken()` - Creates short-lived JWT
- `generateRefreshToken()` - Creates long-lived JWT

**Middleware:**
- Pre-save hook to hash password if modified

### 2. Video Model (video.model.js)

Stores video content and metadata.

**Fields:**
- `videoFile` - Cloudinary URL (required)
- `thumbnail` - Cloudinary URL (required)
- `title` - Required
- `description` - Required
- `duration` - Number (required)
- `views` - Default: 0
- `isPublished` - Default: true
- `owner` - User reference (required)

**Plugins:**
- mongoose-aggregate-paginate-v2 for pagination

### 3. Subscription Model (subscription.model.js)

Manages channel subscriptions (many-to-many relationship).

**Fields:**
- `subscriber` - User reference (who is subscribing)
- `channel` - User reference (channel being subscribed to)

### 4. Comment Model (comment.model.js)

Stores comments on videos.

**Fields:**
- `content` - Required
- `video` - Video reference
- `owner` - User reference

**Plugins:**
- mongoose-aggregate-paginate-v2 for pagination

### 5. Like Model (like.model.js)

Flexible like system for videos, comments, and tweets.

**Fields:**
- `video` - Video reference (optional)
- `comment` - Comment reference (optional)
- `tweet` - Tweet reference (optional)
- `likedBy` - User reference (required)

### 6. Tweet Model (tweet.model.js)

Simple tweet/post model for community updates.

**Fields:**
- `content` - Required
- `owner` - User reference

### 7. Playlist Model (playlist.model.js)

Groups videos into playlists (denormalized approach).

**Fields:**
- `name` - Required
- `description` - Required
- `videos` - Array of Video references
- `owner` - User reference

---

## Controllers Documentation

### User Controller (user.controller.js) ⭐ *Most Complete*

**Implemented Features:**
- `registerUser` - Full registration with Cloudinary uploads for avatar and cover image
- `loginUser` - JWT-based authentication with cookies
- `logoutUser` - Clears refresh token and cookies
- `refreshAccessToken` - Token refresh mechanism
- `changeCurrentPassword` - Updates password with verification
- `getCurrentUser` - Returns current user details
- `updateAccountDetails` - Updates username, email, fullName
- `updateUserAvatar` - Updates avatar image
- `updateUserCoverImage` - Updates cover image
- `getUserChannelProfile` - Complex aggregation with subscriber counts
- `getWatchHistory` - Nested aggregation with owner details

**Helper Function:**
- `generateAccessAndRefreshTokens(userId)` - Creates both tokens and saves refresh token to DB

### Video Controller (video.controller.js)

**Implemented:**
- `publishAVideo` - Uploads video + thumbnail to Cloudinary, creates video record
- `getOwnerDetailsFromVideo` - Uses aggregation to fetch video with owner details
- `getVideoById` - Retrieves single video by ID
- `updateVideo` - Updates title, description, thumbnail
- `deleteVideo` - Deletes from DB and Cloudinary

**TODO:**
- `getAllVideos` (with pagination/sorting)
- `togglePublishStatus`

### Playlist Controller (playlist.controller.js) ⭐ *Fully Implemented*

**Complete Features:**
- `createPlaylist` - Creates new playlist
- `getUserPlaylists` - Gets all playlists for a user
- `getPlaylistById` - Retrieves playlist details
- `addVideoToPlaylist` - Complex aggregation pipeline to denormalize video data
- `removeVideoFromPlaylist` - Uses `$pull` to remove video
- `deletePlaylist` - Removes playlist
- `updatePlaylist` - Updates name and description

### Tweet Controller (tweet.controller.js)

**Implemented:**
- `createTweet` - Creates new tweet
- `updateTweet` - Updates tweet content
- `deleteTweet` - Deletes tweet

**TODO:**
- `getUserTweets`

### Comment Controller (comment.controller.js)

**Partially Implemented:**
- `addComment` - (Incomplete - missing video/owner references)

**TODO/Incomplete:**
- `getVideoComments`
- `updateComment`
- `deleteComment`

### Subscription Controller (subscription.controller.js)

**All TODO:**
- `toggleSubscription`
- `getUserChannelSubscribers`
- `getSubscribedChannels`

### Like Controller (like.controller.js)

**All TODO:**
- `toggleVideoLike`
- `toggleCommentLike`
- `toggleTweetLike`
- `getLikedVideos`

### Dashboard Controller (dashboard.controller.js)

**All TODO:**
- `getChannelStats`
- `getChannelVideos`

### Health Check Controller (healthcheck.controller.js)

**TODO:**
- Basic health check endpoint

---

## Routes API Reference

### User Routes (`/api/v1/users`)

```
POST   /register                    - Register new user (with file uploads)
POST   /login                       - User login
POST   /logout                      - Logout user (Protected)
POST   /refresh-token               - Refresh access token (Protected)
POST   /change-password             - Change password (Protected)
GET    /current-user                - Get current user info (Protected)
PATCH  /update-account              - Update account details (Protected)
PATCH  /avatar                      - Update avatar (Protected, with file upload)
PATCH  /cover-image                 - Update cover image (Protected, with file upload)
GET    /c/:username                 - Get user channel profile (Protected)
GET    /history                     - Get watch history (Protected)
```

### Video Routes (`/api/v1/videos`)

```
GET    /                            - Get all videos (Protected)
POST   /                            - Publish a video (Protected, with file uploads)
GET    /:videoId                    - Get video by ID (Protected)
DELETE /:videoId                    - Delete a video (Protected)
PATCH  /:videoId                    - Update video (Protected, with file upload)
PATCH  /toggle/publish/:videoId     - Toggle video publish status (Protected)
GET    /user/:videoId               - Get video owner details (Protected)
```

### Playlist Routes (`/api/v1/playlists`)

```
POST   /                            - Create a playlist (Protected)
GET    /:playlistId                 - Get playlist by ID (Protected)
PATCH  /:playlistId                 - Update playlist (Protected)
DELETE /:playlistId                 - Delete playlist (Protected)
PATCH  /add/:videoId/:playlistId    - Add video to playlist (Protected)
PATCH  /remove/:videoId/:playlistId - Remove video from playlist (Protected)
GET    /user/:userId                - Get user's playlists (Protected)
```

### Comment Routes (`/api/v1/comments`)

```
GET    /:videoId                    - Get all comments for a video (Protected)
POST   /:videoId                    - Add a comment to a video (Protected)
DELETE /c/:commentId                - Delete a specific comment (Protected)
PATCH  /c/:commentId                - Update a specific comment (Protected)
```

### Tweet Routes (`/api/v1/tweets`)

```
POST   /                            - Create a new tweet (Protected)
GET    /user/:userId                - Get all tweets by a user (Protected)
PATCH  /:tweetId                    - Update a tweet (Protected)
DELETE /:tweetId                    - Delete a tweet (Protected)
```

### Subscription Routes (`/api/v1/subscriptions`)

```
GET    /c/:channelId                - Get channels a user is subscribed to (Protected)
POST   /c/:channelId                - Toggle subscription to a channel (Protected)
GET    /u/:subscriberId             - Get subscribers of a channel (Protected)
```

### Like Routes (`/api/v1/likes`)

```
POST   /toggle/v/:videoId           - Toggle like on a video (Protected)
POST   /toggle/c/:commentId         - Toggle like on a comment (Protected)
POST   /toggle/t/:tweetId           - Toggle like on a tweet (Protected)
GET    /videos                      - Get all liked videos (Protected)
```

### Dashboard Routes (`/api/v1/dashboard`)

```
GET    /stats                       - Get channel statistics (Protected)
GET    /videos                      - Get channel videos (Protected)
```

### Health Check Routes (`/api/v1/healthcheck`)

```
GET    /                            - Simple health check endpoint
```

---

## MongoDB Array Operations & Aggregation

### Adding Items to Arrays

#### Using `$addToSet` - Preventing Duplicates

```javascript
await Playlist.updateOne(
    { _id: new mongoose.Types.ObjectId(playlistId) },
    {
        $addToSet: {
            videos: new mongoose.Types.ObjectId(videoId)
        }
    }
);
```

**What happens:**
- Adds the video ID to the array
- Skips addition if the ID already exists
- No duplicate checking needed in application code

#### Alternative: Using `$push`

```javascript
{ $push: { videos: videoId } }  // Allows duplicates
```

### Removing Items from Arrays

#### Using `$pull` - Remove by Value

```javascript
await Playlist.updateOne(
    { _id: new mongoose.Types.ObjectId(playlistId) },
    {
        $pull: {
            videos: new mongoose.Types.ObjectId(videoId)
        }
    }
);
```

**What happens:**
- Removes all occurrences of the specified value
- Works even with duplicates (removes all matches)

#### Using `$pullAll` - Remove Multiple Items

```javascript
await Playlist.updateOne(
    { _id: playlistId },
    {
        $pullAll: {
            videos: [
                new mongoose.Types.ObjectId(videoId1),
                new mongoose.Types.ObjectId(videoId2)
            ]
        }
    }
);
```

### Data Modeling: References vs Embedded Documents

#### References (Normalized) - Recommended

**Schema:**
```javascript
const playlistSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    videos: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });
```

**Benefits:**
- No data duplication
- Single source of truth
- Automatic synchronization when video data updates
- Smaller document size

**When to use:**
- Video data changes frequently
- Multiple playlists reference the same videos
- Need data consistency across collections

#### Embedded Documents (Denormalized)

**Benefits:**
- No additional queries needed
- Faster reads (no joins)
- Data immediately visible in Atlas

**Drawbacks:**
- Data duplication
- Must manually update all copies when source changes
- Larger document size

### Aggregation Pipeline Operations

#### Using `$merge` to Write Results

```javascript
{
    $merge: {
        into: "playlists",
        on: "_id",
        whenMatched: "merge",
        whenNotMatched: "discard"
    }
}
```

**Options:**
- `into: "playlists"` - Target collection for results
- `on: "_id"` - Match documents by this field
- `whenMatched: "merge"` - Combine new fields with existing document
- `whenNotMatched: "discard"` - Ignore documents that don't exist

#### Using `$addFields` with `$map`

```javascript
{
    $addFields: {
        videoDetails: {
            $map: {
                input: "$allVideos",
                as: "video",
                in: {
                    _id: "$$video._id",
                    title: "$$video.title",
                    description: "$$video.description",
                    videoFile: "$$video.videoFile",
                    thumbnail: "$$video.thumbnail",
                    duration: "$$video.duration",
                    views: "$$video.views",
                    isPublished: "$$video.isPublished",
                    createdAt: "$$video.createdAt"
                }
            }
        }
    }
}
```

**What this does:**
- Takes `allVideos` array (typically from `$lookup`)
- Creates new `videoDetails` field
- Transforms each video object to include only specified fields
- Filters out sensitive data (owner info, internal flags)

#### Array Operation Quick Reference

| Operation | Operator | Use Case | Allows Duplicates |
|-----------|----------|----------|-------------------|
| Add item | `$addToSet` | Add to playlist | No |
| Add item | `$push` | Add to history log | Yes |
| Remove item | `$pull` | Remove specific video | N/A |
| Remove multiple | `$pullAll` | Batch removal | N/A |
| Remove first/last | `$pop` | Stack/queue operations | N/A |

---

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Cloudinary account

### Installation Steps

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Create `.env` file:**
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_secret_key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Run development server:**
```bash
npm run dev
```

---

## Key Learnings

### 1. Middleware Patterns

Understanding the power of Express middleware for:
- Authentication verification
- File upload handling
- Error handling
- Request validation

### 2. MongoDB Aggregation

Complex queries for:
- Counting subscribers/views
- Fetching video with owner details
- Pagination in feeds

### 3. File Upload Flow

The journey: Frontend → Multer (temp storage) → Cloudinary (permanent) → Database (URL storage)

### 4. JWT Best Practices

- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7-30 days)
- HTTP-only cookies for security
- Token rotation on refresh

### 5. Error Handling

- Centralized error handling middleware
- Custom ApiError class
- Async wrapper to catch promise rejections

---

## Best Practices & Troubleshooting

### Clean Up Duplicate Fields

If you have both `videos` and `videoDetails` fields, remove the duplicate:

```javascript
// Remove videoDetails from all documents
await Playlist.updateMany(
    {},
    { $unset: { videoDetails: "" } }
);
```

### Common Errors

**Error:** `$pull` doesn't remove items

**Solution:** Ensure you're using the correct data type. String IDs won't match ObjectIds:
```javascript
// Wrong
{ $pull: { videos: videoId } }

// Correct
{ $pull: { videos: new mongoose.Types.ObjectId(videoId) } }
```

**Error:** Empty results when viewing in Atlas

**Solution:** You're using references. Use `.populate()` to see full data:
```javascript
await Playlist.findById(id).populate('videos');
```

### Performance Tips

- Use `updateOne()` instead of `findById()` + `save()` for simple updates
- Use aggregation pipelines for complex transformations
- Index fields used in `$match` and `on` (for `$merge`)
- Avoid embedding large documents that exceed 16MB limit

### Production Considerations

Before deploying:
1. Set up proper environment variables
2. Implement rate limiting
3. Add request validation (express-validator)
4. Set up logging (Winston or Morgan)
5. Configure CORS for specific origins
6. Enable HTTPS
7. Set up MongoDB indexes for performance
8. Implement caching (Redis) for frequently accessed data

---

## Challenges & Solutions

### Challenge 1: File Upload Management
**Problem:** Handling large video files efficiently  
**Solution:** Multer for temporary storage + Cloudinary for optimization and CDN delivery

### Challenge 2: Secure Authentication
**Problem:** Preventing token theft and session hijacking  
**Solution:** HTTP-only cookies + refresh token rotation + short access token expiry

### Challenge 3: Complex Data Relationships
**Problem:** Efficiently querying related data (videos with owner details, comments count)  
**Solution:** MongoDB aggregation pipelines with $lookup and $project

### Challenge 4: Pagination
**Problem:** Loading large datasets efficiently  
**Solution:** mongoose-aggregate-paginate-v2 for cursor-based pagination

---

## Conclusion

Building this YouTube clone backend taught me that backend development is more than just CRUD operations. It's about:
- **Security first:** Protecting user data and preventing vulnerabilities
- **Scalability:** Designing systems that can handle growth
- **User experience:** Fast responses and reliable media delivery
- **Code quality:** Writing maintainable, testable code

The packages in this project aren't just dependencies—they're carefully chosen tools that solve specific problems. Understanding **why** each package exists is as important as knowing **how** to use it.


