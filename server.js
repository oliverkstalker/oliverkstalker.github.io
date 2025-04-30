require('dotenv').config();
const session = require('express-session');
const SQLiteStore = require('better-sqlite3-session-store')(session);
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
  python_code TEXT,
  createdAt TEXT
);`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT    UNIQUE NOT NULL,
    password TEXT    NOT NULL
  );
`);
const insertUser = db.prepare(
  `INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`
);

insertUser.run('oliver', 'password');
insertUser.run('admin', 'password');
insertUser.run('educator', 'password');

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
app.use(session,({
  store: new SQLiteStore({
    client: db,
    expired: {
      clear: true,
      intervalMs: 900000 // 15 minutes
    }
  }),
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

// auth middleware
function requireAuth(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// in your login handler:
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const row = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username);

  if (!row) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (password === row.password) {
    req.session.user = { username };
    return res.json({ success: true });
  }


  res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/animations', (req, res) => {
  const rows = db.prepare('SELECT * FROM animations ORDER BY createdAt DESC').all();
  const animations = rows.map(row => ({
    ...row,
    topics: row.topics ? row.topics.split(',') : [],
    pythonCode: row.python_code || ''
  }));
  res.json(animations);
});


app.post('/api/animations', requireAuth, upload.single('videoFile'), (req, res) => {
  const { title, description, course, pythonCode } = req.body;
  const topicsRaw = req.body.topics;
  const topics = Array.isArray(topicsRaw)
    ? topicsRaw
    : (typeof topicsRaw === 'string' ? topicsRaw.split(',') : []);
  const file = req.file ? `/videos/${req.file.filename}` : req.body.file || '';
  
  const stmt = db.prepare(`
    INSERT INTO animations 
    (title, description, file, course, topics, python_code, createdAt) 
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  const result = stmt.run(title, description, file, course,topics.join(','), pythonCode);

  const newAnimation = {
    id: result.lastInsertRowid,
    title, description, file, course, topics, pythonCode
  };

  res.status(201).json(newAnimation);
});


app.delete('/api/animations/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const animation = db.prepare('SELECT * FROM animations WHERE id = ?').get(id);

  if (animation?.file && animation.file.startsWith('/videos/')) {
    const absPath = path.join(__dirname, 'public', animation.file);
    if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
  }

  db.prepare('DELETE FROM animations WHERE id = ?').run(id);
  res.status(204).send();
});

app.put('/api/animations/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, description, file, course, topics, pythonCode } = req.body;

  const topicsJoined = Array.isArray(topics) ? topics.join(',') : (topics || '');

  const stmt = db.prepare(`
    UPDATE animations
    SET title = ?, description = ?, file = ?, course = ?, topics = ?, python_code = ?
    WHERE id = ?
  `);

  try {
    stmt.run(title, description, file, course, topicsJoined, pythonCode, id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating animation: ", err);
    res.status(500).json({ error: "Failed to update animation" });
  }
});



app.post('/render-manim', requireAuth, async (req, res) => {
  const { code } = req.body;
  if (!code || !code.trim()) {
    return res.status(400).json({ error: "Empty code submitted" });
  }

  const sceneId = uuidv4().slice(0, 8);
  const outPath = path.join(__dirname, 'public', 'videos', `scene_${sceneId}.mp4`);
  const relPath = `/videos/scene_${sceneId}.mp4`;
  // const BASE_URL = 'http://127.0.0.1:5000'; // Local render server
  const BASE_URL = 'https://manim-render-server.onrender.com'; // Remote render server

  try {
    // Preprocess code
    const safeEvalPrelude = `
def safe_eval(expr):
    import numpy as np
    from manim import WHITE, BLACK, RED, GREEN, BLUE, YELLOW, ORANGE, PURPLE, PINK, TEAL, GOLD, MAROON, GRAY, DARK_GRAY, LIGHT_GRAY
    from sympy import Expr

    allowed = {
        "PI": np.pi,
        "pi": np.pi,
        "e": np.e,
        "WHITE": WHITE,
        "BLACK": BLACK,
        "RED": RED,
        "GREEN": GREEN,
        "BLUE": BLUE,
        "YELLOW": YELLOW,
        "ORANGE": ORANGE,
        "PURPLE": PURPLE,
        "PINK": PINK,
        "TEAL": TEAL,
        "GOLD": GOLD,
        "MAROON": MAROON,
        "GRAY": GRAY,
        "DARK_GRAY": DARK_GRAY,
        "LIGHT_GRAY": LIGHT_GRAY,
        "x": symbols('x')  # ensure x is available if needed
    }
    allowed.update({k: v for k, v in np.__dict__.items() if not k.startswith("_")})

    if isinstance(expr, (int, float)):
        return expr
    if isinstance(expr, list):
        return [safe_eval(e) for e in expr]
    if isinstance(expr, Expr):
        return expr  # already a SymPy expression
    if isinstance(expr, str):
        return eval(expr, {"__builtins__": {}}, allowed)
    return expr
`;

    // Extract editable variable names
    const editableVars = [];
    const codeLines = code.split('\n');
    for (const line of codeLines) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)_EDITABLE\s*=/);
      if (match) {
        editableVars.push(match[1] + "_EDITABLE");
      }
    }

    // Generate postlude: safely evaluate editable variables
    const safeEvalPostlude = editableVars.map(varName => `${varName} = safe_eval(${varName})`).join('\n');

    // Final wrapped code
    const fullCode = safeEvalPrelude + '\n' + code + '\n' + safeEvalPostlude;

    // Send to render server
    const renderResp = await axios.post(
      `${BASE_URL}/render`,
      { code: fullCode },
      { responseType: 'stream' }
    );

    // Save the rendered video
    const writer = fs.createWriteStream(outPath);
    renderResp.data.pipe(writer);
    writer.on('finish', () => res.json({ videoUrl: relPath }));
    writer.on('error', e => {
      console.error("Error writing video:", e);
      res.status(500).json({ error: "Failed to save rendered video" });
    });

  } catch (err) {
    if (err.response && err.response.data && typeof err.response.data.pipe === 'function') {
      const chunks = [];
      err.response.data.on('data', chunk => chunks.push(chunk));
      err.response.data.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        console.error('Remote /render error body:', body);
        return res.status(500).json({
          error: 'Render job failed',
          remoteStatus: err.response.status,
          remoteError: body
        });
      });
    } else {
      console.error('Render request failed:', err.message || err);
      return res.status(500).json({ error: err.message || String(err) });
    }
  }
});






app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
