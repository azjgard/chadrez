import axios from "axios";

if (!import.meta.env.VITE_BACKEND_URL) {
  throw new Error("BACKEND_URL must be defined in env");
}

export const client = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});
