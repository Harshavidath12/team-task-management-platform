const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { approveUser, getUsers, updateUserRole, deleteUser, getAnalytics, getAnalyticsFilters } = require('../controllers/adminController');
// All admin routes should be protected by authMiddleware
router.use(authMiddleware);

// GET /api/admin/analytics/filters
router.get('/analytics/filters', getAnalyticsFilters);

// GET /api/admin/analytics
router.get('/analytics', getAnalytics);

// POST /api/admin/approve/:id
router.post('/approve/:id', approveUser);

// GET /api/admin/users
router.get('/users', getUsers);

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', updateUserRole);

// DELETE /api/admin/users/:id
router.delete('/users/:id', deleteUser);

module.exports = router;
