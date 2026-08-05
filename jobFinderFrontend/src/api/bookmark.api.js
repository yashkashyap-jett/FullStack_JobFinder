import axiosInstance from './axiosInstance';

// Bookmark a job
export const bookmarkJobApi = (jobId) =>
  axiosInstance.post(`/bookmarks/${jobId}`);

// Get all bookmarks for the logged-in candidate
export const getAllBookmarksApi = () =>
  axiosInstance.get('/bookmarks');

// Remove a bookmark
export const deleteBookmarkApi = (jobId) =>
  axiosInstance.delete(`/bookmarks/${jobId}`);
