import mongoose, {isValidObjectId, mongo} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    
    if(!name | !description){
        throw new ApiError(400, "All Fields are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        // videos: getPlaylistById
    })


    const id = playlist._id

    return res
    .status(200)
    .json(new ApiResponse(200, { playlist, id }, "Playlist Created Succesfully"))

})


const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    const validatePlaylistId = mongoose.isValidObjectId(playlistId)

    if(!validatePlaylistId){
        throw new ApiError(400, "Playlist not found")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                videos: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    thumbnail: 1,
                    videoFile: 1,
                    duration: 1,
                    views: 1,
                    isPublished: 1,
                    createdAt: 1
                }

            }
        }
    ])

    if (!playlist.length) {
        throw new ApiError(400, "Playlist not Found")
    }

    // Playlist.playlistId,
    // console.log(playlist)

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist Fetched Successfully X"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    const existingVideo = playlist.videoDetails.id(videoId);

    if (existingVideo) {
        throw new ApiError(400, "Video already exists in playlist");
    }

    await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $addFields: {
                tempVideoIds: {
                    $concatArrays: [
                        "$videos._id", 
                        [new mongoose.Types.ObjectId(videoId)]
                    ]
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "tempVideoIds",
                foreignField: "_id",
                as: "allVideos"
            }
        },
        {
            $addFields: {
                videos: {
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
        },
        {
            $project: {
                tempVideoIds: 0,
                allVideos: 0
            }
        },
        {
            $merge: {
                into: "playlists",
                on: "_id",
                whenMatched: "replace",
                whenNotMatched: "discard"
            }
        }
    ]);

    const updatedPlaylist = await Playlist.findById(playlistId);

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!playlistId){
        throw new ApiError(400, "Playlist id is required")
    }

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    await Playlist.updateMany(
        { _id: new mongoose.Types.ObjectId(playlistId) },
        {
            $pull: {
                videos: new mongoose.Types.ObjectId(videoId),
                videoDetails: new mongoose.Types.ObjectId(videoId)

            }
        }
    );
    return res
    .status(200)
    .json(200, {}, "Video Removed Succesfully" )
})



const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
}
