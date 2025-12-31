import mongoose, { isValidObjectId, mongo } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const {content} = req.body
    
    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const contentTweet = await Tweet.create(
        {
            content,
        }
    )
    
    return res
    .status(200)
    .json(new ApiResponse(200, contentTweet, "Tweet Send"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "Content is empty")  // Changed to ApiError
    }

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required")  
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(  
        tweetId,
        {
            content,
        },
        { new: true }
    )

    if (!updatedTweet) {
        throw new ApiError(404, "Tweet not found")  
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "tweet updated"))  

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId} = req.params

    if(!tweetId){
        throw new ApiError(400, "Tweet id is required")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(400, "Not found")
    }

    const deletdTweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deletdTweet){
        throw new ApiError(400, "tweet can no delete")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted succesfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
