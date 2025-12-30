import mongoose, {isValidObjectId, mongo} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    
    //user - validate
    // user upload video
    // video uplload on clodinary and update the database
    // same goes to thumbnail

    if(!title || !description){
        throw new ApiError(400, "All Fields are Required")
    }

    let videoFileLocalPath;
    if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0){
        videoFileLocalPath = req.files.videoFile[0].path
    }

    if (!videoFileLocalPath){
        throw new ApiError(400, "Video File is required ")
    }

    let thumbnailLocalPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailLocalPath = req.files.thumbnail[0].path
    }

    if(!thumbnailLocalPath){
        throw new ApiError(400, " Thumbanil is required ")
    }

    const video = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail  = await uploadOnCloudinary(thumbnailLocalPath)

    // console.log(video.public_id) 
    //duration: 10.01
    const duration = video.duration
    const videoPublicId = video.public_id
    const thumbnailPublicId = thumbnail.public_id

    if(!video){
        throw new ApiError(400, "Video file is required")
    }

    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail file is required")
    }

    const videoDetails = await Video.create({
        title,
        description, 
        videoFile: video.url,
        thumbnail: thumbnail.url,      
        duration,
        views: 56,
        isPublished: true,
    })

    return res
    .status(200)
    .json(new ApiResponse(200, { videoDetails, videoPublicId, thumbnailPublicId }, "Video Uploaded Successfully")) 
    // 694f99b0ba060cfbe56f45f6
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const isValid = mongoose.Types.ObjectId.isValid(videoId)

    if(!isValid){
        throw new ApiError(400, "VideoId is not Valid")
    }

    const video  = await Video.findById(videoId)

    return res
    .status(200)
    .json(new ApiResponse(400, video, "Video Found Success"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const isValid = mongoose.Types.ObjectId.isValid(videoId)

    if(!isValid){
        throw new ApiResponse(400, "Video Not Found")
    }

    const {title, description} = req.body
    let changeThumbnailLocalPath

    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length>0){
        changeThumbnailLocalPath = req.files.thumbnail[0].path
    }
    const changedThumbnail = await uploadOnCloudinary(changeThumbnailLocalPath)
    // console.log(changedThumbnail)

    const updatedVideoDetails = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                thumbnail: changedThumbnail.url,
            }
        },
        {new:true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200, updatedVideoDetails, "Video Details Changed Succesfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { videoPublicId, thumbnailPublicId } = req.body
    //TODO: delete video

    //Delete from Database
    
    const videoDelete = await Video.findByIdAndDelete(videoId)    

    if(!videoDelete){
        throw new ApiError(400, "Video Not Found")
    }

    //Delete from Cloudinary - Currently not working

    const videoPublicIdDeleted = await deleteCloudinary(videoPublicId)
    const thumbnailPublicIdDeleted = await deleteCloudinary(thumbnailPublicId)

    // console.log(cloudinaryAssetsDeleted)

    return res
    .status(200)
    .json(200, videoDelete, "Video Deleted")
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
