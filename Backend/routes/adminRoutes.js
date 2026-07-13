const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { approveUser } = require('../controllers/adminController');

// All admin routes should be protected by authMiddleware
router.use(authMiddleware);

// POST /api/admin/approve/:id
router.post('/approve/:id', approveUser);

module.exports = router;
