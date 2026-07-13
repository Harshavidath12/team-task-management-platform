const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProjectStatus, deleteProject, assignProjectManager } = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

// All project routes require authentication
router.use(authMiddleware);

router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id/status', updateProjectStatus);
router.put('/:id/manager', assignProjectManager);
router.delete('/:id', deleteProject);

module.exports = router;
