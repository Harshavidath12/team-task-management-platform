# Team Task Management Platform

This is a full-stack web application built with **Next.js** (Frontend) and **Node.js/Express** (Backend), using **MySQL** for the database. It includes an AI-powered admin assistant powered by the Groq API (Llama 3.3 70B).

## Instructions for Examiner / Evaluation

This project is built to be "plug-and-play" to make evaluation as easy as possible. **You do not need to manually create the database or import any SQL files.** The backend will automatically handle the database creation, table migrations, and seeding of the default admin account.

### Prerequisites
1. **Node.js** installed on your machine.
2. **MySQL Server** running on default port `3306` (e.g., via XAMPP, WAMP, or standalone MySQL). 
   - By default, the project expects: Username: `root` | Password: *(blank)*.
   - *If your local MySQL server uses a different username or has a password, you will simply update this in the `.env` file in Step 1.*

### 1. Backend Setup

1. Open a terminal and navigate to the `Backend` folder:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment variables file:
   - Copy the `.env.example` file and rename it to `.env`
   - *(The default settings are already configured for a standard local MySQL setup).*
   - **For the AI Chat Assistant:** Replace `your_groq_api_key_here` with a free API key from [console.groq.com](https://console.groq.com) (sign up is free, no billing required). If no key is provided, the rest of the application works perfectly — only the AI chat feature will be unavailable.
4. Start the backend server:
   ```bash
   node server.js
   ```
> **Note:** Upon starting, the backend will automatically create the `project_dashboard_db` database, generate all required tables, and securely seed the default Admin account.

### 2. Frontend Setup

1. Open a new terminal and navigate to the `Frontend` folder:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### 3. Default Admin Credentials
To access the admin dashboard or approve new users, use the default seeded admin account on the Login page:

- **Email:** `admin123@gmail.com`
- **Password:** `Admin@123`