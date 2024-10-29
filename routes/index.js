const express = require("express");
const useRoutes = require("./users");
const coursesRoutes = require("./courses");
const authRoutes = require("./auth");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", useRoutes);
router.use("/courses", coursesRoutes);

module.exports = router;
