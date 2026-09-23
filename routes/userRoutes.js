const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/userController");

const protect = require("../middleware/protect");
const upload = require("../middleware/uploadMiddleware");

router.get("/profile", protect, getProfile);

router.put("/profile", protect, upload.single("profileImage"), updateProfile);

router.put("/change-password", protect, changePassword);

router.delete("/profile", protect, deleteAccount);

module.exports = router;
