import axiosInstance from './axiosInstance';

export const createCandidateProfileApi = (data) =>
  axiosInstance.post('/candidate/create-profile', data);

export const getCandidateProfileApi = () =>
  axiosInstance.get('/candidate/profile');

export const updateCandidateProfileApi = (data) =>
  axiosInstance.put('/candidate/profile', data);

export const getCandidateDashboardApi = () =>
  axiosInstance.get('/candidate/dashboard');

export const uploadResumeApi = (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  return axiosInstance.post('/candidate/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadProfilePhotoApi = (file) => {
  const formData = new FormData();
  formData.append('profile', file);
  return axiosInstance.post('/candidate/upload-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
