const express = require("express")
const jobController = require("../controller/job.controller")
const authMiddleware = require("../middleware/auth.middlware")
const roleMiddleware = require("../middleware/role.middleware")

const router = express.Router()


// Get all jobs (public) — supports ?search, ?location, ?minSalary, ?maxSalary, ?sort, ?view, ?page, ?limit, ?postedBy
router.get("/", jobController.getAllJobsController)

// Get single job by ID (public)
router.get("/:jobId", jobController.getSingleJobController)

// Create a job (recruiter only)
router.post(
    "/",
    authMiddleware.authMiddleware,
    roleMiddleware.roleMiddleware("recruiter"),
    jobController.createJobController
)

// Update a job (recruiter only)
router.put(
    "/:jobId",
    authMiddleware.authMiddleware,
    roleMiddleware.roleMiddleware("recruiter"),
    jobController.updateJobController
)

// Delete a job (recruiter only)
router.delete(
    "/:jobId",
    authMiddleware.authMiddleware,
    roleMiddleware.roleMiddleware("recruiter"),
    jobController.deleteJobController
)


module.exports = router;