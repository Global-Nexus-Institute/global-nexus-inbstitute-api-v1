const express = require("express");
const bcrypt = require("bcrypt");

const firebase = require("../../config/firebase");

const router = express.Router();

// import user model
const Users = require("../../models/Users");

// password validation
const { validatePassword } = require("../../helpers");

router.post("/login", async (req, res) => {
  const token = req.body.token;

  try {
    const decodedToken = await firebase.auth().verifyIdToken(token);
    uid = decodedToken["uid"];

    const user = await Users.findOne({ uid: uid });
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(401).json({ error: "User not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error " + error.message });
  }
});

router.post("/signup", async (req, res) => {
  const { email, password, names, address } = req.body.user;
  if (!email || !password || !names || !address) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (validatePassword(password) !== null) {
    return res.status(400).json({ error: validatePassword(password) });
  }

  try {
    // check if user already exists
    const user = await firebase
      .auth()
      .getUserByEmail(email)
      .catch((error) => {
        if (error.code === "auth/user-not-found") {
          return null;
        } else {
          throw error;
        }
      });

    if (user === null) {
      // Create new user
      const userCredential = await firebase
        .auth()
        .createUser({ email, password });
      console.log("this user", userCredential);
      const hashedPassword = await bcrypt.hashSync(password, 10);

      // save use in mongodb
      const newUser = new Users({
        uid: userCredential.uid,
        email: email,
        password: hashedPassword,
        names: names,
        address: {
          address: address.city,
          city: address.city,
        },
        role: "student",
      });

      newUser.save();
      return res
        .status(201)
        .json({ message: "User created successfully", user: newUser.uid });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error " + error.message });
  }
});

router.get("/logout", (req, res) => {
  return res.json({ message: "Logout Successfull" });
});

router.post("/reset-password", (req, res) => {
  res.json({ message: "Hello World!" });
});

module.exports = router;
