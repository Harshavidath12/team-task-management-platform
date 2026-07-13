const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const { initDB } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Database
initDB();

const adminRoutes = require('./routes/adminRoutes');
const projectRoutes = require('./routes/projectRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
