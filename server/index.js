const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ OpenRouter client setup
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://ai-career-recommender-git-main-sriharish-ss-projects.vercel.app', // ✅ replace with your live frontend URL
    'X-Title': 'AI Career Recommender'
  }
});

console.log('✅ Loaded OpenRouter key:', process.env.OPENROUTER_API_KEY ? 'Yes' : 'No');

app.post('/api/recommend', async (req, res) => {
  const userInput = req.body.input;
  console.log('📨 Received input:', userInput);

  if (!userInput) {
    return res.status(400).json({ error: 'Missing input' });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a career counselor.' },
        { role: 'user', content: `Suggest suitable career paths and a roadmap for this person: ${userInput}` }
      ],
      max_tokens: 400
    });

    const recommendation = chatCompletion.choices[0].message.content;
    console.log('✅ Recommendation generated.');
    res.json({ recommendation });
  } catch (error) {
    console.error('🔴 OpenRouter Error:', error);

    const status = error.response?.status || 500;
    const detail = error.response?.data?.error || error.message;

    res.status(status).json({
      error: 'OpenRouter request failed',
      detail
    });
  }
});

// ✅ Required for Render
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
