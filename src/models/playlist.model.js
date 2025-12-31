import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    videos: [
        {
            _id: { type: Schema.Types.ObjectId },
            title: { type: String },
            description: { type: String },
            videoFile: { type: String },
            thumbnail: { type: String },
            duration: { type: Number },
            views: { type: Number },
            isPublished: { type: Boolean },
            createdAt: { type: Date }
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

export const Playlist = mongoose.model("Playlist", playlistSchema);