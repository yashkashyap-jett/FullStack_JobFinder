const { default: mongoose, sanitizeFilter } = require("mongoose");
const candidateModel = require("../model/candidate.model")
const userModel = require("../model/user.model");
const applicationModel = require("../model/application.model");
const jobModel = require("../model/job.model");
const imagekitUpload = require("../services/imageKit.services")
const asyncHandler = require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")


const createCandidateProfileController = asyncHandler(async (req,res)=>{
    
const {skills,education,experience} = req.body;

if(!skills||!education||!experience){
    throw new ApiError(400,"skills,education and experience are required")
}

const existingProfile = await candidateModel.findOne({
    user:req.user._id
})

if(existingProfile){
throw new ApiError(400,"candidate profile already exists")
}

const candidateProfile = await candidateModel.create({
    user:req.user._id,
    skills,
    education,
    experience
})

return res.status(201).json({
    message:"candidate profile created successfully",
    candidateProfile
})
})

const getCandidateProfileController = asyncHandler(async (req,res)=>{

    const candidateProfile = await candidateModel.findOne({
        user:req.user._id
    });

    if(!candidateProfile){
        throw new ApiError(404,"no candidate found with this");
    }

    return res.status(200).json({
        message:"candidate profile fetched successfully",
        candidateProfile
    });

});

const updateCandidateProfileController = asyncHandler(async (req,res)=>{

    const {skills,education,experience} = req.body;

    const updateFields = {};

    if(skills!==undefined) updateFields.skills = skills;

    if(education!==undefined) updateFields.education = education;

    if(experience!==undefined) updateFields.experience = experience;

    if(Object.keys(updateFields).length===0){
        throw new ApiError(400,"please provide at least one field to update");
    }

    const updateProfile = await candidateModel.findOneAndUpdate(
        {
            user:req.user._id
        },
        {
            $set:updateFields
        },
        {
            new:true
        }
    ).populate("user");

    if(!updateProfile){
        throw new ApiError(404,"no profile found with this user");
    }

    return res.status(200).json({
        message:"candidate profile updated successfully",
        profile:updateProfile
    });

});

const getCandidateDashboardController = asyncHandler(async (req, res) => {

    const candidate = await candidateModel.findOne({
        user: req.user._id
    });

    if (!candidate) {
        throw new ApiError(404, "Candidate profile not found");
    }

    // ============================
    // Application Statistics
    // ============================

    const applicationStats = await applicationModel.aggregate([
        {
            $match: {
                candidate: candidate._id
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

    // ============================
    // Recent Applications
    // ============================

    const recentApplications = await applicationModel.aggregate([
        {
            $match: {
                candidate: candidate._id
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $limit: 5
        },
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
            $project: {
                _id: 0,
                status: 1,
                appliedAt: "$createdAt",
                jobTitle: "$job.title",
                salary: "$job.salary",
                location: "$job.location"
            }
        }
    ]);

    // ============================
    // Dashboard Response
    // ============================

    const dashboard = {
        applicationStats: applicationStats[0] || {
            totalApplications: 0,
            applied: 0,
            accepted: 0,
            rejected: 0
        },
        recentApplications
    };

    return res.status(200).json({
        message: "Candidate dashboard fetched successfully",
        dashboard
    });

});

const uploadResumeController = asyncHandler(async (req,res)=>{

    const candidate = await candidateModel.findOne({
        user:req.user._id
    });

    if(!candidate){
        throw new ApiError(404,"candidate profile not found");
    }

    const file = req.file;

    if(!file){
        throw new ApiError(400,"please upload your resume");
    }

    if(candidate.resumeFileId){
        await imagekitUpload.deleteFile(candidate.resumeFileId);
    }

    const response = await imagekitUpload.uploadResume(
        file.buffer.toString("base64")
    );

    candidate.resumeUrl = response.url;
    candidate.resumeFileId = response.fileId;

    await candidate.save();

    return res.status(200).json({
        message:"resume uploaded successfully",
        candidate
    });

});

const uploadProfilePhotoController = asyncHandler(async (req,res)=>{

    const candidate = await candidateModel.findOne({
        user:req.user._id
    });

    if(!candidate){
        throw new ApiError(404,"no candidate found");
    }

    const file = req.file;

    if(!file){
        throw new ApiError(400,"please provide profile photo");
    }

    if(candidate.profilePhotoFileId){
        await imagekitUpload.deleteFile(candidate.profilePhotoFileId);
    }

    const response = await imagekitUpload.uploadProfilePhoto(
        file.buffer.toString("base64")
    );

    candidate.profilePhotoUrl = response.url;
    candidate.profilePhotoFileId = response.fileId;

    await candidate.save();

    return res.status(200).json({
        message:"profile photo uploaded successfully",
        candidate
    });

});


module.exports = {createCandidateProfileController,getCandidateProfileController,updateCandidateProfileController,getCandidateDashboardController,uploadResumeController,uploadProfilePhotoController}