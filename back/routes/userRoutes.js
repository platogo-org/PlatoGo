// Import required modules and controllers
const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const usersRouter = express.Router();

// Public routes for authentication and password management
usersRouter.post("/signup", authController.signup);
usersRouter.post("/login", authController.login);
usersRouter.get("/logout", authController.logout);

usersRouter.post("/forgotPassword", authController.forgotPassword);
usersRouter.patch("/resetPassword/:token", authController.resetPassword);

// Protect all routes after this middleware (require authentication)
usersRouter.use(authController.protect);

// Authenticated user routes
usersRouter.patch("/updateMyPassword", authController.updatePassword);
usersRouter.get("/me", userController.getMe, userController.getUser);
usersRouter.patch(
  "/updateme",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
usersRouter.delete("/deleteMe", userController.deleteMe);

// Only super-admin can access the following user management routes
usersRouter.use(authController.ensureSuperAdmin);

// Admin routes for managing users
usersRouter
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
usersRouter
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// Export users router
module.exports = usersRouter;
