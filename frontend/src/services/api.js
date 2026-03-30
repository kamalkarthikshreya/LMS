import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token if available
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsedInfo = JSON.parse(userInfo);
            if (parsedInfo.token) {
                config.headers.Authorization = `Bearer ${parsedInfo.token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getThumbnail = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    return `${baseUrl}${url}`;
};

export default api;
