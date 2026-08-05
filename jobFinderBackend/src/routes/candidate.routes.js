const express = require("express")
const authMiddleware = require("../middleware/auth.middlware")
const roleMiddleware = require("../middleware/role.middleware")
const candidateController = require("../controller/candidate.controller");
const upload = require("../middleware/upload.middleware");

const router = express.Router()

// post candidate profile

router.post("/create-profile",authMiddleware.authMiddleware,roleMiddleware.roleMiddleware("candidate"),candidateController.createCandidateProfileController)


//get candidate profile


router.get("/profile",authMiddleware.authMiddleware,roleMiddleware.roleMiddleware("candidate"),candidateController.getCandidateProfileController)

// update candidate profile

router.put("/profile",authMiddleware.authMiddleware,roleMiddleware.roleMiddleware("candidate"),candidateController.updateCandidateProfileController)

// candidate dashboard

router.get("/dashboard",authMiddleware.authMiddleware,roleMiddleware.roleMiddleware("candidate"),candidateController.getCandidateDashboardController)


//post

router.post("/upload-resume",authMiddleware.authMiddleware,roleMiddleware.roleMiddleware("candidate"),upload.uploadResume.single("resume"),candidateController.uploadResumeController)

// post 

router.post("/upload-profile",authMiddleware.authMiddleware,roleMiddleware.roleMiddleware("candidate"),upload.uploadProfile.single("profile"),candidateController.uploadProfilePhotoController)



module.exports=router;