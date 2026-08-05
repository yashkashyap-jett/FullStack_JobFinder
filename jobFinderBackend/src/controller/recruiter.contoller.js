const recruiterModel = require("../model/recruiter.model")
const jobModel = require("../model/job.model");
const applicationModel = require("../model/application.model");
const imagekitUpload = require("../services/imageKit.services")
const asyncHandler = require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")


const createRecruiterProfileController = asyncHandler(async (req, res) => {

    const {
        companyName,
        companyDescription,
        companyWebsite,
        companyLocation
    } = req.body;

    if (!companyName || !companyDescription || !companyWebsite || !companyLocation) {
        throw new ApiError(
            400,
            "company name, description, website and location are mandatory"
        );
    }

    const isRecruiterProfileExists = await recruiterModel.findOne({
        user: req.user._id
    });

    if (isRecruiterProfileExists) {
        throw new ApiError(
            400,
            "recruiter profile already exists"
        );
    }

    const recruiterProfile = await recruiterModel.create({
        user: req.user._id,
        companyName,
        companyDescription,
        companyWebsite,
        companyLocation
    });

    return res.status(201).json({
        message: "recruiter profile created successfully",
        recruiterProfile
    });

});

const getRecruiterProfileController = asyncHandler(async (req, res) => {

    const recruiterProfile = await recruiterModel.findOne({
        user: req.user._id
    });

    if (!recruiterProfile) {
        throw new ApiError(
            404,
            "no recruiter profile associated with this user"
        );
    }

    return res.status(200).json({
        message: "recruiter profile fetched successfully",
        recruiterProfile
    });

});

const updateRecruiterProfileController = asyncHandler(async (req, res) => {

    const {
        companyName,
        companyDescription,
        companyWebsite,
        companyLocation
    } = req.body;

    const updateFields = {};

    if (companyName !== undefined)
        updateFields.companyName = companyName;

    if (companyDescription !== undefined)
        updateFields.companyDescription = companyDescription;

    if (companyWebsite !== undefined)
        updateFields.companyWebsite = companyWebsite;

    if (companyLocation !== undefined)
        updateFields.companyLocation = companyLocation;

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(
            400,
            "please update at least one field"
        );
    }

    const updatedRecruiterProfile = await recruiterModel.findOneAndUpdate(
        {
            user: req.user._id
        },
        {
            $set: updateFields
        },
        {
            new: true
        }
    );

    if (!updatedRecruiterProfile) {
        throw new ApiError(
            404,
            "no recruiter profile exists for this user"
        );
    }

    return res.status(200).json({
        message: "recruiter profile updated successfully",
        updatedRecruiterProfile
    });

});

const getRecruiterDashboardController = asyncHandler(async (req, res) => {

    const recruiter = await recruiterModel.findOne({
        user: req.user._id
    });

    if (!recruiter) {
        throw new ApiError(404, "Recruiter profile not found");
    }

    // =========================
    // Job Statistics
    // =========================

    const jobStats = await jobModel.aggregate([
        {
            $match: {
                postedBy: recruiter._id
            }
        },
        {
            $group: {
                _id: null,

                totalJobs: {
                    $sum: 1
                },

                averageSalary: {
                    $avg: "$salary"
                },

                maxSalary: {
                    $max: "$salary"
                },

                minSalary: {
                    $min: "$salary"
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalJobs: 1,
                averageSalary: 1,
                maxSalary: 1,
                minSalary: 1
            }
        }
    ]);

    // =========================
    // Application Statistics
    // =========================

    const applicationStats = await applicationModel.aggregate([
        {
            $lookup: {
                from: "jobs",
                localField: "job",
                foreignField: "_id",
                as: "job"
            }
        },
        {
            $unwind: "$job"
        },
        {
            $match: {
                "job.postedBy": recruiter._id
            }
        },
        {
            $group: {
                _id: null,

                totalApplications: {
                    $sum: 1
                },

                applied: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "applied"] },
                            1,
                            0
                        ]
                    }
                },

                accepted: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "accepted"] },
                            1,
                            0
                        ]
                    }
                },

                rejected: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "rejected"] },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalApplications: 1,
                applied: 1,
                accepted: 1,
                rejected: 1
            }
        }
    ]);

    const dashboard = {

        jobStats: jobStats[0] || {
            totalJobs: 0,
            averageSalary: 0,
            maxSalary: 0,
            minSalary: 0
        },

        applicationStats: applicationStats[0] || {
            totalApplications: 0,
            applied: 0,
            accepted: 0,
            rejected: 0
        }

    };

    return res.status(200).json({
        message: "Recruiter dashboard fetched successfully",
        dashboard
    });

});

const uploadCompanyLogoController = asyncHandler(async (req, res) => {

    const recruiter = await recruiterModel.findOne({
        user: req.user._id
    });

    if (!recruiter) {
        throw new ApiError(404, "no recruiter found");
    }

    const file = req.file;

    if (!file) {
        throw new ApiError(400, "please provide image for company logo");
    }

    if (recruiter.companyLogoFileId) {
        await imagekitUpload.deleteFile(recruiter.companyLogoFileId);
    }

    const response = await imagekitUpload.uploadCompanyLogo(
        file.buffer.toString("base64")
    );

    recruiter.companyLogoUrl = response.url;
    recruiter.companyLogoFileId = response.fileId;

    await recruiter.save();

    return res.status(200).json({
        message: "company logo uploaded successfully",
        recruiter
    });

});

module.exports = {createRecruiterProfileController,getRecruiterProfileController,updateRecruiterProfileController,getRecruiterDashboardController,uploadCompanyLogoController}