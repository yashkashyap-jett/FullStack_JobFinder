import axiosInstance from './axiosInstance';

export const createRecruiterProfileApi = (data) =>
  axiosInstance.post('/recruiter/profile', data);

export const getRecruiterProfileApi = () =>
  axiosInstance.get('/recruiter/profile');

export const updateRecruiterProfileApi = (data) =>
  axiosInstance.put('/recruiter/profile', data);

export const getRecruiterDashboardApi = () =>
  axiosInstance.get('/recruiter/dashboard');

export const uploadCompanyLogoApi = (file) => {
  const formData = new FormData();
  formData.append('companyLogo', file);
  return axiosInstance.post('/recruiter/upload-company-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
