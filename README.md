# Math Animation Tool (Manimation)

This project is a web-based platform developed for the Texas A\&M Math Learning Center to support both students and educators in creating, managing, and exploring educational math animations. It provides video browsing functionality for students and a secure content creation portal for educators, integrating video uploads and Python-scripted animation rendering via Manim.

---

##  Features

###  Student Mode

* View math animations organized by course or topic.
* Search, filter, and sort animations.
* Grouped video interface with responsive layout.

### Educator Mode

* Secure educator login.
* Upload MP4 videos or enter Python code (via CodeMirror editor).
* Auto-detect editable variables using `_EDITABLE` pattern.
* Render Python animations remotely using Manim.
* Edit animation metadata and re-render videos in-browser.
* Manage animations (update, delete, preview).

---

##  Technology Stack

### Backend

* **Node.js**, **Express** — API server
* **SQLite** — Lightweight local database
* **Multer** — MP4 file upload handling
* **Axios** — Communicates with remote Manim render server
* **express-session** + **better-sqlite3-session-store** — Session authentication

### Frontend

* **Vanilla JavaScript**, **HTML/CSS**
* **CodeMirror** — Embedded Python code editor
* **Modular architecture**:

  * `main.js` — Entry point and event handlers
  * `data.js` — API interactions
  * `ui.js` — Rendering and interactivity
  * `video.js` — Video detail page logic
  * `filters.js` — Utility functions (e.g., debounce)

---

##  Directory Structure

```
.
├── public/
│   ├── index.html              # Main frontend
│   └── videos/                 # Uploaded/rendered videos
    └── styles/
         └──styles.css
    └── js/
│       ├── main.js
│       ├── data.js
│       ├── ui.js
│       ├── video.js
│       └── filters.js
├── server.js                   # Express API server
└── animations.db               # SQLite database (auto-created)
```

---

##  Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Local Server

```bash
node server.js
```

Server will run at `http://localhost:5001` by default.

### 3. Set Up Remote Render Server

Make sure the render endpoint at `/render` accepts POST requests with a JSON body:

```json
{
  "code": "<your manim code here>"
}
```

It must return an MP4 video stream which is then saved to the local server's `/public/videos/` directory.


