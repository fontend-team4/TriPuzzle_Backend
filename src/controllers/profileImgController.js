import multer from "multer"
import AWS from "aws-sdk"

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const AWS_REGION = process.env.AWS_REGION
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
})

const storage = multer.memoryStorage()
const uploadProfileImg = multer({ storage })

const uploadProfileImgtoS3 = async(req, res) => {
  const dirName = 'profileImages'
  const { originalname, buffer, mimetype } = req.file
  
  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: `${dirName}/${originalname}`,
    Body: buffer,
    ACL: 'public-read',
    ContentType: mimetype,
  }
  
  try {
    const s3Response = await s3.upload(params).promise()
    const imageUrl = s3Response.Location

    res.status(200).json({ 
      message: 'Image uploaded successfully',
      url: imageUrl
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    res.status(500).json({ message: error.message })
  }
}

export { uploadProfileImg, uploadProfileImgtoS3 }