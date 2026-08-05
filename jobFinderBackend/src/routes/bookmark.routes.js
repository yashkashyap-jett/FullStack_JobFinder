const express = require("express")
const authMiddleware = require("../middleware/auth.middlware")
const roleMiddleware = require("../middleware/role.middleware")
const {
    bookmarkJobController,
    getAllBookmarkController,
    deleteBookmarkController
} = require("../controller/bookmark.controller")

const router = express.Router()

// Bookmark a job
router.post("/:jobId", authMiddleware.authMiddleware, roleMiddleware.roleMiddleware("candidate"), bookmarkJobController)

// Get all bookmarks for logged-in candidate
router.get("/", authMiddleware.authMiddleware, roleMiddleware.roleMiddleware("candidate"), getAllBookmarkController)

// Remove a bookmark
router.delete("/:jobId", authMiddleware.authMiddleware, roleMiddleware.roleMiddleware("candidate"), deleteBookmarkController)

module.exports = router
