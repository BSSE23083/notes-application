const express = require('express');
const Groq = require('groq-sdk');

const router = express.Router();

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  console.warn('GROQ_API_KEY is not set in .env.local');
}

const groq = new Groq({ apiKey: groqApiKey });

router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Convert your history format to Groq / OpenAI-style messages
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

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // good, fast free-tier model [web:371][web:377]
      messages,
      temperature: 0.7,
      max_tokens: 512,
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      'Sorry, I could not generate a response.';

    res.json({ reply });
  } catch (err) {
    const status = err.response?.status || err.status || 500;
    console.error(
      'Groq chat error:',
      err.response?.data || err.message || err
    );

    if (status === 429) {
      return res
        .status(429)
        .json({ error: 'Groq rate limit hit. Please wait and try again.' });
    }

    res.status(500).json({ error: 'Groq chat failed' });
  }
});

module.exports = router;
