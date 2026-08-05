const jobModel = require("../model/job.model")
const recruiterModel = require("../model/recruiter.model")
const asyncHandler = require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")


const createJobController = asyncHandler(async (req, res) => {

    const { title, description, salary, location } = req.body;

    if (!title || !description || !salary || !location) {
        throw new ApiError(
            400,
            "title, description, salary and location are required to create job"
        );
    }

    const recruiter = await recruiterModel.findOne({
        user: req.user._id
    });

    if (!recruiter) {
        throw new ApiError(404, "recruiter profile not found");
    }

    const createJob = await jobModel.create({
        title,
        description,
        salary,
        location,
        postedBy: recruiter._id
    });

    return res.status(201).json({
        message: "job created successfully",
        createJob
    });

});

const getAllJobsController = asyncHandler(async (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // ============================
    // Location Filter
    // ============================

    if (req.query.location) {
        filter.location = req.query.location;
    }

    // ============================
    // Posted By Filter (for recruiter "my jobs")
    // ============================

    if (req.query.postedBy) {
        filter.postedBy = req.query.postedBy;
    }

    // ============================
    // Search Filter
    // ============================

    if (req.query.search) {
        filter.$or = [
            {
                title: {
                    $regex: req.query.search,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: req.query.search,
                    $options: "i"
                }
            }
        ];
    }

    // ============================
    // Salary Filter
    // ============================

    if (req.query.minSalary || req.query.maxSalary) {

        filter.salary = {};

        if (req.query.minSalary) {
            filter.salary.$gte = Number(req.query.minSalary);
        }

        if (req.query.maxSalary) {
            filter.salary.$lte = Number(req.query.maxSalary);
        }
    }

    // ============================
    // Sorting
    // ============================

    const sortOptions = {
        salary_desc: { salary: -1 },
        salary_asc: { salary: 1 },
        latest: { createdAt: -1 },
        oldest: { createdAt: 1 }
    };

    const sort = sortOptions[req.query.sort] || {};

    // ============================
    // View Selection
    // ============================

    const selectOption = {
        list: "title salary location postedBy",
        details: "title description salary location requirements responsibilities postedBy"
    };

    const selectField =
        selectOption[req.query.view] ||
        "title salary location postedBy";

    // ============================
    // Fetch Jobs
    // ============================

    const jobs = await jobModel
        .find(filter)
        .select(selectField)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("postedBy", "companyName");

    // ============================
    // Pagination
    // ============================

    const totalJobs = await jobModel.countDocuments(filter);

    const totalPages = Math.ceil(totalJobs / limit);

    // ============================
    // Response
    // ============================

    return res.status(200).json({
        message: "Jobs fetched successfully",
        currentPage: page,
        limit,
        totalJobs,
        totalPages,
        jobs
    });

});

const getSingleJobController = asyncHandler(async (req, res) => {

    const { jobId } = req.params;

    if (!jobId) {
        throw new ApiError(400, "please provide job id to fetch job");
    }

    const job = await jobModel.findById(jobId);

    if (!job) {
        throw new ApiError(404, "no job found with this ID");
    }

    return res.status(200).json({
        message: "job found successfully",
        job
    });

});

const updateJobController = asyncHandler(async (req, res) => {

    const { jobId } = req.params;

    if (!jobId) {
        throw new ApiError(400, "please provide jobId to update");
    }

    const recruiter = await recruiterModel.findOne({
        user: req.user._id
    });

    if (!recruiter) {
        throw new ApiError(404, "recruiter profile not found");
    }

    const job = await jobModel.findById(jobId);

    if (!job) {
        throw new ApiError(404, "no job found with this jobId");
    }

    const jobPostedBy = await jobModel.findOne({
        _id: jobId,
        postedBy: recruiter._id
    });

    if (!jobPostedBy) {
        throw new ApiError(403, "you cannot update the job of another recruiter");
    }

    const updateFields = {};

    const { title, description, salary, location } = req.body;

    if (title !== undefined) updateFields.title = title;

    if (description !== undefined) updateFields.description = description;

    if (salary !== undefined) updateFields.salary = salary;

    if (location !== undefined) updateFields.location = location;

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "please pass at least one field to update");
    }

    const jobUpdate = await jobModel.findByIdAndUpdate(
        jobId,
        {
            $set: updateFields
        },
        {
            new: true
        }
    );

    return res.status(200).json({
        message: "job updated successfully",
        jobUpdate
    });

});

const deleteJobController = asyncHandler(async (req, res) => {

    const { jobId } = req.params;

    if (!jobId) {
        throw new ApiError(400, "please provide jobId");
    }

    const recruiter = await recruiterModel.findOne({
        user: req.user._id
    });

    if (!recruiter) {
        throw new ApiError(404, "recruiter profile not found");
    }

    const job = await jobModel.findById(jobId);

    if (!job) {
        throw new ApiError(404, "no job found with this ID");
    }

    const ownership = await jobModel.findOneAndDelete({
        _id: jobId,
        postedBy: recruiter._id
    });

    if (!ownership) {
        throw new ApiError(403, "you are not authorized to delete this job");
    }

    return res.status(200).json({
        message: "job deleted successfully",
        job: ownership
    });

});

module.exports={createJobController,getAllJobsController,getSingleJobController,updateJobController,deleteJobController}