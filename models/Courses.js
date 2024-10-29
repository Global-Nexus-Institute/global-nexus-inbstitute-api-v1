// models/courses.js
const mongoose = require("../config/mongoose");

const courseSchema = new mongoose.Schema({
  uuid: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  short_intro: { type: String, required: true },
  is_featured: { type: Boolean, required: true },
  lesson_count: { type: Number, required: true },
  student_count: { type: Number, required: true },
  activity_count: { type: Number, required: true },
  main_image: { type: String, required: true },
  cost: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("courses", courseSchema);
