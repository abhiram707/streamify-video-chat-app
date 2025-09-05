// src/lib/axios.js
import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api" // Local backend
    : "https://streamify-video-chat-app-6.onrender.com/api"; // Render backend in production

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // ✅ ensures cookies (JWT) are sent
});
