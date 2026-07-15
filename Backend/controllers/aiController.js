const { getDB } = require('../config/db');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
        const systemInstruction = `You are an intelligent AI assistant built directly into the Team Task Management Platform for the System Administrator.
Your goal is to answer questions about the team's activity, completed work, blockers, and workload imbalances based on the latest data.
Be concise, helpful, and conversational. Do not expose raw IDs unnecessarily; map them to names when possible.

Current Platform Data:
USERS: ${JSON.stringify(users)}
PROJECTS: ${JSON.stringify(projects)}
TASKS: ${JSON.stringify(tasks)}
RECENT REPORTS: ${JSON.stringify(reports)}

If the user asks something outside the scope of this data, politely inform them you only have access to the platform's team activity.`;

        // 3. Format history for Groq (OpenAI-compatible format)
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }));

        // 4. Call the Groq API (llama-3.3-70b is free and very fast)
        const chatCompletion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemInstruction },
                ...formattedHistory,
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 1024
        });

        const reply = chatCompletion.choices[0]?.message?.content || 'No response generated.';
        res.status(200).json({ reply });

    } catch (error) {
        console.error('Error in AI Chat:', error);

        let errorMessage = 'Internal server error while processing AI request.';
        if (error.message && error.message.includes('quota')) {
            errorMessage = 'The AI service is currently rate limited. Please try again in a moment.';
        } else if (error.message && error.message.includes('401')) {
            errorMessage = 'Invalid API key. Please check the GROQ_API_KEY in the .env file.';
        }

        res.status(500).json({ message: errorMessage });
    }
};
