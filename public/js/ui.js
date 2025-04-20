// ui.js
import { getAnimations, deleteAnimation } from './data.js';
import { showDetail } from './video.js';

function createAnimationCard(anim, isEducator = false) {
    const card = document.createElement("div");
    card.classList.add("animation-card");

    // Create video element.
    const video = document.createElement("video");
    video.src = (anim.file && anim.file.endsWith(".mp4"))
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

    // Display new metadata: course, topics, etc.
    const details = document.createElement("p");
    details.classList.add("card-details");
    details.innerHTML = `<strong>Course:</strong> ${anim.course}<br />
                            <strong>Topics:</strong> ${anim.topics.join(", ")}<br />`;

    content.append(title, desc, details);
    card.append(video, content);

    if (isEducator) {
        const btnContainer = document.createElement("div");
        btnContainer.classList.add("card-actions");

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", e => {
          e.stopPropagation();
          showEditPopup(anim);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", async e => {
            e.stopPropagation();
            try {
              await deleteAnimation(anim.id);
              const educatorAnimationList = document.getElementById("educator-animation-list");
              const updatedAnimations = await getAnimations();
              renderAnimationsRows(educatorAnimationList, {
                isEducator: true,
                groupBy: "course",
                animations: updatedAnimations
              });
            } catch (err) {
              console.error("Error deleting animation", err);
              alert("Failed to delete animation. Please try again.");
            }
          });
        btnContainer.append(editBtn, deleteBtn);
        content.appendChild(btnContainer);
    } else {
        // For non-educator cards, clicking shows video details.
        card.addEventListener("click", e => {
            if (!["BUTTON", "VIDEO"].includes(e.target.tagName)) {
                showDetail(anim);
            }
        });
    }
    return card;
}

// Existing grid-based rendering function
function renderAnimations(listElement, { isEducator = false, filterFn = () => true } = {}) {
    listElement.innerHTML = "";
    const animations = getAnimations().filter(filterFn);
    animations.forEach(anim => listElement.appendChild(createAnimationCard(anim, isEducator)));
}

/* NEW: Render animations as horizontal scrolling rows grouped by course or topic */
function renderAnimationsRows(listElement, {
    groupBy = "course",
    filterFn = () => true,
    isEducator = false,
    animations = []
  } = {}) {
    listElement.innerHTML = "";
  
    const filtered = animations.filter(filterFn);
    const groups = {};
  
    if (groupBy === "course") {
      filtered.forEach(anim => {
        if (!groups[anim.course]) groups[anim.course] = [];
        groups[anim.course].push(anim);
      });
    } else if (groupBy === "topic") {
      filtered.forEach(anim => {
        anim.topics.forEach(topic => {
          if (!groups[topic]) groups[topic] = [];
          groups[topic].push(anim);
        });
      });
    }
  
    for (const group in groups) {
      const rowContainer = document.createElement("div");
      rowContainer.classList.add("animation-row");
  
      const header = document.createElement("h2");
      header.textContent = group;
      rowContainer.appendChild(header);
  
      const scrollContainer = document.createElement("div");
      scrollContainer.classList.add("scroll-container");
  
      groups[group].forEach(anim => {
        scrollContainer.appendChild(createAnimationCard(anim, isEducator));
      });
  
      rowContainer.appendChild(scrollContainer);
      listElement.appendChild(rowContainer);
    }
  }
  
function showSection(section) {
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.add("hidden"));
    section.classList.remove("hidden");
    // Re-trigger fade-in animation.
    section.classList.remove("fade-in");
    void section.offsetWidth; // force reflow
    section.classList.add("fade-in");
}

function showEditPopup(animation) {
  const popup = document.createElement("div");
  popup.className = "edit-popup";

  popup.innerHTML = `
    <div class="edit-popup-content">
      <h3>Edit Animation Variables</h3>
      <label>Title: <input type="text" id="edit-title" value="${animation.title}" /></label>
      <label>Description: <textarea id="edit-description">${animation.description}</textarea></label>
      <label>Course: <input type="text" id="edit-course" value="${animation.course}" /></label>
      <label>Topics: <input type="text" id="edit-topics" value="${animation.topics.join(', ')}" /></label>
      <div class="popup-buttons">
        <button id="edit-save">Save</button>
        <button id="edit-animation-content">Edit Animation Content</button>
        <button id="edit-cancel">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  document.getElementById("edit-cancel").onclick = () => popup.remove();

  document.getElementById("edit-save").onclick = async () => {
    const updated = {
      ...animation,
      title: document.getElementById("edit-title").value.trim(),
      description: document.getElementById("edit-description").value.trim(),
      course: document.getElementById("edit-course").value.trim(),
      topics: document.getElementById("edit-topics").value.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      const res = await fetch(`/api/animations/${animation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error("Failed to update animation");

      const updatedAnimations = await getAnimations();
      const container = document.getElementById("educator-animation-list");
      renderAnimationsRows(container, {
        animations: updatedAnimations,
        isEducator: true,
        groupBy: currentEducatorGroupBy
      });

      popup.remove();
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  document.getElementById("edit-animation-content").onclick = () => {
    const contentPopup = document.createElement("div");
    contentPopup.className = "edit-popup";
    contentPopup.innerHTML = `
      <div class="edit-popup-content">
        <h3>Edit Animation Content</h3>
        <label>Height (cm): <input type="number" id="edit-height" value="20" /></label>
        <label>Radius (cm): <input type="number" id="edit-radius" value="6" /></label>
        <label>Rate of Change (cm³/s): <input type="number" id="edit-rate" value="15" /></label>
        <label>Area (cm²): <input type="number" id="edit-area" value="50" /></label>
        <div class="popup-buttons">
          <button id="animation-content-save">Save Variables</button>
          <button id="animation-content-close">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(contentPopup);
    document.getElementById("animation-content-close").onclick = () => contentPopup.remove();
    document.getElementById("animation-content-save").onclick = () => {
      const vars = {
        height: parseFloat(document.getElementById("edit-height").value),
        radius: parseFloat(document.getElementById("edit-radius").value),
        rate: parseFloat(document.getElementById("edit-rate").value),
        area: parseFloat(document.getElementById("edit-area").value)
      };
      console.log("Saved animation variables:", vars);
      alert("Variables saved (stub only)");
      contentPopup.remove();
    };
  };
}


export { createAnimationCard, renderAnimations, renderAnimationsRows, showSection };
