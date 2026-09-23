const User = require("../models/User");
const Ticket = require("../models/Ticket");

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalRegularUsers,
      totalTickets,
      pendingTickets,
      inProgressTickets,
      completedTickets,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: "Pending" }),
      Ticket.countDocuments({ status: "In Progress" }),
      Ticket.countDocuments({ status: "Completed" }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalRegularUsers,
        totalTickets,
        pendingTickets,
        inProgressTickets,
        completedTickets,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
};
