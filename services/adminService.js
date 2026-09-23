const User = require("../models/User");
const Ticket = require("../models/Ticket");

// Get dashboard statistics
const getDashboardStats = async () => {
  const [
    totalUsers,
    totalAdmins,
    totalRegularUsers,
    totalTickets,
    pendingTickets,
    inProgressTickets,
    completedTickets,
    highPriorityTickets,
    mediumPriorityTickets,
    lowPriorityTickets,
  ] = await Promise.all([
    User.countDocuments(),

    User.countDocuments({
      role: "admin",
    }),

    User.countDocuments({
      role: "user",
    }),

    Ticket.countDocuments(),

    Ticket.countDocuments({
      status: "Pending",
    }),

    Ticket.countDocuments({
      status: "In Progress",
    }),

    Ticket.countDocuments({
      status: "Completed",
    }),

    Ticket.countDocuments({
      priority: "High",
    }),

    Ticket.countDocuments({
      priority: "Medium",
    }),

    Ticket.countDocuments({
      priority: "Low",
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      admins: totalAdmins,
      regularUsers: totalRegularUsers,
    },

    tickets: {
      total: totalTickets,
      pending: pendingTickets,
      inProgress: inProgressTickets,
      completed: completedTickets,
    },

    priorities: {
      high: highPriorityTickets,
      medium: mediumPriorityTickets,
      low: lowPriorityTickets,
    },
  };
};

// Get all users
const getAllUsers = async () => {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 });

  return users;
};

// Get user by ID
const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Update user
const updateUser = async (userId, updateData) => {
  const { name, role } = updateData;

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (name !== undefined) {
    user.name = name;
  }

  if (role !== undefined) {
    user.role = role;
  }

  await user.save();

  return await User.findById(user._id).select("-password");
};

// Delete user
const deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  await user.deleteOne();

  return user;
};

// Get recent users
const getRecentUsers = async (limit = 5) => {
  return await User.find()
    .select("-password")
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Get recent tickets
const getRecentTickets = async (limit = 5) => {
  return await Ticket.find()
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getRecentUsers,
  getRecentTickets,
};