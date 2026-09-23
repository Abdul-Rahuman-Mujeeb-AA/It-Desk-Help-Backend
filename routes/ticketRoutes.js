const express = require("express");

const {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  deleteTicket,
} = require("../controllers/ticketController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/", protect, upload.single("attachment"), createTicket);
router.get("/my", protect, getMyTickets);
router.get("/", protect, adminOnly, getAllTickets);
router.get("/:id", protect, getTicketById);
router.put("/:id", protect, upload.single("attachment"), updateTicket);
router.patch("/:id/status", protect, adminOnly, updateTicketStatus);
router.patch("/:id/assign", protect, adminOnly, assignTicket);
router.delete("/:id", protect, deleteTicket);

module.exports = router;
