import express from "express";
import User from "../models/user.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadProfileImage } from "../config/upload.js";

const router = express.Router();

// GET my profile
router.get("/me", requireAuth, async (req, res) => {
  return res.json({ profile: req.user.profile, email: req.user.email });
});

// PUT update profile (all fields)
router.put("/me", requireAuth, async (req, res) => {
  try {
    const allowed = ["bio", "linkedIn", "degrees", "certifications", "licenses", "shortCourses", "employmentHistory"];
    const nextProfile = { ...req.user.profile.toObject?.() };

    for (const key of allowed) {
      if (req.body[key] !== undefined) nextProfile[key] = req.body[key];
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { profile: { ...nextProfile, profileImageUrl: req.user.profile.profileImageUrl } },
      { new: true }
    ).select("-password");

    return res.json({ message: "Profile updated", profile: updated.profile });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: e.message });
  }
});

// POST upload profile image
router.post(
  "/me/profile-picture",
  requireAuth,
  uploadProfileImage.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file received. In Postman use Body=form-data, key=image, type=File.",
        });
      }

      const url = `/uploads/${req.file.filename}`;

      const updated = await User.findByIdAndUpdate(
        req.user._id,
        { "profile.profileImageUrl": url },
        { new: true }
      ).select("-passwordHash");

      return res.json({
        message: "Profile picture updated",
        profileImageUrl: updated.profile.profileImageUrl,
      });
    } catch (e) {
      return res.status(500).json({ message: "Server error", error: e.message });
    }
  }
);

export default router;