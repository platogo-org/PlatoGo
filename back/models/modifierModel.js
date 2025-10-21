const mongoose = require('mongoose');

const modifierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A modifier must have a name'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'A modifier must have a type'],
    enum: ['extra', 'ingredient', 'size'],
    default: 'extra'
  },
  description: {
    type: String,
    trim: true
  },
  priceAdjustment: {
    type: Number,
    required: [true, 'A modifier must have a price adjustment'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: [true, 'A modifier must belong to a restaurant']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
modifierSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Modifier = mongoose.model('Modifier', modifierSchema);

module.exports = Modifier;