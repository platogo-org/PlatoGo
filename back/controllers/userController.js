// Import required modules
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/appError");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");

// Configure multer to store uploaded files in memory
const multerStorage = multer.memoryStorage();

// Filter to allow only image uploads
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Middleware to handle single photo upload for user
exports.uploadUserPhoto = upload.single("photo");

// Middleware to resize uploaded user photo and save to disk
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

// Helper to filter allowed fields from an object
const filterObj = (obj, ...alowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (alowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'success',
//     result: users.length,
//     data: {
//       users,
//     },
//   });
// });

// Controller to get all users
exports.getAllUsers = factory.getAll(User);

// Middleware to set req.params.id to current user's id
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Controller to update current user's data (except password)
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  // Filter out unwanted field names
  const fillteredBody = filterObj(req.body, "name", "email");
  if (req.file) fillteredBody.photo = req.file.filename;
  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, fillteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      updatedUser,
    },
  });
});

// Controller to deactivate current user's account
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Controller to get a single user by ID
exports.getUser = factory.getOne(User);

// Controller to create a user (for super-admin)
exports.createUser = factory.createOne(User);

// Controller to update a user by ID (do NOT use for passwords)
exports.updateUser = factory.updateOne(User);

// Controller to delete a user by ID
exports.deleteUser = factory.deleteOne(User);
// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     messaje: 'This route is not yet defined',
//   });
// };

// Start a shift
exports.startShift = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.role !== "restaurant-waiter") {
    return next(new AppError("Only waiters can start a shift", 403));
  }

  if (user.shiftStart) {
    return next(new AppError("Shift already started", 400));
  }

  user.shiftStart = new Date();
  user.shiftEnd = null; // Ensure shiftEnd is reset
  user.passwordConfirm = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Shift started",
    data: user,
  });
});

// End a shift
exports.endShift = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.role !== "restaurant-waiter") {
    return next(new AppError("Only waiters can end a shift", 403));
  }

  if (!user.shiftStart) {
    return next(new AppError("No active shift to end", 400));
  }

  const shiftEnd = new Date();
  user.shiftEnd = shiftEnd;

  // Calculate duration in minutes
  const duration = Math.round((shiftEnd - user.shiftStart) / 60000);

  // Add shift info to shifts array
  user.shifts.push({
    date: user.shiftStart,
    start: user.shiftStart,
    end: shiftEnd,
    duration,
  });

  // Reset shiftStart and shiftEnd
  user.shiftStart = null;
  user.shiftEnd = null;
  user.passwordConfirm = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Shift ended",
    data: user,
  });
});
