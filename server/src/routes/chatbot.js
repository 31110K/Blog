import express from 'express';
import Post from '../models/post.js';
import{ protectRoute } from '../middlewares/auth_middleware.js' 
import mongoose from 'mongoose';
import child_process from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const chatbot_router = express.Router();


// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const llmCliPath = path.resolve(__dirname, '../lib/llm_cli.py');

function runPythonLLM(prompt) {
    return new Promise((resolve, reject) => {
        const py = child_process.execFile('python', [llmCliPath, prompt], { env: process.env, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
            console.log('[DEBUG] Python LLM process finished, parsing output');
            if (err) {
                console.error('LLM process execution error:', err, stderr && stderr.toString());
                return reject(new Error('LLM process execution error'));
            }
            const out = stdout ? stdout.toString().trim() : '';
            if (!out) {
                const serr = stderr ? stderr.toString().trim() : '';
                console.error('LLM produced no stdout, stderr:', serr);
                return reject(new Error(serr || 'Empty LLM response'));
            }
            try {
                const data = JSON.parse(out);
                if (data && data.success === false) {
                    console.error('LLM returned error payload:', data.error || data);
                    return reject(new Error(data.error || 'LLM returned failure'));
                }
                return resolve(data.reply ?? '');
            } catch (e) {
                // If output is not JSON, use raw text as fallback
                console.warn('LLM stdout not JSON, using raw stdout');
                return resolve(out);
            }
        });
    });
}


chatbot_router.get('/chat', protectRoute, async (req, res) => {
    try {
        const user = req.user;
        console.log('[DEBUG] GET /chat called by user:', user && user._id);
        res.status(200).json({ success: true, message: `Hello, ${user.name}! How can I assist you today?` });
    } catch (error) {
        console.error("Chatbot error:", error);
        return res.status(500).json({ success: false, message: "Server error in chatbot." });
    }
});

chatbot_router.post('/chat', protectRoute, async (req, res) => {
    try {
        console.log('[DEBUG] POST /chat body:', req.body);
        const { message } = req.body;
        // Call Python LLM CLI
        const reply = await runPythonLLM(message || "");
        return res.status(200).json({ success: true, reply, createdAt: new Date().toISOString() });
    } catch (error) {
        console.error("Chatbot error:", error && error.message ? error.message : error);
        return res.status(500).json({ success: false, message: `Chatbot error: ${error.message || String(error)}` });

    }
});

// Also accept POST to the router root so clients can call /api/chatbot with { prompt } or { message }
chatbot_router.post('/', protectRoute, async (req, res) => {
    try {
        const prompt = req.body.prompt ?? req.body.message ?? "";
        console.log('[DEBUG] POST / (chatbot) body:', req.body);
        if (!prompt || String(prompt).trim() === '') {
            return res.status(400).json({ success: false, message: 'Empty prompt' });
        }
        const reply = await runPythonLLM(prompt);
        return res.status(200).json({ success: true, reply, createdAt: new Date().toISOString() });
    } catch (error) {
        console.error("Chatbot error:", error && error.message ? error.message : error);
        return res.status(500).json({ success: false, message: `Chatbot error: ${error.message || String(error)}` });
    }
});

// --- Debug endpoints (no auth) ---
chatbot_router.get('/health', async (req, res) => {
    console.log('[DEBUG] GET /api/chatbot/health');
    return res.status(200).json({ success: true, message: 'chatbot route healthy', time: new Date().toISOString() });
});

chatbot_router.post('/test', async (req, res) => {
    console.log('[DEBUG] POST /api/chatbot/test body:', req.body);
    return res.status(200).json({ success: true, received: req.body, headers: req.headers });
});


export default chatbot_router;