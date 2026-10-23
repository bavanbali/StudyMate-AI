# StudyMate AI

A student-focused web app with study resources, quizzes, interview practice, notes, a resume area, and an AI-assisted study flow.

## Run locally

Requirements: Node.js and npm. AI features also require Ollama with the `llama3.2:3b` model.

1. Clone the repository and open its folder in VS Code.
2. Run `npm install`.
3. Start the backend with `npm start` (serves the API at `http://localhost:3000`).
4. Start Ollama locally and download the model with `ollama pull llama3.2:3b`.
5. Open `index.html` in a local static server (for example, VS Code Live Server).

## GitHub Pages

The Pages site hosts the static frontend only. The backend, AI requests, and any feature that calls `localhost:3000` or Ollama do not work for other visitors from GitHub Pages. A separately deployed API and hosted model service must be configured before those features can be public.

## Project contents

The repository includes the project HTML, CSS, JavaScript, and Express server source. `node_modules` and editor-specific `.vscode` files are intentionally excluded; install dependencies with npm.
