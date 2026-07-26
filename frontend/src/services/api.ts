import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://qrdemo-xi.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codex_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('codex_token');
      localStorage.removeItem('codex_user');
    }

    return Promise.reject(error);
  }
);
