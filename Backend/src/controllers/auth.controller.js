import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendEmail } from "../services/email.service.js";

function isUniversityEmail(email) {
  return email.toLowerCase().endsWith(`@${process.env.UNIVERSITY_DOMAIN}`);
}

function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/* ================= REGISTER ================= */
export async function register(req, res) {
  const { email, password } = req.body;

  if (!isUniversityEmail(email))
    return res.status(400).json({ message: "University email required" });

  if (!isStrongPassword(password))
    return res.status(400).json({ message: "Weak password" });

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
  });

  await sendVerificationOtp(user);

  res.status(201).json({ message: "Registered. OTP sent to email." });
}

/* ================= SEND VERIFY OTP ================= */
async function sendVerificationOtp(user) {
  const otp = generateOtp();

  await Otp.deleteMany({ userId: user._id, purpose: "VERIFY_EMAIL" });

  await Otp.create({
    userId: user._id,
    otpHash: hashOtp(otp),
    purpose: "VERIFY_EMAIL",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail(
    user.email,
    "Email Verification OTP",
    `<h2>Your OTP: ${otp}</h2><p>Expires in 10 minutes</p>`
  );

  console.log("VERIFY OTP:", otp); // remove in production
}

/* ================= VERIFY EMAIL ================= */
export async function verifyEmail(req, res) {
  const { email, otp } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(400).json({ message: "Invalid email" });

  const otpDoc = await Otp.findOne({
    userId: user._id,
    purpose: "VERIFY_EMAIL",
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!otpDoc) return res.status(400).json({ message: "OTP expired" });

  if (hashOtp(otp) !== otpDoc.otpHash)
    return res.status(400).json({ message: "Invalid OTP" });

  user.isVerified = true;
  await user.save();

  otpDoc.usedAt = new Date();
  await otpDoc.save();

  res.json({ message: "Email verified successfully" });
}

/* ================= LOGIN ================= */
export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  if (!user.isVerified)
    return res.status(403).json({ message: "Please verify email first" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.json({ token });
}

/* ================= REQUEST PASSWORD RESET ================= */
export async function requestPasswordReset(req, res) {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user)
    return res.json({ message: "If email exists, OTP will be sent." });

  const otp = generateOtp();

  await Otp.deleteMany({ userId: user._id, purpose: "RESET_PASSWORD" });

  await Otp.create({
    userId: user._id,
    otpHash: hashOtp(otp),
    purpose: "RESET_PASSWORD",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail(
    user.email,
    "Password Reset OTP",
    `<h2>Your reset OTP: ${otp}</h2><p>Expires in 10 minutes</p>`
  );

  console.log("RESET OTP:", otp);

  res.json({ message: "If email exists, OTP sent." });
}

/* ================= RESET PASSWORD ================= */
export async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(400).json({ message: "Invalid request" });

  const otpDoc = await Otp.findOne({
    userId: user._id,
    purpose: "RESET_PASSWORD",
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!otpDoc) return res.status(400).json({ message: "OTP expired" });

  if (hashOtp(otp) !== otpDoc.otpHash)
    return res.status(400).json({ message: "Invalid OTP" });

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  otpDoc.usedAt = new Date();
  await otpDoc.save();

  res.json({ message: "Password reset successful" });
}