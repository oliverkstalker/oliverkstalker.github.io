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
            alert("Edit functionality is not implemented yet... check back in a few days!");
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", async e => {
            e.stopPropagation();
            try {
              await deleteAnimation(anim.id);
              const educatorAnimationList = document.getElementById("educator-animation-list");
              renderAnimationsRows(educatorAnimationList, {
                isEducator: true,
                groupBy: "course"
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
function renderAnimationsRows(listElement, { groupBy = "course", filterFn = () => true, isEducator = false } = {}) {
    listElement.innerHTML = "";
    const animations = getAnimations().filter(filterFn);
    const groups = {};

    // Group animations based on the selected grouping method
    if (groupBy === "course") {
        animations.forEach(anim => {
            if (!groups[anim.course]) groups[anim.course] = [];
            groups[anim.course].push(anim);
        });
    } else if (groupBy === "topic") {
        animations.forEach(anim => {
            anim.topics.forEach(topic => {
                if (!groups[topic]) groups[topic] = [];
                groups[topic].push(anim);
            });
        });
    }

    // For each group, create a row with a header and horizontal scroll container
    for (const group in groups) {
        // Row container
        const rowContainer = document.createElement("div");
        rowContainer.classList.add("animation-row");

        // Group title/header
        const header = document.createElement("h2");
        header.textContent = group;
        rowContainer.appendChild(header);

        // Horizontal scrolling container
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

export { createAnimationCard, renderAnimations, renderAnimationsRows, showSection };
