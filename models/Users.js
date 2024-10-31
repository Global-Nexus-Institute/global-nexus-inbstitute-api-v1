// models/User.js
const mongoose = require("../config/mongoose");
const Courses = require("./Courses");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  names: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, required: true },
  phoneNumber: { type: String },
  address: {
    streetAddress: { type: String },
    city: { type: String },
    country: { type: String },
    zipCode: { type: String },
  },
  courses: [Courses.schema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("users", userSchema);
