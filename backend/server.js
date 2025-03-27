const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample data
let animations = [
  {
    id: 1,
    title: "Introduction to Differentiation",
    description: "An explainer on the basics of differentiation.",
    file: "sample1.mp4",
    course: "MATH 151",
    topics: ["Differentiation"]
  },
  // Add more sample animations as needed
];

// Routes
app.get('/api/animations', (req, res) => {
  res.json(animations);
});

app.post('/api/animations', (req, res) => {
  const newAnimation = req.body;
  newAnimation.id = animations.length ? Math.max(...animations.map(a => a.id)) + 1 : 1;
  animations.push(newAnimation);
  res.status(201).json(newAnimation);
});

app.delete('/api/animations/:id', (req, res) => {
  const { id } = req.params;
  animations = animations.filter(animation => animation.id !== parseInt(id));
  res.status(204).send();
});

app.post('/render-manim', (req, res) => {
  const { filename, code } = req.body;

  // Simulate rendering process
  console.log(`Rendering ${filename} with provided code...`);

  // Simulate a generated video URL
  const videoUrl = `/videos/${filename.replace('.py', '.mp4')}`;

  // Respond with the video URL
  res.json({ videoUrl });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

