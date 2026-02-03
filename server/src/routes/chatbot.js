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
            if (err) {
                console.error('LLM process error:', err, stderr);
                return reject(err);
            }
            try {
                const data = JSON.parse(stdout);
                resolve(data.reply);
            } catch (e) {
                // fallback: return raw stdout
                resolve(stdout.toString().trim());
            }
        });
    });
}


chatbot_router.get('/chat', protectRoute, async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({ success: true, message: `Hello, ${user.name}! How can I assist you today?` });
    } catch (error) {
        console.error("Chatbot error:", error);
        return res.status(500).json({ success: false, message: "Server error in chatbot." });
    }
});

chatbot_router.post('/chat', protectRoute, async (req, res) => {
    try {
        const { message } = req.body;
        // Call Python LLM CLI
        const reply = await runPythonLLM(message || "");
        res.status(200).json({ success: true, reply, createdAt: new Date().toISOString() });
    } catch (error) {
        console.error("Chatbot error:", error);
        return res.status(500).json({ success: false, message: "Server error in chatbot." });

    }
});

// Also accept POST to the router root so clients can call /api/chatbot with { prompt } or { message }
chatbot_router.post('/', protectRoute, async (req, res) => {
    try {
        const prompt = req.body.prompt ?? req.body.message ?? "";
        console.log("Received prompt:", prompt);
        const reply = await runPythonLLM(prompt);
        return res.status(200).json({ success: true, reply, createdAt: new Date().toISOString() });
    } catch (error) {
        console.error("Chatbot error:", error);
        return res.status(500).json({ success: false, message: "Server error in chatbot." });
    }
});


export default chatbot_router;