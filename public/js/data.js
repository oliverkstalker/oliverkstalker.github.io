// data.js
const API_BASE = '/api/animations';


async function initialize() {
  // This function can be used to do any one-time setup if needed.
}

// Fetch all animations from the API.
async function getAnimations() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (e) {
    console.error("Error fetching animations", e);
    return [];
  }
}

// Add a new animation by POSTing to the API.
// 'animation' is an object with keys: title, description, file, course, topics (an array)
async function addAnimation(animation) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(animation)
    });
    if (!res.ok) throw new Error('Error adding animation');
    return await res.json();
  } catch (e) {
    console.error("Error adding animation", e);
    throw e;
  }
}

// Delete an animation by ID.
async function deleteAnimation(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error deleting animation');
    return true;
  } catch (e) {
    console.error("Error deleting animation", e);
    throw e;
  }
}

export { initialize, getAnimations, addAnimation, deleteAnimation };
