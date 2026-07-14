const express = require('express');
const router = express.Router();
const { getTasksByProject, createTask, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// All task routes require authentication
router.use(authMiddleware);

router.get('/project/:projectId', getTasksByProject);
router.post('/', createTask);
router.put('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

module.exports = router;
