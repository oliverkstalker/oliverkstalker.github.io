// data.js
const STORAGE_KEY = "animations";

const sampleAnimations = [
    {
      id: 1,
      title: "Introduction to Differentiation",
      description: "An explainer on the basics of differentiation.",
      file: "sample1.mp4",
      course: "MATH 151",
      topics: ["Differentiation"],
    },
    {
      id: 2,
      title: "Integration Techniques",
      description: "Learn various methods of integration.",
      file: "sample2.mp4",
      course: "MATH 152",
      topics: ["Integration"],
    },
    {
      id: 3,
      title: "Matrix Multiplication Explained",
      description: "A detailed look into matrix multiplication.",
      file: "sample3.mp4",
      course: "MATH 304",
      topics: ["Matrix Multiplication"],
    },
    {
      id: 4,
      title: "Simplex Method Overview",
      description: "Understanding the Simplex Method for linear programming.",
      file: "assets/videos/SimplexMethod.mp4",
      course: "MATH 141",
      topics: ["Simplex Method"],
    },
    {
      id: 5,
      title: "Related Rates in Action",
      description: "How to solve related rates problems step by step.",
      file: "assets/videos/ConeRelatedRates.mp4",
      course: "MATH 172",
      topics: ["Related Rates"],
    }
  ];
  
function initialize() {
  // Optionally check if data exists before seeding
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleAnimations));
}

function getAnimations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    console.error("Error reading animations from storage", e);
    return [];
  }
}

function setAnimations(animations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(animations));
  } catch (e) {
    console.error("Error saving animations to storage", e);
  }
}

export { initialize, getAnimations, setAnimations };
