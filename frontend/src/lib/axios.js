import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api" // local backend
    : "/api"; // relative path in production (Vercel will route correctly)

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
