import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    
    if(!name | !description){
        throw new ApiError(400, "All Fields are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
    })


    const id = playlist._id

    return res
    .status(200)
    .json(new ApiResponse(200, { playlist, id }, "Playlist Created Succesfully"))

})

const getVideoPlaylist = asyncHandler(async (req, res) =>{
    const { playlistId } = req.params

    if(!playlistId){
        throw new ApiError(400, "Id is required")
    }

    const validPlaylistId = mongoose.isValidObjectId(playlistId) 

    if (!validPlaylistId){
        throw new ApiError(400, "Playlist id is not matched")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as:"videos"
            }
        },
        {
            $project:{
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

    if(!playlist.length){
        throw new ApiError(400, "Playlist not Found")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        playlist[0],
        "Playlist fetched successfully"
    ))

    console.log(playlist)
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

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
    getVideoPlaylist    
}
