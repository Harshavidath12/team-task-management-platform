const { getDB } = require('../config/db');

// Get all reports for projects managed by the PM
exports.getReports = async (req, res) => {
    try {
        const db = getDB();
        let query = `
            SELECT r.*, 
                   u.name as submitter_name,
                   p.title as project_title
            FROM reports r
            JOIN users u ON r.user_id = u.id
            JOIN projects p ON r.project_id = p.id
        `;
        let queryParams = [];

        if (req.user.role === 'project_manager') {
            query += ' WHERE p.manager_id = ?';
            queryParams.push(req.user.id);
        } else if (req.user.role === 'team_member') {
            query += ' WHERE r.user_id = ?';
            queryParams.push(req.user.id);
        }

        query += ' ORDER BY r.created_at DESC';

        const [reports] = await db.query(query, queryParams);
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new report (for Team Members)
exports.createReport = async (req, res) => {
    try {
        if (req.user.role !== 'team_member') {
            return res.status(403).json({ message: 'Only team members can submit reports' });
        }

        const { project_id, date_range, status, tasks_completed, tasks_planned, blockers, hours_worked } = req.body;
        
        if (!project_id || !date_range || hours_worked === undefined || hours_worked === null) {
            return res.status(400).json({ message: 'Missing required fields. Hours worked is required.' });
        }

        const db = getDB();
        const completedJson = tasks_completed ? JSON.stringify(tasks_completed) : '[]';
        const plannedJson = tasks_planned ? JSON.stringify(tasks_planned) : '[]';

        const [result] = await db.query(
            'INSERT INTO reports (project_id, user_id, date_range, status, tasks_completed, tasks_planned, blockers, hours_worked) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [project_id, req.user.id, date_range, status || 'Draft', completedJson, plannedJson, blockers || '', parseInt(hours_worked) || 0]
        );

        res.status(201).json({ message: 'Report created successfully', reportId: result.insertId });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update an existing draft report (for Team Members)
exports.updateReport = async (req, res) => {
    try {
        if (req.user.role !== 'team_member') {
            return res.status(403).json({ message: 'Only team members can update reports' });
        }

        const { id } = req.params;
        const { project_id, date_range, status, tasks_completed, tasks_planned, blockers, hours_worked } = req.body;

        if (!project_id || !date_range || hours_worked === undefined || hours_worked === null) {
            return res.status(400).json({ message: 'Missing required fields. Hours worked is required.' });
        }

        const db = getDB();

        // Check if report exists, belongs to user, and is a Draft
        const [reportCheck] = await db.query('SELECT status, user_id FROM reports WHERE id = ?', [id]);
        
        if (reportCheck.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        if (reportCheck[0].user_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied. You can only update your own reports.' });
        }
        
        if (reportCheck[0].status === 'Submitted') {
            return res.status(400).json({ message: 'Cannot edit a report that has already been submitted.' });
        }

        const completedJson = tasks_completed ? JSON.stringify(tasks_completed) : '[]';
        const plannedJson = tasks_planned ? JSON.stringify(tasks_planned) : '[]';

        await db.query(
            'UPDATE reports SET project_id = ?, date_range = ?, status = ?, tasks_completed = ?, tasks_planned = ?, blockers = ?, hours_worked = ? WHERE id = ?',
            [project_id, date_range, status || 'Draft', completedJson, plannedJson, blockers || '', parseInt(hours_worked) || 0, id]
        );

        res.status(200).json({ message: 'Report updated successfully' });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
