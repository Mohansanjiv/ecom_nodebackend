// userController.js
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const User = require('../models/userModel')
const sendToken = require('../utils/JwtToken')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

// Register user
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body

  const user = new User({
    name,
    email,
    password,
    avatar: {
      public_id: 'this is a sample id',
      url: 'profilepicUrl'
    }
  })
  await user.save()
  sendToken(user, 201, res)
})

//login user
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body

  // checking if user has given password and email both
  if (!email || !password) {
    return next(new ErrorHandler('Please Enter Email & Password', 400))
  }

  const user = await User.findOne({ email }).select('password')

  if (!user) {
    return next(new ErrorHandler('invalid email or password', 401))
  }

  const isPasswordMatched = user.comparePassword(password)

  if (!isPasswordMatched) {
    return next(new ErrorHandler('invalid email or password', 401))
  }
  sendToken(user, 200, res)
})

//logout  user

exports.logout = catchAsyncError(async (req, res, next) => {
  if (!req.cookies || !req.cookies.token) {
    return next(new ErrorHandler('No token found in cookies', 401))
  }

  // Clear the 'token' cookie
  res.clearCookie('token')

  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true
  })

  res.status(200).json({
    success: true,
    message: 'Logout'
  })
})

///forgot password

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email})

  // Check if the user is not found
  if (!user) {
    return next(new ErrorHandler('User not found', 404))
  }

  // Get ResetPassword Token

  const resetToken = user.getResetPasswordToken()

  await user.save({ ValidateBeforeSave: false })

  const resetPasswordUrl = `${req.body.protocol}://${req.get(
    'host'
  )}/api/v1/password/reset/${resetToken}`

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n 
    if you have not requested this email then, please ignore it `

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message
    })

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`
    })
  } catch (error) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save({ ValidateBeforeSave: false })

    return next(new ErrorHandler(error.message, 500))
  }
})

///reset password

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  })

  if (!user) {
    return next(
      new ErrorHandler(
        'reset Password Token is invalid or has been expired ',
        400
      )
    )
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not match'))
  }
  user.password =req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;


  await user.save();

  sendToken(user,200,res);
});

//get user details

exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  console.log('User Object:', req.user); // Add this line to log the user object
  const user = await User.findById(req.user.id);

  res.status(200).json({
      success: true,
      user,
  });
});


//update user password 

exports.updatePassword =catchAsyncError(async(req,res,next)=>{

  const user = await User.findById(req.user.id).select("+password");

  console.log("hello update :"+user.id);

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
      return next(new ErrorHandler("Old password is incorrect",400));
  }

  if(req.body.newPassword !== req.body.confirmPassword){

    return next(new ErrorHandler("password does not match",400));
  }

  await user.save();
  sendToken(user,200,res)
})


//update user Profile
exports.updateProfile =catchAsyncError(async(req,res,next)=>{

   const newUserData ={
    name:req.body.name,
    email:req.body.email,
   };

   // we will add cloudinary later

   const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false,
   });

   res.status(200).json({
    success:true,
   });


  sendToken(user,200,res)
})


// get all users  ( Admin can see no of registered users)

exports.getAllUsers =catchAsyncError(async(req,res,next)=>{
  const users = await User.find();

  res.status(200).json({
    success:true,
    users,
  });
});

// get single user ( Admin can see the users details)
exports.getSingleUser =catchAsyncError(async(req,res,next)=>{

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User does not exist with Id : ${req.params.id}`))
  }
  
  res.status(200).json({
    success:true,
    user,
  });
});


//update user Profile
exports.updateProfile =catchAsyncError(async(req,res,next)=>{

  const newUserData ={
   name:req.body.name,
   email:req.body.email,
  };

  // we will add cloudinary later

  const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
   new:true,
   runValidators:true,
   useFindAndModify:false,
  });

  res.status(200).json({
   success:true,
  });


 sendToken(user,200,res)
})

//update user role-admin
exports.updateUserRole =catchAsyncError(async(req,res,next)=>{

  const newUserData ={
   name:req.body.name,
   email:req.body.email,
   role:req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData,{
   new:true,
   runValidators:true,
   useFindAndModify:false,
  });

  res.status(200).json({
   success:true,
  });


 sendToken(user,200,res)
})

// Delete user - admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`));
  }

  // Remove the user
  await User.deleteOne({ _id: req.params.id });

  // Send a response indicating success
  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});


