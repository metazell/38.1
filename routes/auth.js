const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const router = new express.Router();

/** POST /login - login: {username, password} => {token} */
router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const isAuthenticated = await User.authenticate(username, password);

    if (isAuthenticated) {
      const token = jwt.sign({ username }, SECRET_KEY);
      await User.updateLoginTimestamp(username);
      return res.json({ token });
    } else {
      throw new ExpressError("Invalid username/password", 400);
    }
  } catch (err) {
    return next(err);
  }
});

/** POST /register - register user: registers, logs in, and returns token. */
router.post("/register", async function (req, res, next) {
  try {
    const newUser = await User.register(req.body);
    const token = jwt.sign({ username: newUser.username }, SECRET_KEY);
    await User.updateLoginTimestamp(newUser.username);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
