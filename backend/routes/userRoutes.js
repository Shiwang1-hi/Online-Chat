const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: "Username taken" });
    const user = new User({ username, password });
    await user.save();
    res.json({ message: "Registered" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, username: user.username, friends: user.friends || [] });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// list all users (no password)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("username");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// get user by username
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
