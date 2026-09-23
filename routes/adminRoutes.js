const express = require("express");

const {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Admin dashboard
router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", getUsers);

router.put("/users/:id", updateUser);

router.delete("/users/:id", deleteUser);

module.exports = router;
