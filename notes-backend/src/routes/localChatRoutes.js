const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant for a personal notes app.',
      },
      ...history.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama3.2', // or the model name you pulled
      messages,
      stream: false,
    });

    const reply =
      response.data?.message?.content ||
      'Sorry, I could not generate a response.';

    res.json({ reply });
  } catch (err) {
    console.error(
      'Local LLM chat error:',
      err.response?.data || err.message || err
    );
    res
      .status(500)
      .json({ error: 'Local LLM chat failed. Is Ollama running?' });
  }
});

module.exports = router;
