// main.js
import { initialize, getAnimations } from './data.js';
import { renderAnimations, renderAnimationsRows, showSection } from './ui.js';
import { showDetail } from './video.js';
import { debounce } from './filters.js';

// Initialize Data
initialize();

// DOM element selections
const landingPage = document.getElementById("landing-page"),
      studentInterface = document.getElementById("student-interface"),
      educatorInterface = document.getElementById("educator-interface"),
      navHome = document.getElementById("nav-home"),
      navStudent = document.getElementById("nav-student"),
      navEducator = document.getElementById("nav-educator"),
      studentModeBtn = document.getElementById("student-mode-btn"),
      educatorModeBtn = document.getElementById("educator-mode-btn"),
      backToHomeStudent = document.getElementById("back-to-home-student"),
      backToHomeEducator = document.getElementById("back-to-home-educator"),
      searchInput = document.getElementById("search-input"),
      courseFilter = document.getElementById("course-filter"),
      topicFilter = document.getElementById("topic-filter"),
      searchBtn = document.getElementById("search-btn"),
      studentAnimationList = document.getElementById("student-animation-list"),
      manageTabBtn = document.getElementById("manage-tab-btn"),
      addTabBtn = document.getElementById("add-tab-btn"),
      manageSection = document.getElementById("manage-section"),
      addSection = document.getElementById("add-section"),
      educatorAnimationList = document.getElementById("educator-animation-list"),
      newAnimationForm = document.getElementById("new-animation-form"),
      backToListBtn = document.getElementById("back-to-list"),
      pythonFileInput = document.getElementById("python-file"),
      renderSaveBtn = document.getElementById("render-save-btn");

// New: Sort Toggle Elements and variable for grouping mode.
// (Make sure you add these buttons in your HTML.)
const sortCourseBtn = document.getElementById("sort-course"),
      sortTopicBtn = document.getElementById("sort-topic");
let currentGroupBy = "course"; // default grouping

// Function to update toggle button styles and re-render.
function updateSort() {
  if (currentGroupBy === "course") {
    sortCourseBtn.classList.add("active");
    sortTopicBtn.classList.remove("active");
  } else {
    sortCourseBtn.classList.remove("active");
    sortTopicBtn.classList.add("active");
  }
  filterAnimations();
}

// Filtering logic now using renderAnimationsRows
async function filterAnimations() {
  const searchText = searchInput.value.toLowerCase();
  const selectedCourse = courseFilter.value;
  const selectedTopic = topicFilter.value;
  
  const animations = await getAnimations();

  renderAnimationsRows(studentAnimationList, {
    groupBy: currentGroupBy,
    filterFn: anim => {
      const matchesSearch =
        anim.title.toLowerCase().includes(searchText) ||
        anim.description.toLowerCase().includes(searchText);
      const matchesCourse = selectedCourse ? anim.course === selectedCourse : true;
      const matchesTopic = selectedTopic ? anim.topics.includes(selectedTopic) : true;
      return matchesSearch && matchesCourse && matchesTopic;
    },
    animations  // Pass the animations array explicitly
  });
}
const debouncedFilter = debounce(filterAnimations, 300);

// Navigation Events
studentModeBtn.addEventListener("click", () => {
  showSection(studentInterface);
  filterAnimations();
});

educatorModeBtn.addEventListener("click", () => {
  showSection(educatorInterface);
  renderAnimationsRows(educatorAnimationList, {
    isEducator: true,
    groupBy: "course" // or "topic" if you prefer
  });
  
});

navHome.addEventListener("click", () => showSection(landingPage));
navStudent.addEventListener("click", () => {
  showSection(studentInterface);
  filterAnimations();
});
navEducator.addEventListener("click", () => {
  showSection(educatorInterface);
  renderAnimationsRows(educatorAnimationList, {
    isEducator: true,
    groupBy: "course" // or "topic" if you prefer
  });
  
});

backToHomeStudent.addEventListener("click", () => showSection(landingPage));
backToHomeEducator.addEventListener("click", () => showSection(landingPage));
backToListBtn.addEventListener("click", () => showSection(studentInterface));

