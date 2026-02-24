import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

// Request interceptor for adding the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('toqn_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh or unauthorized errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('toqn_refresh_token');
                if (!refreshToken) throw new Error('No refresh token');

                const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
                    refreshToken,
                });

                const { token } = response.data;
                localStorage.setItem('toqn_token', token);

                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            } catch (err) {
                // Clear storage and redirect to login if refresh fails
                localStorage.removeItem('toqn_token');
                localStorage.removeItem('toqn_refresh_token');
                localStorage.removeItem('toqn_user');
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
