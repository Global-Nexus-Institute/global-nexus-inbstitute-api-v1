const express = require("express");
const bcrypt = require("bcrypt");

const firebase = require("../../config/firebase");

const router = express.Router();

// import user model
const Users = require("../../models/Users");

// password validation
const { validatePassword } = require("../../helpers");
const authMiddleware = require("../../middleware/auth");

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
  const { email, password, name, address, role, firstName, lastName } =
    req.body.user;
  if (!email || !password || !firstName || !address) {
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
        names: name,
        firstName: firstName,
        lastName: lastName,
        address: {
          streetAddress: address.streetAddress,
          city: address.city,
        },
        role: role,
      });

      newUser.save();
      return res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
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

router.get("/user/:uid", authMiddleware, async(req, res) => {
  try {
    const {uid} = req.params;
    const user = await Users.findOne({ uid: uid });
    return res.status(200).json(user);
  } catch(error){
    res.status(500).json({ error: "Internal server error " + error.message });
  }
});

module.exports = router;
