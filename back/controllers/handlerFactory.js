// Import utility functions and error handler
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");

/**
 * Delete a document by ID
 * @param {Model} Model - Mongoose model
 */
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(204).send({
      status: "success",
      data: null,
    });
  });

/**
 * Update a document by ID
 * @param {Model} Model - Mongoose model
 */
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

/**
 * Create a new document
 * @param {Model} Model - Mongoose model
 */
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

/**
 * Get a document by ID, optionally populating references
 * @param {Model} Model - Mongoose model
 * @param {Object} populateOptions - Mongoose populate options
 */
exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

/**
 * Get all documents, with filtering, sorting, field limiting, and pagination
 * @param {Model} Model - Mongoose model
 */
exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    // To allow for nested GET reviews on tour (small hack :))
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    // Execute query with API features
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sorting()
      .limitingFields()
      .pagination();

    // const doc = await features.query.explain();
    const doc = await features.query;
    res.status(200).json({
      status: "success",
      // requestedAt: req.requestTime,
      result: doc.length,
      data: {
        data: doc,
      },
    });
  });
