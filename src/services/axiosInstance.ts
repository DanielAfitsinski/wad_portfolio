// Axios instance configuration with default settings

import axios from "axios";
import { API_BASE_URL } from "../config/api";

// Create configured axios instance with credentials and headers
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
