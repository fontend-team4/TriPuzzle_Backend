import express from 'express'
const router = express.Router()
import { uploadCoverImg, uploadCoverImgtoS3 } from "../controllers/coverImgController.js";
import { uploadProfileImg, uploadProfileImgtoS3 } from "../controllers/profileImgController.js";

router.post('/coverImg', uploadCoverImg.single('image'), uploadCoverImgtoS3)
router.post('/profileImg', uploadProfileImg.single('image'), uploadProfileImgtoS3)

export { router }