const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

// require('dotenv').config();
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5001;

const Database = require('better-sqlite3');  
const db = new Database('./animations.db');

const multer = require('multer');
const upload = multer({
  dest: path.join(__dirname, 'public', 'videos') 
});

db.exec(`
  CREATE TABLE IF NOT EXISTS animations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file TEXT NOT NULL,
  course TEXT,
  topics TEXT,
  createdAt TEXT
);`);

// Seed placeholder data if database is empty
const existing = db.prepare('SELECT COUNT(*) AS count FROM animations').get();
if (existing.count === 0) {
  const seed = db.prepare(`
    INSERT INTO animations (title, description, file, course, topics, createdAt)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);

  const placeholders = [
    ["Derivatives 101", "An introduction to derivatives.", "/videos/sample1.mp4", "MATH 151", "Differentiation"],
    ["Chain Rule", "Explains the chain rule.", "/videos/sample2.mp4", "MATH 151", "Differentiation,Chain Rule"],
    ["Integration Basics", "Definite vs Indefinite Integrals", "/videos/sample3.mp4", "MATH 152", "Integration"],
    ["Matrix Multiplication", "Matrix operations with examples.", "/videos/sample4.mp4", "MATH 304", "Matrix Multiplication"],
    ["Limits and Continuity", "Understanding limits and continuity.", "/videos/sample5.mp4", "MATH 150", "Limits,Continuity"],
    ["Partial Derivatives", "Introduction to partial derivatives.", "/videos/sample6.mp4", "MATH 251", "Partial Derivatives"],
    ["Eigenvalues and Eigenvectors", "Explains eigenvalues and eigenvectors.", "/videos/sample7.mp4", "MATH 304", "Eigenvalues,Eigenvectors"],
    ["Taylor Series", "Introduction to Taylor series.", "/videos/sample8.mp4", "MATH 152", "Taylor Series"],
    ["Probability Basics", "Understanding basic probability.", "/videos/sample9.mp4", "STAT 101", "Probability"],
    ["Linear Transformations", "Explains linear transformations.", "/videos/sample10.mp4", "MATH 304", "Linear Algebra"],
    ["Gradient Descent", "Optimization using gradient descent.", "/videos/sample11.mp4", "MATH 251", "Optimization,Gradient Descent"],
    ["Fourier Series", "Introduction to Fourier series.", "/videos/sample12.mp4", "MATH 352", "Fourier Series"],
    ["Laplace Transforms", "Explains Laplace transforms.", "/videos/sample13.mp4", "MATH 353", "Laplace Transforms"],
    ["Set Theory Basics", "Introduction to set theory.", "/videos/sample14.mp4", "MATH 101", "Set Theory"],
    ["Complex Numbers", "Understanding complex numbers.", "/videos/sample15.mp4", "MATH 201", "Complex Numbers"],
    ["Vector Calculus", "Basics of vector calculus.", "/videos/sample16.mp4", "MATH 251", "Vector Calculus"],
    ["Probability Distributions", "Explains probability distributions.", "/videos/sample17.mp4", "STAT 201", "Probability,Distributions"],
    ["Differential Equations", "Introduction to differential equations.", "/videos/sample18.mp4", "MATH 252", "Differential Equations"],
    ["Numerical Methods", "Basics of numerical methods.", "/videos/sample19.mp4", "MATH 301", "Numerical Methods"],
    ["Statistics Fundamentals", "Understanding basic statistics.", "/videos/sample20.mp4", "STAT 101", "Statistics"],
    ["Optimization Techniques", "Explains optimization techniques.", "/videos/sample21.mp4", "MATH 251", "Optimization"],
    ["Probability and Bayes' Theorem", "Introduction to Bayes' theorem.", "/videos/sample22.mp4", "STAT 201", "Probability,Bayes' Theorem"]
  ];

  for (const [title, description, file, course, topics] of placeholders) {
    seed.run(title, description, file, course, topics);
  }

  console.log("✅ Seeded placeholder animations.");
}


app.use(cors());
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')));


app.get('/api/animations', (req, res) => {
  const rows = db.prepare('SELECT * FROM animations ORDER BY createdAt DESC').all();
  const animations = rows.map(row => ({
    ...row,
    topics: row.topics ? row.topics.split(',') : []
  }));
  res.json(animations);
});


app.post('/api/animations', upload.single('videoFile'), (req, res) => {
  const { title, description, course } = req.body;
  const topicsRaw = req.body.topics;
  const topics = Array.isArray(topicsRaw)
    ? topicsRaw
    : (typeof topicsRaw === 'string' ? topicsRaw.split(',') : []);
  const file = req.file ? `/videos/${req.file.filename}` : req.body.file || '';
  
  const stmt = db.prepare(`
    INSERT INTO animations 
    (title, description, file, course, topics, createdAt) 
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);
  const result = stmt.run(title, description, file, course, topics.join(','));

  const newAnimation = {
    id: result.lastInsertRowid,
    title, description, file, course, topics
  };

  res.status(201).json(newAnimation);
});


app.delete('/api/animations/:id', (req, res) => {
  const { id } = req.params;
  const animation = db.prepare('SELECT * FROM animations WHERE id = ?').get(id);

  if (animation?.file && animation.file.startsWith('/videos/')) {
    const absPath = path.join(__dirname, 'public', animation.file);
    if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
  }

  db.prepare('DELETE FROM animations WHERE id = ?').run(id);
  res.status(204).send();
});


app.post('/render-manim', async (req, res) => {
  const { code } = req.body;
  const sceneId = uuidv4().slice(0, 8);
  const outputVideoPath = path.join(__dirname, 'public', 'videos', `scene_${sceneId}.mp4`);
  const relativePath = `/videos/scene_${sceneId}.mp4`;
  const BASE_URL = process.env.MANIM_RENDER_URL || 'https://manim-render-app.onrender.com';

  try {
    // 1. Submit the job
    const enqueueResp = await axios.post(`${BASE_URL}/render`, { code });
    const jobId = enqueueResp.data.job_id;

    // 2. Poll for status
    const pollStatus = async () => {
      const MAX_ATTEMPTS = 60;
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        await new Promise(r => setTimeout(r, 2000)); // wait 2s
        const statusResp = await axios.get(`${BASE_URL}/status/${jobId}`);
        if (statusResp.data.status === 'done') return;
        if (statusResp.data.status === 'error') throw new Error('Render job failed remotely');
      }
      throw new Error('Render job timed out after waiting');
    };

    await pollStatus();

    // 3. Download the result video
    const resultResp = await axios.get(`${BASE_URL}/result/${jobId}`, {
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(outputVideoPath);
    resultResp.data.pipe(writer);

    writer.on('finish', () => {
      res.json({ videoUrl: relativePath });
    });

    writer.on('error', (err) => {
      console.error("Failed writing video file:", err);
      res.status(500).json({ error: 'Failed to save rendered video.' });
    });

  } catch (err) {
    console.error("Render job error:", err.message || err);
    res.status(500).json({ error: 'Render job failed.', details: err.message || err });
  }
});





app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
