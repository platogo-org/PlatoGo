// Import required modules
const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// User fields: name, email, photo, password, passwordConfirm

// User roles definition
const ROLES = {
  SUPER_ADMIN: "super-admin",
  RESTAURANT_ADMIN: "restaurant-admin",
  USER: "user",
};

// User schema definition
const userShcema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"], // User must have a name
  },
  email: {
    type: String,
    required: [true, "A user must have a mail"], // User must have an email
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "The String must be a valid Email"], // Email validation
  },
  role: {
    type: String,
    enum: ["super-admin", "restaurant-admin"], // Allowed roles
    default: "restaurant-admin",
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "A password must have more or equal than 8 characters"], // Minimum length
    select: false, // Do not return password in queries
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      // This only works on CREATE AND SAVE!!!
      validator: function (el) {
        return el === this.password; // Password confirmation must match
      },
      message: "Passwords are not the same",
    },
  },
  passwordChangedAt: Date, // Date when password was changed
  passwordResetToken: String, // Token for password reset
  passwordResetExpires: Date, // Expiration for password reset token
  active: {
    type: Boolean,
    default: true,
    select: false, // Do not return 'active' in queries
  },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: "Restaurant", // Reference to Restaurant
    default: null,
  },
});

// Hash password before saving if it was modified
userShcema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12); // Hash password
  this.passwordConfirm = undefined; // Remove passwordConfirm field
  next();
});

// Set passwordChangedAt when password is updated
userShcema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Compare input password with hashed password
userShcema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if password was changed after JWT was issued
userShcema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

// Exclude inactive users from queries
userShcema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Generate password reset token and set expiration
userShcema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Create User model and export
const User = mongoose.model("User", userShcema);
module.exports = User;
module.exports.ROLES = ROLES;
