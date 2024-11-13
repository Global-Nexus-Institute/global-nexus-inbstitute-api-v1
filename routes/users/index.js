const express = require("express");
const authMiddleware = require("../../middleware/auth");

const router = express.Router();
const Users = require("../../models/Users");

// get all users
router.get("/", async (req, res) => {
  try {
    const users = await Users.find();
    users.forEach((user) => {
      users["_id"] = user._id.toString();
    });
    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error " + error.message });
  }
});

// get students
router.get("/students", async (req, res) => {
  try {
    const users = await Users.find({ role: "student" });
    users.forEach((user) => {
      users["_id"] = user._id.toString();
    });
    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error " + error.message });
  }
});

// get staff
router.get("/staff", async (req, res) => {
  try {
    const users = await Users.find({ role: { $in: ["superadmin", "admin"] } });
    users.forEach((user) => {
      users["_id"] = user._id.toString();
    });
    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error " + error.message });
  }
});

// get a user
router.get("/:id", authMiddleware, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error " + error.message });
  }
});

// update user
router.post("/:id", authMiddleware, async (req, res) => {
  const userId = req.params.id;
  const data = req.body;
  let updatedUser = {};

  const user = await Users.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ message: "Hello World!" });
});

router.post("/create-user", authMiddleware, async (req, res) => {
  const data = req.body;
  try {
    const newUser = new Users(data);
    await newUser.save();
    res.json({ message: "Hello World!", user: newUser });
  } catch (error) {
    res.status(500).json({ error: "Internal server error " + error.message });
  }
});

module.exports = router;
