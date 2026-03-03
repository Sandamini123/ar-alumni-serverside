import { http } from "./http";

export const authApi = {
  register: (payload) => http.post("/auth/register", payload),
  sendOtp: (payload) => http.post("/auth/otp/send", payload),
  verifyEmail: (payload) => http.post("/auth/verify-email", payload),
  login: (payload) => http.post("/auth/login", payload),
  forgotPassword: (payload) => http.post("/auth/password/forgot", payload),
  resetPassword: (payload) => http.post("/auth/password/reset", payload),
};