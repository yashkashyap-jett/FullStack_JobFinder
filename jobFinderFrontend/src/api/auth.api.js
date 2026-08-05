import axiosInstance from './axiosInstance';

export const registerApi = (data) =>
  axiosInstance.post('/auth/register', data);

export const loginApi = (data) =>
  axiosInstance.post('/auth/login', data);

export const logoutApi = () =>
  axiosInstance.post('/auth/logout');

export const refreshTokenApi = () =>
  axiosInstance.post('/auth/refresh-token');
