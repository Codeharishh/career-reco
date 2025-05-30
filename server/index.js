const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Log to confirm environment variable is loaded
console.log('✅ Loaded OpenRouter key:', !!process.env.OPENROUTER_API_KEY);

// ✅ OpenRouter client setup
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://ai-career-recommender-git-main-sriharish-ss-projects.vercel.app', // 🔁 Your live frontend
    'X-Title': 'AI Career Recommender'
  }
});

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

    const recommendation = chatCompletion.choices[0]?.message?.content || 'No recommendation found.';
    console.log('✅ Recommendation generated.');
    res.json({ recommendation });

  } catch (error) {
    console.error('🔴 OpenRouter Error:', error);

    if (error.response) {
      console.error('🔸 Status:', error.response.status);
      console.error('🔸 Data:', error.response.data);
    }

    res.status(error.response?.status || 500).json({
      error: 'OpenRouter request failed',
      detail: error.response?.data?.error || error.message
    });
  }
});

// ✅ Start server using Render's dynamic port
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
