import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/signup`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};
export const getProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};
export const logout = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/logout`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};
