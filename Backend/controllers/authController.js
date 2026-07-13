const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const db = getDB();

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const requestedRole = role || 'team_member';

        // Auto-approve the first admin to bootstrap the system
        let isApproved = false;
        if (requestedRole === 'admin') {
            const [adminRows] = await db.query('SELECT id FROM users WHERE role = ?', ['admin']);
            if (adminRows.length === 0) {
                isApproved = true;
            } else {
                return res.status(403).json({ message: 'An admin already exists. Only one admin is allowed.' });
            }
        }

        // Check if user already exists
        const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role, is_approved) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, requestedRole, isApproved]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = getDB();

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check approval status
        if (!user.is_approved) {
            return res.status(403).json({ message: 'Your account is pending admin approval' });
        }

        // Generate JWT
        const payload = {
            id: user.id,
            role: user.role,
            name: user.name
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
