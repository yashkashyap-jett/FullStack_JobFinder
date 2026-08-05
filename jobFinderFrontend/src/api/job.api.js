import axiosInstance from './axiosInstance';

/**
 * GET /jobs — list all jobs with full filter/sort/pagination support.
 * @param {Object} params - { search, location, minSalary, maxSalary, sort, view, page, limit, postedBy }
 */
export const getAllJobsApi = (params = {}) =>
  axiosInstance.get('/jobs', { params });

/**
 * GET /jobs/:jobId — fetch a single job by ID.
 */
export const getSingleJobApi = (jobId) =>
  axiosInstance.get(`/jobs/${jobId}`);

/**
 * POST /jobs — create a new job (recruiter only).
 * @param {{ title, description, salary, location }} data
 */
export const createJobApi = (data) =>
  axiosInstance.post('/jobs', data);

/**
 * PUT /jobs/:jobId — update a job (recruiter only, must own the job).
 */
export const updateJobApi = (jobId, data) =>
  axiosInstance.put(`/jobs/${jobId}`, data);

/**
 * DELETE /jobs/:jobId — delete a job (recruiter only, must own the job).
 */
export const deleteJobApi = (jobId) =>
  axiosInstance.delete(`/jobs/${jobId}`);
