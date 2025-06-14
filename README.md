# Math Animation Tool (Frontend)

This is the frontend for the **Math Animation Tool**, a web platform designed to enable educators to submit Python scripts written using [Manim CE](https://docs.manim.community/) and convert them into high-quality rendered animations for math education. The rendering is handled by a separate backend server for security and performance. This frontend facilitates user interaction, file upload, rendering submission, and content browsing.

---

## Purpose

* **Students** can search and view existing math animations.
* **Educators** can log in, upload new `.mp4` videos or Python Manim code, and manage existing content.
* **Security & Performance:** Actual rendering is done on a dedicated server to prevent front-end overload or code injection risks.

---

## Project Structure

### Root Files

* **`server.js`**
  Express server for serving the frontend, storing metadata in a SQLite database, routing API calls, proxying rendering requests, and handling login/session state.
  See [🔐 Admin & Deployment Notes](#-admin--deployment-notes) below.

---

## Frontend File Overview (`/public`)

### `index.html`

The main HTML page with built-in navigation, login, student and educator views.

### `styles.css`

Custom CSS styled to match Texas A\&M University branding. Handles responsive layout, color theming, and page transitions.

---

## JavaScript Modules (under `/public/js/`)

### `main.js`

**Entrypoint for frontend logic.**

* Handles page transitions.
* Manages educator login and form submission.
* Orchestrates filtering, sorting, and dynamic UI behavior.
* Manages file uploads and rendering requests.

### `data.js`

API interaction layer. Handles:

* Fetching all animations.
* Adding and deleting animations.

### `ui.js`

UI rendering and DOM manipulation.

* Generates animation cards.
* Groups animations by course or topic.
* Handles educator popup editing (title, topics, and editable Manim variables).

### `video.js`

Displays the video detail view when a student selects an animation.

### `filters.js`

Utility module: Implements `debounce()` to limit over-triggered search/filter events.

---

## Database Schema (`server.js`)

Two SQLite tables are used:

* **`users`**: Basic login system for educator access.

  * Seeded with default users: `oliver`, `admin`, `educator` (all use password: `"password"` by default).
* **`animations`**: Stores metadata for uploaded animations including title, file path, course, topics, and associated Manim code.

---

## Admin & Deployment Notes

### Setting Up for Hosting

1. **Install Node.js** and run:

   ```bash
   npm install express cors better-sqlite3 multer axios dotenv express-session
   ```

2. **Create a `.env` file** (optional):

   ```env
   PORT=5001
   SESSION_SECRET=change_this_secret
   ```

3. **Start the server:**

   ```bash
   node server.js
   ```

4. **Serving**: By default, it serves static files from the `/public` folder and listens on `/api/animations`, `/render-manim`, etc.

### Render Server

* The `/render-manim` endpoint **forwards Python code** to a secure Manim rendering backend. Change `BASE_URL` in `server.js` to match your deployment (e.g. a hosted Flask app).

  ```js
  const BASE_URL = 'http://127.0.0.1:5000'; // or your deployed endpoint
  ```

---

## Notes for Non-Technical Maintainers

* **Login**: Only educators can upload/edit/delete. Use one of the seeded accounts.
* **Uploading**:

  * You can upload a `.mp4` **or** Python `.py` code.
  * If you upload Python code, it is automatically rendered into video using Manim CE.
* **Editing**:

  * Editable variables in Python code must follow the `var_EDITABLE = ...` naming convention.
  * These can be modified via the "Edit Animation Content" popup (e.g., change vector coordinates or colors).
* **Backup**:

  * Videos are saved under `public/videos/`.
  * The SQLite database file is `animations.db` — back this up regularly.

---

## Example Usage

```python
# Python code uploaded via Educator Portal
circle_radius_EDITABLE = 2

class MyScene(Scene):
    def construct(self):
        c = Circle(radius=circle_radius_EDITABLE, color=BLUE)
        self.play(Create(c))
```

This allows the frontend to detect `circle_radius_EDITABLE` as an editable parameter and offer real-time re-rendering from the educator UI.

---

## Troubleshooting

* **Render Fails**: Ensure the render server is online and the Python code is valid.
* **Video Doesn’t Show Up**: Check that the file is correctly uploaded to `/public/videos/` and the path stored in the database is accurate.
* **Database Locked**: Restart the server and avoid concurrent writes if hosted on shared storage.
* **Missing Modules**: Ensure dependencies are installed with `npm install`.

---

## Credits

Created for the Texas A\&M University Math Learning Center.
Original frontend design and architecture by Oliver Stalker.

---
