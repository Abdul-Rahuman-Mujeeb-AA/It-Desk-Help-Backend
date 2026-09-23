const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// Register a new user
const registerUser = async ({ name, email, password, role = "user" }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Generate JWT token
  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    },
  };
};

// Login user
const loginUser = async ({ email, password }) => {
  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check password
  const isPasswordMatch = await user.matchPassword(password);

  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT token
  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    },
  };
};

// Get user by ID
const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
};
