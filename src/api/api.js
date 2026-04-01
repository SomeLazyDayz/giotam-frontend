import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Các hàm gọi API như trước
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createAlert = async (alertData) => {
  const response = await api.post('/create_alert', alertData);
  return response.data;
};

// ... các hàm khác

export default api;