// Filter events
searchBtn.addEventListener("click", filterAnimations);
searchInput.addEventListener("keyup", debouncedFilter);
courseFilter.addEventListener("change", filterAnimations);
topicFilter.addEventListener("change", filterAnimations);

// Sort toggle event listeners
if (sortCourseBtn && sortTopicBtn) {
  sortCourseBtn.addEventListener("click", () => {
    currentGroupBy = "course";
    updateSort();
  });
  sortTopicBtn.addEventListener("click", () => {
    currentGroupBy = "topic";
    updateSort();
  });
}

// Educator Tabs & Form Handling
manageTabBtn.addEventListener("click", () => {
  manageTabBtn.classList.add("active");
  addTabBtn.classList.remove("active");
  manageSection.classList.remove("hidden");
  addSection.classList.add("hidden");
  renderAnimationsRows(educatorAnimationList, {
    isEducator: true,
    groupBy: "course" // or "topic" if you prefer
  });
  
});

let pythonEditor;
let pythonEditorInitialized = false;
addTabBtn.addEventListener("click", () => {
  addTabBtn.classList.add("active");
  manageTabBtn.classList.remove("active");
  addSection.classList.remove("hidden");
  manageSection.classList.add("hidden");

  if (!pythonEditorInitialized) {
    // Initialize CodeMirror for Python code editor
    pythonEditor = CodeMirror.fromTextArea(document.getElementById("python-code-editor"), {
      mode: "python",
      lineNumbers: true,
      theme: "default"
    });
    pythonEditor.setSize("100%", "300px");
    pythonEditorInitialized = true;
  }
});

// New Animation Form Handling
newAnimationForm.addEventListener("submit", async e => {
  e.preventDefault();

  const title = document.getElementById("anim-title").value.trim();
  const description = document.getElementById("anim-description").value.trim();
  // For file upload, we assume the file is uploaded via the form.
  // Here, we simply get the file name as a placeholder.
  const fileInput = document.getElementById("anim-file");
  const fileUrl = fileInput && fileInput.files[0] ? fileInput.files[0].name : "default.mp4";
  const course = document.getElementById("anim-course").value;
  const topicsRaw = document.getElementById("anim-topics").value;
  const topics = topicsRaw.split(",").map(t => t.trim()).filter(t => t);

  if (!title || !description || !course || topics.length === 0) {
    alert("Please fill in all required fields.");
    return;
  }

  const newAnimation = { title, description, file: fileUrl, course, topics };

  try {
    await addAnimation(newAnimation);
    // After successful addition, refresh the educator list.
    manageTabBtn.click();
  } catch (err) {
    alert("Failed to add animation. Please try again.");
  }
});


// Load .py file into editor
pythonFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      pythonEditor.setValue(event.target.result);
      pythonEditor.refresh();
    };
    reader.readAsText(file);
  }
});

// Handle render and save
renderSaveBtn.addEventListener("click", () => {
  const title = document.getElementById("anim-title").value.trim();
  const description = document.getElementById("anim-description").value.trim();
  const course = document.getElementById("anim-course").value;
  const topicsRaw = document.getElementById("anim-topics").value;
  const topics = topicsRaw.split(",").map(t => t.trim()).filter(Boolean);
  const filename = pythonFileInput.files[0]?.name || "scene1.py";
  const code = pythonEditor.getValue();

  if (!title || !description || !course || topics.length === 0 || !code) {
    alert("Please fill in all required fields and ensure code is provided.");
    return;
  }

  fetch("http://localhost:5000/render-manim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, code })
  })
  .then(res => res.json())
  .then(data => {
    const videoUrl = data.videoUrl;
    const animations = getAnimations();
    const newId = animations.length > 0 ? Math.max(...animations.map(a => a.id)) + 1 : 1;

    const newAnimation = {
      id: newId,
      title,
      description,
      file: videoUrl,
      course,
      topics
    };

    animations.push(newAnimation);
    localStorage.setItem("animations", JSON.stringify(animations));
    manageTabBtn.click(); // switch back to Manage tab
    newAnimationForm.reset();
    pythonEditor.setValue("");
  })
  .catch(err => {
    console.error("Error rendering Manim code:", err);
    alert("Failed to render the animation. Please try again.");
  });
});
