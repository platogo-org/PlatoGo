const express = require('express');
const viewRouter = express.Router();
const authController = require('../controllers/authController');

// Super admin dashboard
viewRouter.get('/super-admin/dashboard', authController.protect, (req, res, next) => {
	if (req.user.role !== 'super-admin') return next(new Error('Forbidden'));
	res.status(200).render('superAdminDashboard');
});

// Restaurant admin dashboard
viewRouter.get('/restaurant/dashboard', authController.protect, (req, res, next) => {
	if (req.user.role !== 'restaurant-admin') return next(new Error('Forbidden'));
	res.status(200).render('restaurantAdminDashboard');
});

module.exports = viewRouter;

