const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// Only admins can access the AI chatbot
router.post('/chat', authMiddleware, (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required for AI features.' });
    }
    next();
}, aiController.chatWithAI);

module.exports = router;
