const { getDB } = require('../config/db');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const db = getDB();
        
        // 1. Fetch Context Data (Users, Projects, Tasks, Reports)
        const [users] = await db.query('SELECT id, name, role, is_approved FROM users');
        const [projects] = await db.query('SELECT id, title, status, start_date, end_date FROM projects');
        const [tasks] = await db.query('SELECT id, project_id, title, status, due_date FROM tasks');
        const [reports] = await db.query('SELECT id, project_id, user_id, date_range, status, tasks_completed, tasks_planned, blockers, hours_worked FROM reports ORDER BY created_at DESC LIMIT 10');

        // 2. Build the System Instruction
        const systemInstruction = `
You are an intelligent AI assistant built directly into the Team Task Management Platform for the System Administrator.
Your goal is to answer questions about the team's activity, completed work, blockers, and workload imbalances based on the latest data.
Be concise, helpful, and conversational. Do not expose raw IDs unnecessarily; map them to names when possible.

Current Platform Data:
USERS: ${JSON.stringify(users)}
PROJECTS: ${JSON.stringify(projects)}
TASKS: ${JSON.stringify(tasks)}
RECENT REPORTS: ${JSON.stringify(reports)}

If the user asks something outside the scope of this data, politely inform them you only have access to the platform's team activity.
`;

        // 3. Format history for Gemini
        // Gemini expects role: 'user' | 'model' and parts: [{ text: string }]
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // 4. Call the Gemini 2.5 Flash model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                ...formattedHistory,
                { role: 'user', parts: [{ text: message }] }
            ],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7
            }
        });

        res.status(200).json({ reply: response.text });
    } catch (error) {
        console.error('Error in AI Chat:', error);
        res.status(500).json({ message: 'Internal server error while processing AI request.' });
    }
};
