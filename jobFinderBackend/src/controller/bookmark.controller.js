const bookmarkModel = require("../model/bookmark.model")
const jobModel = require("../model/job.model")
const candidateModel = require("../model/candidate.model")
const asyncHandler = require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")


const bookmarkJobController = asyncHandler(async (req, res) => {

    const { jobId } = req.params;

    if (!jobId) {
        throw new ApiError(400, "please enter job Id");
    }

    const job = await jobModel.findById(jobId);

    if (!job) {
        throw new ApiError(404, "no job found with this jobId");
    }

    const candidate = await candidateModel.findOne({
        user: req.user._id
    });

    if (!candidate) {
        throw new ApiError(404, "no candidate found");
    }

    const isAlreadyBookmarked = await bookmarkModel.findOne({
        candidate: candidate._id,
        job: jobId
    });

    if (isAlreadyBookmarked) {
        throw new ApiError(400, "bookmark already present");
    }

    const bookmark = await bookmarkModel.create({
        candidate: candidate._id,
        job: jobId
    });

    return res.status(201).json({
        message: "bookmarked successfully",
        bookmark
    });

});

const getAllBookmarkController = asyncHandler(async (req, res) => {

    const candidate = await candidateModel.findOne({
        user: req.user._id
    });

    if (!candidate) {
        throw new ApiError(404, "no candidate profile found");
    }

    const bookmarks = await bookmarkModel.find({
        candidate: candidate._id
    }).populate({
        path: "job",
        populate: {
            path: "postedBy",
            select: "companyName"
        }
    });

    if (bookmarks.length === 0) {
        throw new ApiError(404, "no bookmarks found");
    }

    return res.status(200).json({
        message: "all bookmarks fetched successfully",
        bookmarks
    });

});

const deleteBookmarkController = asyncHandler(async (req, res) => {

    const { jobId } = req.params;

    if (!jobId) {
        throw new ApiError(400, "please provide jobId to remove/delete bookmark");
    }

    const candidate = await candidateModel.findOne({
        user: req.user._id
    });

    if (!candidate) {
        throw new ApiError(404, "no candidate profile found");
    }

    const deleteBookmark = await bookmarkModel.findOneAndDelete({
        candidate: candidate._id,
        job: jobId
    });

    if (!deleteBookmark) {
        throw new ApiError(404, "no bookmark present/already removed");
    }

    return res.status(200).json({
        message: "bookmark deleted successfully"
    });

});

module.exports = {bookmarkJobController,getAllBookmarkController,deleteBookmarkController}