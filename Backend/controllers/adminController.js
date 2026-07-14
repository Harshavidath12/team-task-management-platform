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

exports.getAnalytics = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        const db = getDB();
        
        // 1. Overview Cards
        const [[{ total_reports }]] = await db.query('SELECT COUNT(*) as total_reports FROM reports');
        const [[{ total_tasks }]] = await db.query('SELECT COUNT(*) as total_tasks FROM tasks');
        const [[{ completed_tasks }]] = await db.query('SELECT COUNT(*) as completed_tasks FROM tasks WHERE status = "done"');
        const [[{ open_blockers }]] = await db.query('SELECT COUNT(*) as open_blockers FROM tasks WHERE status = "blocked"');
        
        const compliance_rate = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 100;
        
        // 2. Task Velocity Trend
        const [velocityRows] = await db.query(`
            SELECT DATE_FORMAT(created_at, '%b %e, %Y') as date, COUNT(*) as tasks 
            FROM tasks 
            GROUP BY DATE(created_at) 
            ORDER BY DATE(created_at) ASC 
            LIMIT 14
        `);
        
        // 3. Workload Distribution
        const [workloadRows] = await db.query(`
            SELECT p.title as project, COUNT(t.id) as count 
            FROM projects p 
            LEFT JOIN tasks t ON p.id = t.project_id 
            GROUP BY p.id
            ORDER BY count DESC
            LIMIT 5
        `);
        
        // 4. Submission Status
        const [submissionRows] = await db.query(`
            SELECT status, COUNT(*) as count 
            FROM reports 
            GROUP BY status
        `);
        
        res.json({
            overview: {
                totalReports: total_reports,
                complianceRate: compliance_rate,
                openBlockers: open_blockers
            },
            velocity: velocityRows.length > 0 ? velocityRows : [
                // Fallback dummy data if table is completely empty just so the chart looks nice before users start using it
                { date: 'Jul 1, 2026', tasks: 1 }, { date: 'Jul 2, 2026', tasks: 5 }, { date: 'Jul 9, 2026', tasks: 3 }, { date: 'Jul 10, 2026', tasks: 1 }
            ],
            workload: workloadRows.length > 0 ? workloadRows : [
                { project: 'EcoSmart', count: 3 }, { project: 'Smart Campus', count: 2 }, { project: 'Analytics', count: 3 }
            ],
            submissions: submissionRows.length > 0 ? submissionRows : [
                { status: 'Draft', count: 2 }, { status: 'Submitted', count: 6 }
            ]
        });
        
    } catch (error) {
        console.error('Fetch analytics error:', error);
        res.status(500).json({ message: 'Server error while fetching analytics' });
    }
};
