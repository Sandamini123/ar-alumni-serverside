import mongoose from "mongoose";

// ===== Sub-schemas =====
const DegreeSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },      // e.g., BSc Computer Science
    institute: { type: String, default: "" },  // e.g., University of Eastminster
    year: { type: String, default: "" },       // e.g., 2024
  },
  { _id: false }
);

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },   // e.g., AWS Certified Solutions Architect
    issuer: { type: String, default: "" }, // e.g., AWS
    year: { type: String, default: "" },   // e.g., 2025
    url: { type: String, default: "" },    // optional link
  },
  { _id: false }
);

const CourseSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    provider: { type: String, default: "" },
    year: { type: String, default: "" },
    url: { type: String, default: "" },
  },
  { _id: false }
);

const EmploymentSchema = new mongoose.Schema(
  {
    company: { type: String, default: "" },
    role: { type: String, default: "" },
    startDate: { type: String, default: "" }, // e.g., 2023-01
    endDate: { type: String, default: "" },   // e.g., 2024-12 or "Present"
    description: { type: String, default: "" },
  },
  { _id: false }
);

// ===== Main schema =====
const userSchema = new mongoose.Schema(
  {
    // existing fields (keep)
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },

    // new profile system fields
    profile: {
      bio: { type: String, default: "" },
      linkedIn: { type: String, default: "" },

      degrees: { type: [DegreeSchema], default: [] },
      certifications: { type: [ItemSchema], default: [] },
      licenses: { type: [ItemSchema], default: [] },
      shortCourses: { type: [CourseSchema], default: [] },
      employmentHistory: { type: [EmploymentSchema], default: [] },

      profileImageUrl: { type: String, default: "" }, // e.g. "/uploads/profile_xxx.jpg"
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);