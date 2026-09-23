const Ticket = require("../models/Ticket");

// Create a new ticket
const createTicket = async ({
  title,
  description,
  category,
  priority,
  createdBy,
  attachment = "",
}) => {
  const ticket = await Ticket.create({
    title,
    description,
    category,
    priority,
    createdBy,
    attachment,
  });

  return ticket;
};

// Get tickets created by a user
const getMyTickets = async (userId) => {
  const tickets = await Ticket.find({
    createdBy: userId,
  })
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

  return tickets;
};

// Get all tickets
const getAllTickets = async () => {
  const tickets = await Ticket.find()
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

  return tickets;
};

// Get ticket by ID
const getTicketById = async (ticketId) => {
  const ticket = await Ticket.findById(ticketId)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  return ticket;
};

// Update ticket
const updateTicket = async (ticketId, updateData) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined) {
      ticket[key] = updateData[key];
    }
  });

  await ticket.save();

  return ticket;
};

// Update ticket status
const updateTicketStatus = async (ticketId, status) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  ticket.status = status;

  await ticket.save();

  return ticket;
};

// Assign ticket to a user
const assignTicket = async (ticketId, assignedTo) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  ticket.assignedTo = assignedTo;

  await ticket.save();

  return ticket;
};

// Delete ticket
const deleteTicket = async (ticketId) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  await ticket.deleteOne();

  return ticket;
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
