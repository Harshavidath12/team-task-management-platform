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
            // Ignore error if column already exists (ER_DUP_FIELDNAME)
            if (err.code !== 'ER_DUP_FIELDNAME') {
                console.warn('Could not alter users table:', err.message);
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
