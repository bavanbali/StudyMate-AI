const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 3000;
const OLLAMA_URL = "http://localhost:11434";
const MODEL = "llama3.2:3b";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ============================================
// HOME
// ============================================

app.get("/", (req, res) => {
    res.send(`
        <h1>StudyMate AI Server</h1>
        <p>Server is running.</p>
        <p>Ollama: ${OLLAMA_URL}</p>
    `);
});

// ============================================
// HEALTH CHECK
// ============================================

app.get("/api/health", async (req, res) => {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/tags`);

        if (!response.ok) {
            throw new Error("Ollama is not responding");
        }

        res.json({
            success: true,
            message: "StudyMate AI server is running",
            ollama: true,
            model: MODEL
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "StudyMate AI server is running, but Ollama is not reachable",
            error: error.message
        });
    }
});

// ============================================
// OLLAMA HELPER
// ============================================

async function askOllama(prompt, format = "json") {

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            model: MODEL,
            prompt: prompt,
            stream: false,
            format: format,
            options: {
                temperature: 0.2
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama error: ${errorText}`);
    }

    const data = await response.json();

    if (!data.response) {
        throw new Error("Ollama returned an empty response");
    }

    return data.response;
}

// ============================================
// SAFE JSON PARSER
// ============================================

function parseAIJson(text) {

    // Remove markdown code fences
    let cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    // First attempt
    try {
        return JSON.parse(cleaned);
    } catch (error) {
        console.log("Normal JSON parsing failed.");
    }

    // Try extracting JSON object
    const objectStart = cleaned.indexOf("{");
    const objectEnd = cleaned.lastIndexOf("}");

    if (objectStart !== -1 && objectEnd !== -1) {

        const possibleObject =
            cleaned.substring(objectStart, objectEnd + 1);

        try {
            return JSON.parse(possibleObject);
        } catch (error) {
            console.log("Object extraction failed.");
        }
    }

    // Try extracting JSON array
    const arrayStart = cleaned.indexOf("[");
    const arrayEnd = cleaned.lastIndexOf("]");

    if (arrayStart !== -1 && arrayEnd !== -1) {

        const possibleArray =
            cleaned.substring(arrayStart, arrayEnd + 1);

        try {
            return JSON.parse(possibleArray);
        } catch (error) {
            console.log("Array extraction failed.");
        }
    }

    throw new Error(
        "AI returned invalid JSON.\n\nAI response:\n" + text
    );
}

// ============================================
// AI QUIZ
// ============================================

app.post("/api/quiz", async (req, res) => {

    try {

        const {
            subject = "General",
            difficulty = "Beginner",
            numberOfQuestions = 5
        } = req.body;

        const count = Math.min(
            Math.max(parseInt(numberOfQuestions) || 5, 1),
            20
        );

        console.log("");
        console.log("====================================");
        console.log("GENERATING QUIZ");
        console.log("Subject:", subject);
        console.log("Difficulty:", difficulty);
        console.log("Questions:", count);
        console.log("====================================");

        const prompt = `
You are StudyMate AI, an educational quiz generator.

Create exactly ${count} multiple-choice questions about:

Subject: ${subject}
Difficulty: ${difficulty}

IMPORTANT:
Return ONLY valid JSON.
Do not write explanations.
Do not use markdown.
Do not use code fences.

Use exactly this JSON structure:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "Option A",
      "explanation": "Short explanation"
    }
  ]
}

Rules:
- Exactly ${count} questions.
- Every question must have exactly 4 options.
- "answer" must exactly match one of the options.
- Questions must be related to ${subject}.
- Difficulty must be ${difficulty}.
- Keep explanations short.
`;

        const aiText = await askOllama(prompt, "json");

        console.log("Ollama response received.");

        const quizData = parseAIJson(aiText);

        if (
            !quizData ||
            !Array.isArray(quizData.questions)
        ) {
            throw new Error(
                "AI response does not contain a valid questions array."
            );
        }

        // Clean and validate questions
        const questions = quizData.questions
            .slice(0, count)
            .filter(q =>
                q &&
                typeof q.question === "string" &&
                Array.isArray(q.options) &&
                q.options.length >= 2 &&
                typeof q.answer === "string"
            )
            .map(q => ({
                question: q.question,
                options: q.options.slice(0, 4),
                answer: q.answer,
                explanation: q.explanation || ""
            }));

        if (questions.length === 0) {
            throw new Error("No valid questions were generated.");
        }

        console.log(
            `Successfully generated ${questions.length} questions.`
        );

        res.json({
            success: true,
            subject,
            difficulty,
            questions
        });

    } catch (error) {

        console.error("");
        console.error("QUIZ ERROR:");
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not generate quiz.",
            error: error.message
        });
    }
});

// ============================================
// AI INTERVIEW
// ============================================

app.post("/api/interview", async (req, res) => {

    try {

        const {
            question,
            answer,
            interviewType = "HR",
            department = "General"
        } = req.body;

        if (!question || !answer || !answer.trim()) {

            return res.status(400).json({
                success: false,
                message: "Question and answer are required."
            });
        }

        const prompt = `
You are an AI interview evaluator for StudyMate AI.

Interview Type: ${interviewType}
Department: ${department}

Interview Question:
${question}

Student Answer:
${answer}

Evaluate the student's answer.

Return ONLY valid JSON in exactly this format:

{
  "score": 7,
  "relevance": "Good",
  "clarity": "Good",
  "communication": "Good",
  "feedback": "Short constructive feedback",
  "suggestion": "One practical improvement"
}

Rules:
- score must be a number from 0 to 10.
- Be fair and constructive.
- Do not invent information about the student.
- Keep feedback concise.
`;

        const aiText = await askOllama(prompt, "json");

        const result = parseAIJson(aiText);

        res.json({
            success: true,
            score: Math.max(
                0,
                Math.min(10, Number(result.score) || 0)
            ),
            relevance: result.relevance || "Needs improvement",
            clarity: result.clarity || "Needs improvement",
            communication: result.communication || "Needs improvement",
            feedback: result.feedback || "",
            suggestion: result.suggestion || ""
        });

    } catch (error) {

        console.error("INTERVIEW ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Could not evaluate interview answer.",
            error: error.message
        });
    }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {

    console.log("");
    console.log("====================================");
    console.log("        StudyMate AI Server");
    console.log("====================================");
    console.log("");
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Ollama: ${OLLAMA_URL}`);
    console.log("");
    console.log("AI Interview: /api/interview");
    console.log("AI Quiz:      /api/quiz");
    console.log("");
    console.log("Server is ready!");
    console.log("====================================");
});