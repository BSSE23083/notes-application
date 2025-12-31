const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set in .env.local');
}

const genAI = new GoogleGenerativeAI(apiKey);

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/chat hit, body =', req.body); // debug

    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash', // free/fast model
    });

    const contents = [
      {
        role: 'user',
        parts: [{ text: 'You are a helpful assistant for a personal notes app.' }],
      },
      ...history.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const result = await model.generateContent({ contents });
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error(
      'Gemini chat error:',
      err.response?.data || err.message || err
    );
    res.status(500).json({ error: 'Gemini chat failed' });
  }
});

module.exports = router;
