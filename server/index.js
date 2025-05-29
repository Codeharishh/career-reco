const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ OpenRouter client
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173', // or your frontend URL
    'X-Title': 'AI Career Recommender'
  }
});

console.log('✅ Loaded OpenRouter key:', process.env.OPENROUTER_API_KEY ? 'Yes' : 'No');

app.post('/api/recommend', async (req, res) => {
  const userInput = req.body.input;
  console.log('📨 Received input:', userInput);

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo', // change model if needed
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

    if (error.response) {
      console.error('🔸 Status:', error.response.status);
      console.error('🔸 Data:', error.response.data);
    } else {
      console.error('❌ No response from OpenRouter. Message:', error.message);
    }

    res.status(500).json({
      error: 'OpenRouter request failed',
      detail: error.message
    });
  }
});

app.listen(5000, () => {
  console.log('🚀 Server running at http://localhost:5000');
});
