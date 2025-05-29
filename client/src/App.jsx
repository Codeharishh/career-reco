import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

function App() {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [history, setHistory] = useState([]);

  const api = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
    const savedHistory = JSON.parse(localStorage.getItem('history')) || [];
    setHistory(savedHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (recommendation && input) {
      const newItem = { input, category, recommendation };
      const updatedHistory = [...history, newItem];
      setHistory(updatedHistory);
      localStorage.setItem('history', JSON.stringify(updatedHistory));
    }
  }, [recommendation]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setRecommendation('');

    const fullPrompt = category
      ? `${input}. Focus on career paths in the ${category} field.`
      : input;

    try {
      const res = await axios.post(`${api}/api/recommend`, {
        input: fullPrompt
      });
      setRecommendation(res.data.recommendation);
    } catch (error) {
      setRecommendation('Error fetching recommendation.');
    }
    setLoading(false);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const exportToPDF = () => {
    const element = document.getElementById('recommendation-output');
    html2pdf()
      .set({
        margin: 0.5,
        filename: 'career_recommendation.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      })
      .from(element)
      .save();
  };

  const exportToText = () => {
    const blob = new Blob([recommendation], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'career_recommendation.txt';
    link.click();
  };

  return (
    <div className={`app-container ${theme}`}>
      <div className="glass-box p-4 rounded-4 shadow-lg text-light">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">AI Career Recommender</h3>
          <button className="btn btn-sm btn-outline-light" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>

        <select
          className="form-select mb-3"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select a Category (Optional)</option>
          <option value="technology">Technology</option>
          <option value="creative">Creative</option>
          <option value="healthcare">Healthcare</option>
          <option value="business">Business</option>
          <option value="education">Education</option>
        </select>

        <textarea
          className="form-control mb-3 animated-textarea"
          rows="3"
          placeholder="Enter your skills, interests, or goals..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button className="btn glow-button w-100 mb-4" onClick={handleSubmit}>
          {loading ? 'Thinking...' : '🎯 Get Recommendation'}
        </button>

        {recommendation && (
          <div className="result-box p-3 rounded-3" id="recommendation-output">
            <strong>Recommendation:</strong>
            <p className="mt-2">{recommendation}</p>
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-sm btn-outline-light" onClick={exportToPDF}>Export to PDF</button>
              <button className="btn btn-sm btn-outline-light" onClick={exportToText}>Export to .txt</button>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-4">
            <h5 className="text-light">Previous Queries</h5>
            {history.slice().reverse().map((item, i) => (
              <div key={i} className="result-box p-2 rounded-3 mb-2 small">
                <div><strong>Input:</strong> {item.input}</div>
                <div><strong>Category:</strong> {item.category || 'N/A'}</div>
                <div><strong>Output:</strong> {item.recommendation}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
