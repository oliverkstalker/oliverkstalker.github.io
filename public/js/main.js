// main.js
import { initialize, getAnimations } from './data.js';
import { renderAnimations, showSection } from './ui.js';
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

// Filtering logic
function filterAnimations() {
  const searchText = searchInput.value.toLowerCase();
  const selectedCourse = courseFilter.value;
  const selectedTopic = topicFilter.value;

  renderAnimations(studentAnimationList, {
    filterFn: anim => {
      const matchesSearch =
        anim.title.toLowerCase().includes(searchText) ||
        anim.description.toLowerCase().includes(searchText);
      const matchesCourse = selectedCourse ? anim.course === selectedCourse : true;
      const matchesTopic = selectedTopic ? anim.topics.includes(selectedTopic) : true;
      return matchesSearch && matchesCourse && matchesTopic;
    }
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
  renderAnimations(educatorAnimationList, { isEducator: true });
});

navHome.addEventListener("click", () => showSection(landingPage));
navStudent.addEventListener("click", () => {
  showSection(studentInterface);
  filterAnimations();
});
navEducator.addEventListener("click", () => {
  showSection(educatorInterface);
  renderAnimations(educatorAnimationList, { isEducator: true });
});

backToHomeStudent.addEventListener("click", () => showSection(landingPage));
backToHomeEducator.addEventListener("click", () => showSection(landingPage));
backToListBtn.addEventListener("click", () => showSection(studentInterface));

// Filter events
searchBtn.addEventListener("click", filterAnimations);
searchInput.addEventListener("keyup", debouncedFilter);
courseFilter.addEventListener("change", filterAnimations);
topicFilter.addEventListener("change", filterAnimations);

// Educator Tabs & Form Handling
manageTabBtn.addEventListener("click", () => {
  manageTabBtn.classList.add("active");
  addTabBtn.classList.remove("active");
  manageSection.classList.remove("hidden");
  addSection.classList.add("hidden");
  renderAnimations(educatorAnimationList, { isEducator: true });
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
newAnimationForm.addEventListener("submit", e => {
  e.preventDefault();

  const title = document.getElementById("anim-title").value.trim();
  const description = document.getElementById("anim-description").value.trim();
  const fileInput = document.getElementById("anim-file");
  const file = fileInput ? fileInput.files[0] : null;
  const filePath = file ? file.name : "default.mp4";
  const course = document.getElementById("anim-course").value;
  const topicsRaw = document.getElementById("anim-topics").value;
  const topics = topicsRaw.split(",").map(t => t.trim()).filter(t => t);

  if (!title || !description || !course || topics.length === 0) {
    alert("Please fill in all required fields.");
    return;
  }

  const animations = getAnimations();
  const newId = animations.length > 0 ? Math.max(...animations.map(a => a.id)) + 1 : 1;
  const newAnimation = { id: newId, title, description, file: filePath, course, topics };

  animations.push(newAnimation);
  localStorage.setItem("animations", JSON.stringify(animations));

  // Switch back to Manage tab and reset form.
  manageTabBtn.click();
  newAnimationForm.reset();
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
