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
    if(!userId){
        throw new ApiError(400, "User id is required")
    }

    const playlists = await Playlist.find().populate('videos')
    
    // console.log(playlists)

    return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlist Fetched Successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    const validatePlaylistId = mongoose.isValidObjectId(playlistId)

    if(!validatePlaylistId){
        throw new ApiError(400, "Playlist not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist Fetched Successfully "))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    const existingVideo = playlist.videos.id(videoId);

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

    const video = await Video.findById(videoId)
    const playlist = await Playlist.findById(playlistId)

    if(!video){
        throw new ApiError(404, "Page not Found")
    }

    if (!playlist) {
        throw new ApiError(404, "Page not Found")
    }

    const removedVideoFromPlaylist = await Playlist.updateOne(
        {_id: new mongoose.Types.ObjectId(playlistId)},
        {
            $pull:{
                videos: {
                    _id: new mongoose.Types.ObjectId(videoId)
                }
            }
        }
    )
    
    return res
    .status(200)
    .json(200, removedVideoFromPlaylist, "Video Removed Succesfully" )
})



const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!playlistId){
        throw new ApiError(400, "Playlist id required")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    const deletedplaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletePlaylist){
        throw new ApiError(400, "technical error, playlist can't be deleted")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist Deleted"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if (!playlistId){
        throw new ApiError(400, "playlist Id is required")
    }

    if (!name) {
        throw new ApiError(400, "name is required")
    }

    if (!description) {
        throw new ApiError(400, "description is required")
    }
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name: name,
            description: description
        },
        {new: true}
    )
    
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist updated succesfully"))
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
