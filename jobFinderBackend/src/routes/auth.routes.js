const express = require("express")
const authController = require("../controller/auth.controller")
const authMiddleware = require("../middleware/auth.middlware")

const router = express.Router()


// register api 

router.post("/register",authController.registerController)

// login api

router.post("/login",authController.loginController)

// // logout

router.post("/logout",authController.logoutController)

// refresh-token

router.post("/refresh-token",authController.refreshAccessTokenController)

module.exports=router;