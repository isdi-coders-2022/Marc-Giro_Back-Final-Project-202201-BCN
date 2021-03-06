/* eslint-disable no-underscore-dangle */
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../database/models/user");

const createUser = async (req, res, next) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    const error = new Error("Please fill the blank fields");
    error.code = 400;
    next(error);
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.create({ name, username, password: hashedPassword });
    res.status(201).json({ name, username });
  } catch (error) {
    error.code = 409;
    error.message = "Username already taken";
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    const error = new Error("Wrong username, user not found");
    error.code = 404;
    return next(error);
  }

  const rightPassword = await bcrypt.compare(password, user.password);
  if (!rightPassword) {
    const error = new Error("Wrong password");
    error.code = 401;
    return next(error);
  }

  const userData = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userData, process.env.JWT_SECRET);
  return res.json({ token });
};

module.exports = { createUser, loginUser };
