const { getDB } = require('../config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.approveUser = async (req, res) => {
    try {
        // Ensure requester is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const { id } = req.params;
        const db = getDB();

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        if (user.is_approved) {
            return res.status(400).json({ message: 'User is already approved' });
        }

        // Approve user
        await db.query('UPDATE users SET is_approved = true WHERE id = ?', [id]);

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Account Activated - ProjectPlatform',
            text: `Hello ${user.name},\n\nYour account on ProjectPlatform has been approved by the administrator. You can now log in and access your dashboard.\n\nBest,\nThe ProjectPlatform Team`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Failed to send approval email:', emailError);
            // We still return success for the approval even if email fails, 
            // but we can warn the admin.
            return res.status(200).json({ 
                message: 'User approved successfully, but failed to send notification email.' 
            });
        }

        res.json({ message: 'User approved successfully and notification email sent.' });

    } catch (error) {
        console.error('Approval error:', error);
        res.status(500).json({ message: 'Server error during user approval' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
            return res.status(403).json({ message: 'Access denied. Admins and Project Managers only.' });
        }
        
        const db = getDB();
        const [users] = await db.query('SELECT id, name, email, role, is_approved, created_at FROM users ORDER BY created_at DESC');
        
        res.json(users);
    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        const { id } = req.params;
        const { role } = req.body;
        
        if (!['admin', 'project_manager', 'team_member'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role provided' });
        }
        
        const db = getDB();
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        
        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ message: 'Server error while updating role' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        const { id } = req.params;
        const db = getDB();
        
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error while deleting user' });
    }
};
