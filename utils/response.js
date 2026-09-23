exports.successResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({ success: true, message, data });
};

exports.errorResponse = (res, statusCode, message) => {
  res.status(statusCode).json({ success: false, message });
};
