const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

let pool;

const initDB = async () => {
    try {
        // Initial connection to create the database if it doesn't exist
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        console.log(`Database '${process.env.DB_NAME}' checked/created successfully.`);
        await connection.end();

        // Connect to the specific database
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Create users table
        const createUsersTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'project_manager', 'team_member') DEFAULT 'team_member',
                is_approved BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(createUsersTableQuery);

        // Safely add the column if it doesn't already exist in older databases
        try {
            await pool.query('ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;');
        } catch (err) {
            if (err.code !== 'ER_DUP_FIELDNAME') {
                console.warn('Could not alter users table:', err.message);
            }
        }

        // Create projects table
        const createProjectsTableQuery = `
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status ENUM('planning', 'active', 'completed', 'on_hold') DEFAULT 'planning',
                start_date DATE,
                end_date DATE,
                manager_id INT,
                assigned_members JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(createProjectsTableQuery);

        // Safely add manager_id column if it doesn't exist
        try {
            await pool.query('ALTER TABLE projects ADD COLUMN manager_id INT;');
        } catch (err) {
            if (err.code !== 'ER_DUP_FIELDNAME') {
                console.warn('Could not alter projects table:', err.message);
            }
        }

        // Create tasks table
        const createTasksTableQuery = `
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status ENUM('to_do', 'in_progress', 'review', 'done') DEFAULT 'to_do',
                created_by INT NOT NULL,
                due_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
            );
        `;
        await pool.query(createTasksTableQuery);

        // Create reports table
        const createReportsTableQuery = `
            CREATE TABLE IF NOT EXISTS reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id INT NOT NULL,
                user_id INT NOT NULL,
                date_range VARCHAR(255) NOT NULL,
                status ENUM('Draft', 'Submitted') DEFAULT 'Draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `;
        await pool.query(createReportsTableQuery);

        // Safely add new structured report columns if they don't exist
        try {
            await pool.query('ALTER TABLE reports ADD COLUMN tasks_completed JSON;');
            await pool.query('ALTER TABLE reports ADD COLUMN tasks_planned JSON;');
            await pool.query('ALTER TABLE reports ADD COLUMN blockers TEXT;');
            await pool.query('ALTER TABLE reports ADD COLUMN hours_worked INT NOT NULL DEFAULT 0;');
        } catch (err) {
            if (err.code !== 'ER_DUP_FIELDNAME') {
                console.warn('Could not alter reports table:', err.message);
            }
        }

        // Seed Default Admin Account
        const adminEmail = 'admin123@gmail.com';
        const adminPass = 'Admin@123';
        const [adminRows] = await pool.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
        
        if (adminRows.length === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(adminPass, salt);
            
            await pool.query(
                'INSERT INTO users (name, email, password, role, is_approved) VALUES (?, ?, ?, ?, ?)',
                ['System Admin', adminEmail, hashedPass, 'admin', true]
            );
            console.log('Default admin account seeded successfully.');
        }

    } catch (error) {
        console.error("Database initialization failed:", error.message);
        process.exit(1);
    }
};

const getDB = () => {
    if (!pool) {
        throw new Error("Database pool is not initialized. Call initDB first.");
    }
    return pool;
};

module.exports = { initDB, getDB };
