const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const router = express.Router();

router.get("/:userA/:userB", async (req, res) => {
  const { userA, userB } = req.params;
  const messages = await Message.find({
    $or: [
      { sender: userA, receiver: userB },
      { sender: userB, receiver: userA }
    ]
  }).sort({ createdAt: 1 });
  res.json(messages);
});

router.post("/", async (req, res) => {
  const { sender, receiver, text } = req.body;
  if (!sender || !receiver || !text) return res.status(400).json({ message: "Missing fields" });

  const user = await User.findOne({ username: sender });
  if (!user || !user.friends.includes(receiver)) {
    return res.status(403).json({ message: "You can only message friends" });
  }

  const msg = new Message({ sender, receiver, text });
  await msg.save();
  res.json(msg);
});

module.exports = router;
