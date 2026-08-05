const applicationModel = require("../model/application.model")
const jobModel = require("../model/job.model")
const candidateModel = require("../model/candidate.model");
const recruiterModel = require("../model/recruiter.model");
const asyncHandler = require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")


const applyForJobController = asyncHandler(async (req,res)=>{

    const {jobId} = req.params;

    if(!jobId){
        throw new ApiError(400,"please provide jobId to apply for it");
    }

    const candidate = await candidateModel.findOne({
        user:req.user._id
    });

    if(!candidate){
        throw new ApiError(404,"candidate profile not found");
    }

    const job = await jobModel.findById(jobId);

    if(!job){
        throw new ApiError(404,"no job found with this jobId");
    }

    const isAlreadyApplied = await applicationModel.findOne({
        job:jobId,
        candidate:candidate._id
    });

    if(isAlreadyApplied){
        throw new ApiError(400,"application already applied");
    }

    const application = await applicationModel.create({
        candidate:candidate._id,
        job:jobId
    });

    return res.status(201).json({
        message:"application created successfully",
        application
    });

});

const getMyApplicationsController = asyncHandler(async (req,res)=>{

    const candidate = await candidateModel.findOne({
        user:req.user._id
    });

    if(!candidate){
        throw new ApiError(404,"candidate profile not found");
    }

    const application = await applicationModel
        .find({
            candidate:candidate._id
        })
        .populate("job");

    if(application.length===0){
        throw new ApiError(404,"no job applied by this candidate");
    }

    return res.status(200).json({
        message:"all jobs by this candidate fetched successfully",
        application
    });

});

const getApplicantsForJobController = asyncHandler(async (req,res)=>{

    const {jobId} = req.params;

    if(!jobId){
        throw new ApiError(400,"please provide job id");
    }

    const recruiter = await recruiterModel.findOne({
        user:req.user._id
    });

    if(!recruiter){
        throw new ApiError(404,"recruiter profile not found");
    }

    const job = await jobModel.findOne({
        _id:jobId,
        postedBy:recruiter._id
    });

    if(!job){
        throw new ApiError(404,"no job found");
    }

    const application = await applicationModel
        .find({job:jobId})
        .populate("candidate");

    if(application.length===0){
        throw new ApiError(404,"no application found for this job");
    }

    return res.status(200).json({
        message:"all applicants fetched successfully",
        application
    });

});

const updateApplicationStatusController = asyncHandler(async (req,res)=>{

    const {applicationId} = req.params;

    const {status} = req.body;

    if(status!=="accepted" && status!=="rejected"){
        throw new ApiError(400,"status can either be accepted or rejected");
    }

    const recruiter = await recruiterModel.findOne({
        user:req.user._id
    });

    if(!recruiter){
        throw new ApiError(404,"recruiter profile not found");
    }

    const application = await applicationModel.findById(applicationId);

    if(!application){
        throw new ApiError(404,"no application found");
    }

    const job = await jobModel.findById(application.job);

    if(!job){
        throw new ApiError(404,"job not found");
    }

    const ownership = await jobModel.findOne({
        _id:application.job,
        postedBy:recruiter._id
    });

    if(!ownership){
        throw new ApiError(403,"you are not authorized to change the status");
    }

    const applicationStatus = await applicationModel.findByIdAndUpdate(
        applicationId,
        {
            $set:{status}
        },
        {
            new:true
        }
    );

    return res.status(200).json({
        message:"status changed successfully",
        applicationStatus
    });

});

const withdrawApplicationController = asyncHandler(async (req,res)=>{

    const {applicationId} = req.params;

    if(!applicationId){
        throw new ApiError(400,"please provide applicationId");
    }

    const application = await applicationModel.findById(applicationId);

    if(!application){
        throw new ApiError(404,"no application found with this ID");
    }

    const candidate = await candidateModel.findOne({
        user:req.user._id
    });

    if(!candidate){
        throw new ApiError(404,"candidate profile not found");
    }

    if(application.candidate.toString()!==candidate._id.toString()){
        throw new ApiError(403,"you are not authorized to withdraw this application");
    }

    await applicationModel.findByIdAndDelete(applicationId);

    return res.status(200).json({
        message:"application withdrawn successfully"
    });

});

module.exports = {applyForJobController,getApplicantsForJobController,getMyApplicationsController,updateApplicationStatusController,withdrawApplicationController}
