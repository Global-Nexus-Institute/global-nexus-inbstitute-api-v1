const express = require("express");
const useRoutes = require("./users");
const coursesRoutes = require("./courses");
const authRoutes = require("./auth");
const paymentRoutes = require("./payments/paypal");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", useRoutes);
router.use("/courses", coursesRoutes);
router.use("/payments", paymentRoutes);


module.exports = router;
