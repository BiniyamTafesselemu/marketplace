const express = require('express');
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const category = require("./routes/categoryRoutes")
const provider = require("./routes/providerRoutes")
require("./config/passport");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/categories", category);
app.use("/providers", provider);

module.exports = app;