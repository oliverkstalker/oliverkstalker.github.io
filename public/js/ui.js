// ui.js
import { getAnimations, setAnimations } from './data.js';
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

    // Display new metadata: course, topics, difficulty, duration, instructor, resource type.
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
        deleteBtn.addEventListener("click", e => {
        e.stopPropagation();
        const animations = getAnimations().filter(a => a.id !== anim.id);
        setAnimations(animations);
        // Re-render the educator list immediately
        const educatorAnimationList = document.getElementById("educator-animation-list");
        renderAnimations(educatorAnimationList, { isEducator: true });
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


function renderAnimations(listElement, { isEducator = false, filterFn = () => true } = {}) {
  listElement.innerHTML = "";
  const animations = getAnimations().filter(filterFn);
  animations.forEach(anim => listElement.appendChild(createAnimationCard(anim, isEducator)));
}

function showSection(section) {
  document.querySelectorAll(".page-section").forEach(sec => sec.classList.add("hidden"));
  section.classList.remove("hidden");
  // Re-trigger fade-in animation.
  section.classList.remove("fade-in");
  void section.offsetWidth; // force reflow
  section.classList.add("fade-in");
}

export { createAnimationCard, renderAnimations, showSection };
