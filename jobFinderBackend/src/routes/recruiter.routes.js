const express = require("express")
const authMiddleware = require("../middleware/auth.middlware")
const roleMiddleware = require("../middleware/role.middleware")
const recruiterController = require("../controller/recruiter.contoller")
const upload = require("../middleware/upload.middleware");

const router = express.Router()


// post 

router.post("/profile",authMiddleware.authMiddleware,roleMiddleware.roleMiddleware("recruiter"),recruiterController.createRecruiterProfileController)

//get

router.get("/profile",authMiddleware.authMiddleware,roleMiddleware.roleMiddleware("recruiter"),recruiterController.getRecruiterProfileController)

// post

router.put("/profile",authMiddleware.authMiddleware,roleMiddleware.roleMiddleware("recruiter"),recruiterController.updateRecruiterProfileController)

router.get("/dashboard",authMiddleware.authMiddleware,roleMiddleware.roleMiddleware("recruiter"),recruiterController.getRecruiterDashboardController)

router.post(
    "/upload-company-logo",
    authMiddleware.authMiddleware,
    roleMiddleware.roleMiddleware("recruiter"),
    upload.uploadProfile.single("companyLogo"),
    recruiterController.uploadCompanyLogoController
);


module.exports=router;


