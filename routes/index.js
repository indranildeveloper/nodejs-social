const express = require("express");
const router = express.Router();

const Story = require("../models/Story");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

// @desc    Login/Landing Page
// @route   GET /
router.get("/", ensureGuest, (req, res) => {
  res.render("login", { layout: "login_layout" });
});
// @desc    Dashboard Page
// @route   GET /
router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean();
    res.render("dashboard", { name: req.user.firstName, stories });
  } catch (error) {
    console.error(err);
    res.render("error/500");
  }
});

module.exports = router;