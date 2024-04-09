const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    enum: ["Admin", "Student", "Instructor"],
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  token:{
    type: String,
  },
  approved: {
    type: Boolean,
    default: true,
  },
 
  additionalDetails:{
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Profile",
  },
  courses: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Course",
    },
  ],
  resetPasswordExpires: {
    type: Date,
  },
  image: {
    type: String,
    required: true,
  },
  courseProgress: [
    {
      type: mongoose.Types.ObjectId,
      ref: "CourseProgress",
    },
  ],
},
		// Add timestamps for when the document is created and last modified
    { timestamps: true }
    );

module.exports = mongoose.model("User", userSchema);
