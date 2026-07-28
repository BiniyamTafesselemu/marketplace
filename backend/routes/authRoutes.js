const express = require("express");
const passport = require("passport");
const { googleCallback, register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`
    }),
    googleCallback
);

// Email/Password
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;