import axiosInstance from './axiosInstance';

// Candidate
export const applyForJobApi = (jobId) =>
  axiosInstance.post(`/applications/apply/${jobId}`);

export const getMyApplicationsApi = () =>
  axiosInstance.get('/applications/my-applications');

export const withdrawApplicationApi = (applicationId) =>
  axiosInstance.delete(`/applications/withdraw/${applicationId}`);

// Recruiter
export const getApplicantsForJobApi = (jobId) =>
  axiosInstance.get(`/applications/applicants/${jobId}`);

export const updateApplicationStatusApi = (applicationId, status) =>
  axiosInstance.patch(`/applications/status/${applicationId}`, { status });
