const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const token = req.cookies['token'];

    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);

    next();
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log('User Role:', req.user.role); // Add this line for debugging
        console.log('Required Roles:', roles); // Add this line for debugging

        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`, 403));
        }
        next();
    };
};

