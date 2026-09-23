// Ticket CRUD and status-management handlers

const Ticket = require("../models/Ticket");
const User = require("../models/User");

/*
|--------------------------------------------------------------------------
| Create Ticket
|--------------------------------------------------------------------------
*/
const createTicket = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      priority,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const ticket = await Ticket.create({
      title: title.trim(),
      description: description.trim(),
      category: category || "Other",
      priority: priority || "Medium",
      createdBy: req.user._id,
      attachment: req.file ? req.file.filename : "",
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get My Tickets
|--------------------------------------------------------------------------
*/
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({
      createdBy: req.user._id,
    })
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get All Tickets
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/
const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find()
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Single Ticket
|--------------------------------------------------------------------------
*/
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    /*
     * Regular users can only view their own tickets.
     * Admins can view all tickets.
     */
    if (
      req.user.role !== "admin" &&
      ticket.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this ticket",
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Ticket
|--------------------------------------------------------------------------
*/
const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    /*
     * Users can update only their own tickets.
     * Admins can update any ticket.
     */
    if (
      req.user.role !== "admin" &&
      ticket.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const {
      title,
      description,
      category,
      priority,
    } = req.body;

    if (title !== undefined) {
      ticket.title = title.trim();
    }

    if (description !== undefined) {
      ticket.description = description.trim();
    }

    if (category !== undefined) {
      ticket.category = category;
    }

    if (priority !== undefined) {
      ticket.priority = priority;
    }

    if (req.file) {
      ticket.attachment = req.file.filename;
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Update Ticket Status
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Completed",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket status",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Assign Ticket
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/
const assignTicket = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Assigned user ID is required",
      });
    }

    /*
     * Check whether the selected user exists.
     */
    const user = await User.findById(assignedTo);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Assigned user not found",
      });
    }

    /*
     * Find ticket.
     */
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    /*
     * Assign ticket.
     */
    ticket.assignedTo = assignedTo;

    await ticket.save();

    /*
     * Return populated ticket.
     */
    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Delete Ticket
|--------------------------------------------------------------------------
*/
const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    /*
     * Users can delete only their own tickets.
     * Admins can delete any ticket.
     */
    if (
      req.user.role !== "admin" &&
      ticket.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await ticket.deleteOne();

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  deleteTicket,
};