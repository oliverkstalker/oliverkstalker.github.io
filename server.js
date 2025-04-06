const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

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
  const topics = req.body.topics ? req.body.topics.split(',') : [];
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


app.post('/render-manim', (req, res) => {
  const { filename, code } = req.body;
  const sceneId = uuidv4().slice(0, 8);
  const tempPyPath = path.join(__dirname, `temp_${sceneId}.py`);
  const outputVideoPath = path.join(__dirname, 'public', 'videos', `scene_${sceneId}.mp4`); 

  fs.writeFileSync(tempPyPath, code);

  const manimCmd = `manim ${tempPyPath} -qm -o scene_${sceneId}.mp4 --media_dir public/videos`;

  exec(manimCmd, (err, stdout, stderr) => {
    fs.unlinkSync(tempPyPath);
    if (err) {
      console.error("Render error:", stderr);
      return res.status(500).json({ error: 'Failed to render Manim video.' });
    }
    const relativePath = `/videos/scene_${sceneId}.mp4`;
    return res.json({ videoUrl: relativePath });
  });
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
