import { http } from "./http";

export const authApi = {
  register: (payload) => http.post("/api/auth/register", payload),
  verifyEmail: (payload) => http.post("/api/auth/verify-email", payload),
  login: (payload) => http.post("/api/auth/login", payload),

  requestPasswordReset: (payload) => http.post("/api/auth/password-reset/request", payload),
  confirmPasswordReset: (payload) => http.post("/api/auth/password-reset/confirm", payload),
};