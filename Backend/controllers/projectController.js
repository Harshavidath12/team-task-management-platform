const { getDB } = require('../config/db');

// Get all projects
exports.getProjects = async (req, res) => {
    try {
        const db = getDB();
        let query = 'SELECT * FROM projects ORDER BY created_at DESC';
        let queryParams = [];

        if (req.user.role === 'project_manager') {
            query = 'SELECT * FROM projects WHERE manager_id = ? ORDER BY created_at DESC';
            queryParams = [req.user.id];
        } else if (req.user.role === 'team_member') {
            query = 'SELECT * FROM projects WHERE JSON_CONTAINS(assigned_members, ?) ORDER BY created_at DESC';
            queryParams = [String(req.user.id)];
        }

        const [projects] = await db.query(query, queryParams);
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new project
exports.createProject = async (req, res) => {
    try {
        // Only project_manager can create projects
        if (req.user.role !== 'project_manager') {
            return res.status(403).json({ message: 'Access denied. Only Project Managers can create projects.' });
        }

        const { title, description, start_date, end_date, assigned_members } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Project title is required' });
        }

        const db = getDB();
        
        // assigned_members is expected to be an array of user IDs. 
        // MySQL JSON type handles JSON stringified arrays.
        const assignedMembersJson = assigned_members ? JSON.stringify(assigned_members) : '[]';

        const [result] = await db.query(
            'INSERT INTO projects (title, description, start_date, end_date, manager_id, assigned_members) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description || '', start_date || null, end_date || null, req.user.id, assignedMembersJson]
        );

        res.status(201).json({ message: 'Project created successfully', projectId: result.insertId });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a project's status
exports.updateProjectStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }

        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['planning', 'active', 'completed', 'on_hold'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const db = getDB();
        const [result] = await db.query('UPDATE projects SET status = ? WHERE id = ?', [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json({ message: 'Project status updated successfully' });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a project
exports.deleteProject = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can delete projects.' });
        }

        const { id } = req.params;
        const db = getDB();

        const [result] = await db.query('DELETE FROM projects WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Assign a project manager to a project
exports.assignProjectManager = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can reassign projects.' });
        }

        const { id } = req.params;
        const { manager_id } = req.body;

        const db = getDB();
        
        // Ensure the assigned user is actually a project_manager
        const [users] = await db.query('SELECT role FROM users WHERE id = ?', [manager_id]);
        if (users.length === 0 || users[0].role !== 'project_manager') {
            return res.status(400).json({ message: 'Invalid user or user is not a project manager.' });
        }

        const [result] = await db.query('UPDATE projects SET manager_id = ? WHERE id = ?', [manager_id, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json({ message: 'Project reassigned successfully' });
    } catch (error) {
        console.error('Error reassigning project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
