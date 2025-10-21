const Modifier = require('../models/modifierModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getAllModifiers = factory.getAll(Modifier);
exports.getModifier = factory.getOne(Modifier);
exports.createModifier = factory.createOne(Modifier);
exports.updateModifier = factory.updateOne(Modifier);
exports.deleteModifier = factory.deleteOne(Modifier);

// Get all modifiers for a specific restaurant
exports.getRestaurantModifiers = catchAsync(async (req, res, next) => {
  const modifiers = await Modifier.find({ restaurant: req.params.restaurantId });

  res.status(200).json({
    status: 'success',
    results: modifiers.length,
    data: {
      modifiers
    }
  });
});

// Get all modifiers by type for a specific restaurant
exports.getModifiersByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  const { restaurantId } = req.params;

  if (!['extra', 'ingredient', 'size'].includes(type)) {
    return next(new AppError('Invalid modifier type', 400));
  }

  const modifiers = await Modifier.find({
    restaurant: restaurantId,
    type: type
  });

  res.status(200).json({
    status: 'success',
    results: modifiers.length,
    data: {
      modifiers
    }
  });
});