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
  },
  // Additional placeholder animations
  {
    id: 6,
    title: "Limits and Continuity",
    description: "Understanding limits and continuous functions.",
    file: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    course: "MATH 151",
    topics: ["Limits", "Continuity"],
  },
  {
    id: 7,
    title: "The Chain Rule Explained",
    description: "A deep dive into the chain rule for differentiation.",
    file: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    course: "MATH 151",
    topics: ["Differentiation", "Chain Rule"],
  },
  {
    id: 8,
    title: "Partial Derivatives",
    description: "Introduction to partial derivatives in multivariable calculus.",
    file: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    course: "MATH 171",
    topics: ["Partial Derivatives"],
  },
  {
    id: 9,
    title: "Double Integrals Overview",
    description: "Learn how to compute double integrals for area and volume.",
    file: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    course: "MATH 152",
    topics: ["Integration", "Double Integrals"],
  },
  {
    id: 10,
    title: "Vector Calculus Basics",
    description: "Fundamentals of vector calculus and its applications.",
    file: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    course: "MATH 304",
    topics: ["Vector Calculus"],
  },
  {
    id: 11,
    title: "Eigenvalues and Eigenvectors",
    description: "Understanding the concepts of eigenvalues and eigenvectors.",
    file: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    course: "MATH 304",
    topics: ["Linear Algebra"],
  },
  {
    id: 12,
    title: "Probability Fundamentals",
    description: "An introduction to basic probability theory.",
    file: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    course: "MATH 172",
    topics: ["Probability"],
  },
  {
    id: 13,
    title: "Statistical Distributions",
    description: "Overview of common statistical distributions.",
    file: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    course: "MATH 172",
    topics: ["Statistics"],
  },
  {
    id: 14,
    title: "Differential Equations 101",
    description: "Introduction to solving differential equations.",
    file: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    course: "MATH 141",
    topics: ["Differential Equations"],
  },
  {
    id: 15,
    title: "Fourier Series Explained",
    description: "Learn the basics of Fourier series and their applications.",
    file: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    course: "MATH 141",
    topics: ["Fourier Analysis"],
  },
  {
    id: 16,
    title: "Introduction to Differentiation",
    description: "An explainer on the basics of differentiation.",
    file: "sample1.mp4",
    course: "MATH 151",
    topics: ["Differentiation"],
  },
  {
    id: 17,
    title: "Introduction to Differentiation",
    description: "An explainer on the basics of differentiation.",
    file: "sample1.mp4",
    course: "MATH 151",
    topics: ["Differentiation"],
  },
  {
    id: 18,
    title: "Introduction to Differentiation",
    description: "An explainer on the basics of differentiation.",
    file: "sample1.mp4",
    course: "MATH 151",
    topics: ["Differentiation"],
  },
  {
    id: 19,
    title: "Introduction to Differentiation",
    description: "An explainer on the basics of differentiation.",
    file: "sample1.mp4",
    course: "MATH 151",
    topics: ["Differentiation"],
  },
  {
    id: 20,
    title: "Introduction to Differentiation",
    description: "An explainer on the basics of differentiation.",
    file: "sample1.mp4",
    course: "MATH 151",
    topics: ["Differentiation"],
  },
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
