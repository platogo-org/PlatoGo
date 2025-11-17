const express = require("express");
const modifierController = require("../controllers/modifierController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

// Routes restricted to restaurant admin and super admin
router.use(authController.restrictTo("restaurant-admin", "super-admin"));

router
  .route("/")
  .get(modifierController.getAllModifiers)
  .post(modifierController.createModifier);

router
  .route("/:id")
  .get(modifierController.getModifier)
  .patch(modifierController.updateModifier)
  .delete(modifierController.deleteModifier);

// Get modifiers by restaurant
router.get(
  "/restaurant/:restaurantId",
  modifierController.getRestaurantModifiers
);

// Get modifiers by type for a restaurant
router.get(
  "/restaurant/:restaurantId/type/:type",
  modifierController.getModifiersByType
);

module.exports = router;
