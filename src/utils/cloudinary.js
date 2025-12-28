import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(
            localFilePath, 
            {
            resource_type: "auto",
            folder: "backend_assets"

        })
        // file has been uploaded successfull
        // console.log("file is uploaded on cloudinary ", response.url);
        console.log(response)
        fs.unlinkSync(localFilePath)
        return response;
        
    } catch (error) {
        fs.unlinkSync("Fs UnlinkSync Error",localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteCloudinary = async (cloudinaryPublicId)=>{
    try {
        await cloudinary.uploader
        .destroy(cloudinaryPublicId)
    } catch (error) {
        console.log("Clodinary Delete Assets Error", error)
    }
}
export {
    uploadOnCloudinary,
    deleteCloudinary
}