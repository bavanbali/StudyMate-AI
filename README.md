# StudyMate AI

Student learning app with study resources, quizzes, interview practice, notes, a resume area, and an AI-assisted study flow.

## Run locally

Requirements: Node.js, npm, and Ollama for AI features.

1. Clone this repository and open it in VS Code.
2. Run `npm install`.
3. Run `npm start` to launch the backend at `http://localhost:3000`.
4. Start Ollama and run `ollama pull llama3.2:3b`.
5. Open `index.html` using a local static server such as VS Code Live Server.

## GitHub Pages limitations

GitHub Pages serves only the frontend. Features calling `localhost:3000` or Ollama will not work for other visitors until the backend and model are separately deployed and configured.

`node_modules` and `.vscode` are excluded; install dependencies with npm.
