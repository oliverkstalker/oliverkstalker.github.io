// server.js
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
  dest: path.join(__dirname, '..', 'public', 'videos')
})

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

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));


// Sample data (for API purposes if needed)
let animations = [
  {
    id: 1,
    title: "Introduction to Differentiation",
    description: "An explainer on the basics of differentiation.",
    file: "sample1.mp4",
    course: "MATH 151",
    topics: ["Differentiation"]
  }
];

app.get('/api/animations', (req, res) => {
  const rows = db.prepare('SELECT * FROM animations ORDER BY createdAt DESC').all();
  const animations = rows.map(row => ({
    ...row,
    topics: row.topics ? row.topics.split(',') : []
  }));
  res.json(animations);
});


app.post('/api/animations', upload.single('videoFile'), (req, res) => {
  const { title, description, course } = req.body;g
  const topics = req.body.topics ? req.body.topics.split(',') : [];
  const file = req.file ? `/videos/${req.file.filename}` : req.body.file || '';
  
  const stmt = db.prepare(`
    INSERT INTO animations 
    (title, description, file, course, topics, createdAt) 
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);
  const result = stmt.run(
    title, description, file, course, topics.join(',')
  );
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
    const absPath = path.join(__dirname, '..', 'public', animation.file);
    if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
  }

  db.prepare('DELETE FROM animations WHERE id = ?').run(id);
  res.status(204).send();
});


app.post('/render-manim', (req, res) => {
  const { filename, code } = req.body;
  const sceneId = uuidv4().slice(0, 8); // generate unique ID
  const tempPyPath = path.join(__dirname, `temp_${sceneId}.py`);
  const outputVideoPath = path.join(__dirname, '..', 'public', 'videos', `scene_${sceneId}.mp4`);

  fs.writeFileSync(tempPyPath, code);

  const manimCmd = `manim ${tempPyPath} -qm -o scene_${sceneId}.mp4 --media_dir ../public/videos`;

  exec(manimCmd, (err, stdout, stderr) => {
    fs.unlinkSync(tempPyPath); // cleanup

    if (err) {
      console.error("Render error:", stderr);
      return res.status(500).json({ error: 'Failed to render Manim video.' });
    }

    const relativePath = `/videos/scene_${sceneId}.mp4`;
    return res.json({ videoUrl: relativePath });
  });
});

// For direct linking, serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
