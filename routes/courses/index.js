const express = require("express");
const authMiddleware = require("../../middleware/auth");

const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// import course model
const Courses = require("../../models/Courses");

const apiKey = process.env.API_KEY;
const apiUrl = process.env.ILLUMIDESK_API_URL;

router.get("/", async (req, res) => {
  try {
    const courses = await Courses.find();
    courses.forEach((course) => {
      courses["_id"] = course._id.toString();
    });
    return res.status(200).json(courses);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error " + error.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Courses.findOne({ slug: slug });
    return res.status(200).json({ course });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error " + error.message });
  }
});

router.post("/update-courses", async (req, res) => {
  const headers = {
    accept: "application/json",
    Authorization: apiKey,
  };
  try {
    // Fetch courses from Illumidesk
    const response = await axios.get(apiUrl, { headers });

    if (response.status !== 200) {
      res.json({ message: "Failed to fetch courses from Illumidesk" });
    } else {
      const illumidesk_courses = await response.data.results;
      console.log("Fetching courses from Illumidesk: ", illumidesk_courses);
      for (const course of illumidesk_courses) {
        // Assuming `course_id` is the unique identifier
        const course_id = course.uuid; // Replace with the actual unique identifier

        if (!course_id) {
          return res.json({ message: "Missing uuid in course data" });
        }
        const { cost, ...otherFields } = course;
        await Courses.updateOne(
          { uuid: course_id }, // Find course by unique ID
          { $set: otherFields }, // Replace the document with new data
          { upsert: true }, // Insert if it doesn't exist
        );
      }

      res.status(200).json({ message: "Updated courses successfully" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error " + error.message });
  }
});

router.put("/cost/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { cost } = req.body;
    const course = await Courses.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    course.cost = cost;
    await course.save();
    return res
      .status(200)
      .json({ message: "Cost updated successfully", course: course });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error " + error.message });
  }
});

module.exports = router;
