const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, reportController.getReports);
router.post('/', authMiddleware, reportController.createReport);
router.put('/:id', authMiddleware, reportController.updateReport);

module.exports = router;
