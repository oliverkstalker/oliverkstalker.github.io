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
      renderSaveBtn = document.getElementById("render-save-btn"),
      // New educator filter elements
      educatorSearchInput = document.getElementById("educator-search-input"),
      educatorCourseFilter = document.getElementById("educator-course-filter"),
      educatorTopicFilter = document.getElementById("educator-topic-filter"),
      educatorSearchBtn = document.getElementById("educator-search-btn"),
      educatorSortCourse = document.getElementById("educator-sort-course"),
      educatorSortTopic = document.getElementById("educator-sort-topic"),
      // New student sort elements
      sortCourseBtn = document.getElementById("sort-course"),
      sortTopicBtn = document.getElementById("sort-topic");

// New: Sort Toggle Elements and variable for grouping mode
let currentGroupBy = "course";
let currentEducatorGroupBy = "course";

// Function to update toggle button styles and re-render
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

// Function to update educator sort toggle button styles and re-render
function updateEducatorSort() {
  if (currentEducatorGroupBy === "course") {
    educatorSortCourse.classList.add("active");
    educatorSortTopic.classList.remove("active");
  } else {
    educatorSortCourse.classList.remove("active");
    educatorSortTopic.classList.add("active");
  }
  filterEducatorAnimations();
}

// Filtering logic for student interface
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
    animations
  });
}

// Filtering logic for educator interface
async function filterEducatorAnimations() {
  const searchText = educatorSearchInput.value.toLowerCase();
  const selectedCourse = educatorCourseFilter.value;
  const selectedTopic = educatorTopicFilter.value;
  
  const animations = await getAnimations();

  renderAnimationsRows(educatorAnimationList, {
    groupBy: currentEducatorGroupBy,
    filterFn: anim => {
      const matchesSearch =
        anim.title.toLowerCase().includes(searchText) ||
        anim.description.toLowerCase().includes(searchText);
      const matchesCourse = selectedCourse ? anim.course === selectedCourse : true;
      const matchesTopic = selectedTopic ? anim.topics.includes(selectedTopic) : true;
      return matchesSearch && matchesCourse && matchesTopic;
    },
    animations,
    isEducator: true
  });
}

const debouncedFilter = debounce(filterAnimations, 300);
const debouncedEducatorFilter = debounce(filterEducatorAnimations, 300);

// Navigation Events
studentModeBtn.addEventListener("click", () => {
  showSection(studentInterface);
  filterAnimations();
});

educatorModeBtn.addEventListener("click", async () => {
  showSection(educatorInterface);
  filterEducatorAnimations();
});

navHome.addEventListener("click", () => showSection(landingPage));
navStudent.addEventListener("click", () => {
  showSection(studentInterface);
  filterAnimations();
});
navEducator.addEventListener("click", async () => {
  showSection(educatorInterface);
  const animations = await getAnimations();
  renderAnimationsRows(educatorAnimationList, {
    animations,
    isEducator: true,
    groupBy: "course" // or "topic" if you prefer
  });
  
});

backToHomeStudent.addEventListener("click", () => showSection(landingPage));
backToHomeEducator.addEventListener("click", () => showSection(landingPage));
backToListBtn.addEventListener("click", () => showSection(studentInterface));

// Filter events for student interface
searchBtn.addEventListener("click", filterAnimations);
searchInput.addEventListener("keyup", debouncedFilter);
courseFilter.addEventListener("change", filterAnimations);
topicFilter.addEventListener("change", filterAnimations);

// Sort toggle event listeners for student interface
sortCourseBtn.addEventListener("click", () => {
  currentGroupBy = "course";
  updateSort();
});

sortTopicBtn.addEventListener("click", () => {
  currentGroupBy = "topic";
  updateSort();
});

// Filter events for educator interface
educatorSearchBtn.addEventListener("click", filterEducatorAnimations);
educatorSearchInput.addEventListener("keyup", debouncedEducatorFilter);
educatorCourseFilter.addEventListener("change", filterEducatorAnimations);
educatorTopicFilter.addEventListener("change", filterEducatorAnimations);

// Sort toggle event listeners for educator interface
educatorSortCourse.addEventListener("click", () => {
  currentEducatorGroupBy = "course";
  updateEducatorSort();
});

educatorSortTopic.addEventListener("click", () => {
  currentEducatorGroupBy = "topic";
  updateEducatorSort();
});

// Educator Tabs & Form Handling
manageTabBtn.addEventListener("click", async () => {
  manageTabBtn.classList.add("active");
  addTabBtn.classList.remove("active");
  manageSection.classList.remove("hidden");
  addSection.classList.add("hidden");
  filterEducatorAnimations();
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
renderSaveBtn.addEventListener("click", async () => {
  const title = document.getElementById("anim-title").value.trim();
  const description = document.getElementById("anim-description").value.trim();
  const course = document.getElementById("anim-course").value;
  const topicsRaw = document.getElementById("anim-topics").value;
  const topics = topicsRaw.split(",").map(t => t.trim()).filter(Boolean);

  const fileInput = document.getElementById("anim-file");
  const mp4File = fileInput.files[0];

  const code = pythonEditor?.getValue().trim();
  const hasPython = code && code.length > 0;

  if (!title || !description || !course || topics.length === 0) {
    alert("Please fill in all required fields.");
    return;
  }

  let fileUrl = "default.mp4";

  try {
    // CASE 1: User uploaded MP4
    if (mp4File) {
      const formData = new FormData();
      formData.append("videoFile", mp4File);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("course", course);
      formData.append("topics", topics.join(','));

      const res = await fetch("/api/animations", {
        method: "POST",
        body: formData
      });
      const result = await res.json();
      fileUrl = result.file;
    }

    // CASE 2: User entered Python code
    else if (hasPython) {
      const filename = "scene1.py"; // can be replaced with actual filename if uploaded
      const res = await fetch("/render-manim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, code })
      });
      const data = await res.json();
      fileUrl = data.videoUrl;

      // Save to database
      const anim = {
        title,
        description,
        course,
        topics,
        file: fileUrl,
        pythonCode: code || ""
      };
      await fetch("/api/animations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(anim)
      });
    }

    // CASE 3: Neither uploaded
    else {
      alert("Please upload either an MP4 or provide Python code.");
      return;
    }

    // Reset form and go back
    manageTabBtn.click();
    newAnimationForm.reset();
    if (pythonEditor) pythonEditor.setValue("");

  } catch (err) {
    console.error("Error saving animation:", err);
    alert("An error occurred while saving the animation.");
  }
});

function extractEditableVariables(code) {
  const lines = code.split('\n');
  const editableVars = [];

  for (const line of lines) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)_EDITABLE\s*=\s*(.+)$/);
    if (match) {
      let value;
      try {
        value = JSON.parse(match[2].replace(/'/g, '"'));
      } catch {
        value = match[2];
      }
      editableVars.push({ name: match[1], value });
    }
  }

  return editableVars;
}

function updateEditableVariablesInCode(code, variables) {
  let updatedCode = code;
  for (const { name, value } of variables) {
    const regex = new RegExp(`^${name}_EDITABLE\\s*=.*$`, 'm');
    let valueStr = typeof value === "string" ? `"${value}"` : JSON.stringify(value);
    updatedCode = updatedCode.replace(regex, `${name}_EDITABLE = ${valueStr}`);
  }
  return updatedCode;
}

export { extractEditableVariables, updateEditableVariablesInCode };

