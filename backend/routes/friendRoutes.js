const express = require("express");
const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");
const router = express.Router();

router.post("/send", async (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) return res.status(400).json({ message: "Missing fields" });
  if (from === to) return res.status(400).json({ message: "Cannot send to self" });

  const already = await FriendRequest.findOne({ from, to, status: "pending" });
  if (already) return res.status(400).json({ message: "Already sent" });

  const userFrom = await User.findOne({ username: from });
  if (userFrom && userFrom.friends.includes(to)) return res.status(400).json({ message: "Already friends" });

  const fr = new FriendRequest({ from, to });
  await fr.save();
  res.json({ message: "Request sent" });
});

router.get("/requests/:username", async (req, res) => {
  const username = req.params.username;
  const list = await FriendRequest.find({ to: username, status: "pending" });
  res.json(list);
});

router.post("/accept", async (req, res) => {
  const { requestId } = req.body;
  const reqDoc = await FriendRequest.findById(requestId);
  if (!reqDoc) return res.status(404).json({ message: "Not found" });

  reqDoc.status = "accepted";
  await reqDoc.save();

  const uFrom = await User.findOne({ username: reqDoc.from });
  const uTo = await User.findOne({ username: reqDoc.to });
  if (!uFrom.friends.includes(uTo.username)) uFrom.friends.push(uTo.username);
  if (!uTo.friends.includes(uFrom.username)) uTo.friends.push(uFrom.username);
  await uFrom.save();
  await uTo.save();

  res.json({ message: "Accepted" });
});

router.post("/reject", async (req, res) => {
  const { requestId } = req.body;
  const reqDoc = await FriendRequest.findById(requestId);
  if (!reqDoc) return res.status(404).json({ message: "Not found" });
  reqDoc.status = "rejected";
  await reqDoc.save();
  res.json({ message: "Rejected" });
});

module.exports = router;
