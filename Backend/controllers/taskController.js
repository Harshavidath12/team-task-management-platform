const { getDB } = require('../config/db');

// Get all tasks for a specific project
exports.getTasksByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const db = getDB();
        
        // We will join with users to get the assignee and creator names
        const query = `
            SELECT t.*, 
                   u1.name as assigned_to_name,
                   u2.name as created_by_name
            FROM tasks t
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.created_by = u2.id
            WHERE t.project_id = ?
            ORDER BY t.created_at DESC
        `;
        const [tasks] = await db.query(query, [projectId]);
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new task
exports.createTask = async (req, res) => {
    try {
        // Only Project Managers can create tasks
        if (req.user.role !== 'project_manager') {
            return res.status(403).json({ message: 'Access denied. Only Project Managers can create tasks.' });
        }

        const { project_id, title, description, assigned_to, due_date } = req.body;

        if (!project_id || !title) {
            return res.status(400).json({ message: 'Project ID and title are required' });
        }

        const db = getDB();
        
        // Verify that the project actually belongs to this Project Manager
        const [projectCheck] = await db.query('SELECT manager_id FROM projects WHERE id = ?', [project_id]);
        if (projectCheck.length === 0 || projectCheck[0].manager_id !== req.user.id) {
            return res.status(403).json({ message: 'You are not assigned as the manager for this project.' });
        }

        const [result] = await db.query(
            'INSERT INTO tasks (project_id, title, description, assigned_to, created_by, due_date) VALUES (?, ?, ?, ?, ?, ?)',
            [project_id, title, description || '', assigned_to || null, req.user.id, due_date || null]
        );

        res.status(201).json({ message: 'Task created successfully', taskId: result.insertId });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['to_do', 'in_progress', 'review', 'done'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const db = getDB();
        
        // Verify task exists and get details
        const [taskCheck] = await db.query('SELECT project_id, assigned_to, created_by FROM tasks WHERE id = ?', [id]);
        if (taskCheck.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        const task = taskCheck[0];

        // Authorization: 
        // 1. PMs can update any task in their projects (checked via project manager_id)
        // 2. TMs can only update tasks assigned to them
        if (req.user.role === 'team_member' && task.assigned_to !== req.user.id) {
            return res.status(403).json({ message: 'You can only update tasks assigned to you.' });
        }
        if (req.user.role === 'project_manager') {
            const [projectCheck] = await db.query('SELECT manager_id FROM projects WHERE id = ?', [task.project_id]);
            if (projectCheck.length === 0 || projectCheck[0].manager_id !== req.user.id) {
                return res.status(403).json({ message: 'You do not have permission to update tasks in this project.' });
            }
        }

        const [result] = await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
        res.status(200).json({ message: 'Task status updated successfully' });
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        // Only Project Managers can delete tasks
        if (req.user.role !== 'project_manager') {
            return res.status(403).json({ message: 'Access denied. Only Project Managers can delete tasks.' });
        }

        const { id } = req.params;
        const db = getDB();

        // Verify that the task belongs to a project managed by this PM
        const [taskCheck] = await db.query('SELECT project_id FROM tasks WHERE id = ?', [id]);
        if (taskCheck.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        const [projectCheck] = await db.query('SELECT manager_id FROM projects WHERE id = ?', [taskCheck[0].project_id]);
        if (projectCheck.length === 0 || projectCheck[0].manager_id !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to delete tasks in this project.' });
        }

        const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
