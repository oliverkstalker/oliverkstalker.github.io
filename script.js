"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* ============================
     Data Module
  ============================ */
  const DataModule = (() => {
    const STORAGE_KEY = "animations";

    const sampleAnimations = [
      {
        id: 1,
        title: "Introduction to Differentiation",
        description: "An explainer on the basics of differentiation.",
        file: "sample1.mp4",
        course: "MATH 151",
        topics: ["Differentiation"]
      },
      {
        id: 2,
        title: "Integration Techniques",
        description: "Learn various methods of integration.",
        file: "sample2.mp4",
        course: "MATH 152",
        topics: ["Integration"]
      },
      {
        id: 3,
        title: "Matrix Multiplication Explained",
        description: "A detailed look into matrix multiplication.",
        file: "sample3.mp4",
        course: "MATH 304",
        topics: ["Matrix Multiplication"]
      },
      {
        id: 4,
        title: "Simplex Method Overview",
        description: "Understanding the Simplex Method for linear programming.",
        file: "videos/SimplexMethod.mp4",
        course: "MATH 141",
        topics: ["Simplex Method"]
      },
      {
        id: 5,
        title: "Related Rates in Action",
        description: "How to solve related rates problems step by step.",
        file: "videos/ConeRelatedRates.mp4",
        course: "MATH 172",
        topics: ["Related Rates"]
      }
    ];

    // Only initialize sample data if storage is empty, commented out for debugging
    const initialize = () => {
      // if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleAnimations));
      // }
    };

    const getAnimations = () => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch (e) {
        console.error("Error reading animations from storage", e);
        return [];
      }
    };

    const setAnimations = animations => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(animations));
      } catch (e) {
        console.error("Error saving animations to storage", e);
      }
    };

    return { initialize, getAnimations, setAnimations };
  })();

  /* ============================
     UI Module
  ============================ */
  const UIModule = (() => {
    // Create an animation card element.
    const createAnimationCard = (anim, isEducator = false) => {
      const card = document.createElement("div");
      card.classList.add("animation-card");

      // Create video element.
      const video = document.createElement("video");
      video.src =
        anim.file && anim.file.endsWith(".mp4")
          ? anim.file
          : "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4";
      video.controls = true;

      // Create content container.
      const content = document.createElement("div");
      content.classList.add("card-content");

      const title = document.createElement("h3");
      title.textContent = anim.title;

      const desc = document.createElement("p");
      desc.textContent = anim.description;

      const details = document.createElement("p");
      details.classList.add("card-details");
      details.innerHTML = `<strong>Course:</strong> ${anim.course}<br /><strong>Topics:</strong> ${anim.topics.join(", ")}`;

      content.append(title, desc, details);
      card.append(video, content);

      // Add actions for educator mode.
      if (isEducator) {
        const btnContainer = document.createElement("div");
        btnContainer.classList.add("card-actions");

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", e => {
          e.stopPropagation();
          // Placeholder: Implement edit functionality here.
          alert("Edit functionality is not implemented yet... :( check back in a few days!");
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", e => {
          e.stopPropagation();
          const animations = DataModule.getAnimations().filter(a => a.id !== anim.id);
          DataModule.setAnimations(animations);
          UIModule.renderAnimations(educatorAnimationList, { isEducator: true });
        });

        btnContainer.append(editBtn, deleteBtn);
        content.appendChild(btnContainer);
      } else {
        // For non-educator cards, clicking (outside buttons/video) shows video details.
        card.addEventListener("click", e => {
          if (!["BUTTON", "VIDEO"].includes(e.target.tagName)) {
            VideoModule.showDetail(anim);
          }
        });
      }
      return card;
    };

    const renderAnimations = (listElement, { isEducator = false, filterFn = () => true } = {}) => {
      listElement.innerHTML = "";
      const animations = DataModule.getAnimations().filter(filterFn);
      animations.forEach(anim => listElement.appendChild(createAnimationCard(anim, isEducator)));
    };

    // Generic section switching with fade-in animation.
    const showSection = section => {
      document.querySelectorAll(".page-section").forEach(sec => sec.classList.add("hidden"));
      section.classList.remove("hidden");
      // Re-trigger fade-in animation.
      section.classList.remove("fade-in");
      void section.offsetWidth; // force reflow
      section.classList.add("fade-in");
    };

    return { createAnimationCard, renderAnimations, showSection };
  })();

  /* ============================
     Video Module
  ============================ */
  const VideoModule = (() => {
    const showDetail = animation => {
      const videoDetailSection = document.getElementById("video-detail");
      const videoDetailContent = document.getElementById("video-detail-content");
      // Build the detail view content.
      videoDetailContent.innerHTML = `
        <h2>${animation.title}</h2>
        <video src="${animation.file}" controls autoplay></video>
        <p>${animation.description}</p>
        <p><strong>Course:</strong> ${animation.course}</p>
        <p><strong>Topics:</strong> ${animation.topics.join(", ")}</p>
      `;
      UIModule.showSection(videoDetailSection);
    };

    return { showDetail };
  })();

  /* ============================
     DOM Element Selections
  ============================ */
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
    uploadPythonTabBtn = document.getElementById("upload-python-tab-btn"),
    uploadPythonSection = document.getElementById("upload-python-section"),
    pythonFileInput = document.getElementById("python-file"),
    renderSaveBtn = document.getElementById("render-save-btn");

  /* ============================
     Initialize Data
  ============================ */
  DataModule.initialize();

  /* ============================
     Helper: Debounce Function
  ============================ */
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  /* ============================
     Student Filtering
  ============================ */
  const filterAnimations = () => {
    const searchText = searchInput.value.toLowerCase();
    const selectedCourse = courseFilter.value;
    const selectedTopic = topicFilter.value;
    UIModule.renderAnimations(studentAnimationList, {
      filterFn: anim => {
        const matchesSearch =
          anim.title.toLowerCase().includes(searchText) ||
          anim.description.toLowerCase().includes(searchText);
        const matchesCourse = selectedCourse ? anim.course === selectedCourse : true;
        const matchesTopic = selectedTopic ? anim.topics.includes(selectedTopic) : true;
        return matchesSearch && matchesCourse && matchesTopic;
      }
    });
  };

  const debouncedFilter = debounce(filterAnimations, 300);

  /* ============================
     Navigation Events
  ============================ */
  studentModeBtn.addEventListener("click", () => {
    UIModule.showSection(studentInterface);
    filterAnimations();
  });

  educatorModeBtn.addEventListener("click", () => {
    UIModule.showSection(educatorInterface);
    UIModule.renderAnimations(educatorAnimationList, { isEducator: true });
  });

  navHome.addEventListener("click", () => UIModule.showSection(landingPage));
  navStudent.addEventListener("click", () => {
    UIModule.showSection(studentInterface);
    filterAnimations();
  });
  navEducator.addEventListener("click", () => {
    UIModule.showSection(educatorInterface);
    UIModule.renderAnimations(educatorAnimationList, { isEducator: true });
  });

  backToHomeStudent.addEventListener("click", () => UIModule.showSection(landingPage));
  backToHomeEducator.addEventListener("click", () => UIModule.showSection(landingPage));
  backToListBtn.addEventListener("click", () => UIModule.showSection(studentInterface));

  // Filter events.
  searchBtn.addEventListener("click", filterAnimations);
  searchInput.addEventListener("keyup", debouncedFilter);
  courseFilter.addEventListener("change", filterAnimations);
  topicFilter.addEventListener("change", filterAnimations);

  /* ============================
     Educator Tabs & Form Handling
  ============================ */
  manageTabBtn.addEventListener("click", () => {
    manageTabBtn.classList.add("active");
    addTabBtn.classList.remove("active");
    manageSection.classList.remove("hidden");
    addSection.classList.add("hidden");
    UIModule.renderAnimations(educatorAnimationList, { isEducator: true });
  });

  addTabBtn.addEventListener("click", () => {
    addTabBtn.classList.add("active");
    manageTabBtn.classList.remove("active");
    addSection.classList.remove("hidden");
    manageSection.classList.add("hidden");

    if (!pythonEditorInitialized) {
      window.pythonEditor = CodeMirror.fromTextArea(document.getElementById("python-code-editor"), {
        mode: "python",
        lineNumbers: true,
        theme: "default"

      });
      pythonEditor.setSize("100%", "300px");
      pythonEditorInitialized = true;
    }
  });
  

  newAnimationForm.addEventListener("submit", e => {
    e.preventDefault();

    // Retrieve and validate form values.
    const title = document.getElementById("anim-title").value.trim();
    const description = document.getElementById("anim-description").value.trim();
    const fileInput = document.getElementById("anim-file");
    const file = fileInput.files[0];
    const filePath = file ? file.name : "default.mp4";
    const course = document.getElementById("anim-course").value;
    const topicsRaw = document.getElementById("anim-topics").value;
    const topics = topicsRaw.split(",").map(t => t.trim()).filter(t => t);

    if (!title || !description || !course || topics.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }

    const animations = DataModule.getAnimations();
    const newId = animations.length > 0 ? Math.max(...animations.map(a => a.id)) + 1 : 1;
    const newAnimation = { id: newId, title, description, file: filePath, course, topics };

    animations.push(newAnimation);
    DataModule.setAnimations(animations);

    // Switch back to Manage tab and reset form.
    manageTabBtn.click();
    newAnimationForm.reset();


    
  });

  // Initialize CodeMirror for the Python code editor
  let pythonEditor = CodeMirror.fromTextArea(document.getElementById("python-code-editor"), {
    mode: "python",
    lineNumbers: true,
    theme: "default"
  });
  pythonEditor.setSize("100%", "300px");
    

  // Load .py file into editor
  pythonFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        pythonEditor.setValue(event.target.result);
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
      const animations = DataModule.getAnimations();
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
      DataModule.setAnimations(animations);
      manageTabBtn.click(); // switch back to Manage tab
      document.getElementById("new-animation-form").reset();
      pythonEditor.setValue("");
    })
    .catch(err => {
      console.error("Error rendering Manim code:", err);
      alert("Failed to render the animation. Please try again.");
    });
  });

});
