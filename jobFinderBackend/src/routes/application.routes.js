const express = require("express");
const authMiddleware = require("../middleware/auth.middlware")
const roleMiddleware = require("../middleware/role.middleware")

const {
    applyForJobController,
    getMyApplicationsController,
    getApplicantsForJobController,
    updateApplicationStatusController,
    withdrawApplicationController
} = require("../controller/application.controller");


const router = express.Router();

// Candidate Routes

// Apply for a job
router.post(
    "/apply/:jobId",
    authMiddleware.authMiddleware,
    roleMiddleware.roleMiddleware("candidate"),
    applyForJobController
);

// Get logged-in candidate's applications
router.get(
    "/my-applications",
    authMiddleware.authMiddleware,
    roleMiddleware.roleMiddleware("candidate"),
    getMyApplicationsController
);

// Withdraw an application
router.delete(
    "/withdraw/:applicationId",
    authMiddleware.authMiddleware,
    roleMiddleware.roleMiddleware("candidate"),
    withdrawApplicationController
);

// Recruiter Routes

// Get all applicants for a specific job
router.get(
    "/applicants/:jobId",
    authMiddleware.authMiddleware,
    roleMiddleware.roleMiddleware("recruiter"),
    getApplicantsForJobController
);

// Update application status
router.patch(
    "/status/:applicationId",
    authMiddleware.authMiddleware,
    roleMiddleware.roleMiddleware("recruiter"),
    updateApplicationStatusController
);

module.exports = router;
