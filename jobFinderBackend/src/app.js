const express = require("express");
const authRoutes = require("../src/routes/auth.routes");
const candidateRoutes = require("../src/routes/candidate.routes");
const recruiterRoutes = require("../src/routes/recruiter.routes");
const jobRoutes = require("../src/routes/job.routes");
const applicationRoutes = require("../src/routes/application.routes");
const bookmarkRoutes = require("../src/routes/bookmark.routes");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/error.middleware")

const app = express();

app.use(express.json());
app.use(cookieParser());

// Auth Routes
app.use("/auth", authRoutes);

// Candidate Routes
app.use("/candidate", candidateRoutes);

// Recruiter Routes
app.use("/recruiter", recruiterRoutes);

// Job Routes
app.use("/jobs", jobRoutes);

// Application Routes
app.use("/applications", applicationRoutes);

// Bookmark Routes
app.use("/bookmarks", bookmarkRoutes);

//global error middleware

app.use(errorMiddleware);

module.exports = app;