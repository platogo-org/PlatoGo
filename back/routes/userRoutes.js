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

// Shift management routes (waiter actions)
usersRouter.post("/start-shift", userController.startShift);
usersRouter.post("/end-shift", userController.endShift);

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
// Protect create, update, and delete user operations
usersRouter
  .route("/")
  .get(authController.ensureSuperAdmin, userController.getAllUsers)
  .post(authController.ensureSuperAdmin, userController.createUser);
usersRouter
  .route("/:id")
  .get(authController.ensureSuperAdmin, userController.getUser)
  .patch(authController.ensureSuperAdmin, userController.updateUser)
  .delete(authController.ensureSuperAdmin, userController.deleteUser);

// Export users router
module.exports = usersRouter;
