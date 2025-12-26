import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    // user - validate
    // user cooment from body
    // now send this comment to database

    const {content} = req.body

    if(!content){
        throw new ApiError(400, "Field is Required")
    }

    // const user = await User.findById(req.user?._id)

    // if(!user){
    //     throw new ApiError(400, "Invalid User")
    // }

    // console.log(content)

    await Comment.create({
        content
    })

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment Send Successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const {content} = req.body

    if (!content){
            throw new ApiError(400, "Field is Required")
        }

    const comment  = await Comment.findById(req.user?._id)

    if(!comment){
        throw new ApiError(400, "Comment not found")
    }



    


    

    // user.content = changeComment



    // await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment Updated Succesfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
