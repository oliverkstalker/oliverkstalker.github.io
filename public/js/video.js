// video.js
import { showSection } from './ui.js';

function showDetail(animation) {
  const videoDetailSection = document.getElementById("video-detail");
  const videoDetailContent = document.getElementById("video-detail-content");
  videoDetailContent.innerHTML = `
    <h2>${animation.title}</h2>
    <video src="${animation.file}" controls autoplay></video>
    <p>${animation.description}</p>
    <p><strong>Course:</strong> ${animation.course}</p>
    <p><strong>Topics:</strong> ${animation.topics.join(", ")}</p>
  `;
  showSection(videoDetailSection);
}

export { showDetail };
