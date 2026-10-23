/* =========================================
   STUDY TIMER
========================================= */

let timeLeft = 25 * 60;
let timerInterval = null;

const timerDisplay = document.getElementById("timer");
const timerStatus = document.getElementById("timerStatus");


function updateTimer() {

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


function startTimer() {

    if (timerInterval !== null) {
        return;
    }

    timerStatus.textContent = "🔥 Focus mode started";

    timerInterval = setInterval(() => {

        if (timeLeft <= 0) {

            clearInterval(timerInterval);

            timerInterval = null;

            timerStatus.textContent =
                "🎉 Time completed! Take a break.";

            alert("🎉 Study session completed!");

            return;
        }

        timeLeft--;

        updateTimer();

    }, 1000);
}


function pauseTimer() {

    if (timerInterval !== null) {

        clearInterval(timerInterval);

        timerInterval = null;

        timerStatus.textContent =
            "⏸ Timer paused";
    }
}


function resetTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

    timeLeft = 25 * 60;

    timerStatus.textContent =
        "Ready to study";

    updateTimer();
}


function setTimer(minutes) {

    clearInterval(timerInterval);

    timerInterval = null;

    timeLeft = minutes * 60;

    timerStatus.textContent =
        "Ready to study";

    updateTimer();

    document.querySelectorAll(".mode").forEach(btn => {
        btn.classList.remove("active");
    });

    event.target.classList.add("active");
}


updateTimer();


/* =========================================
   AI STUDY NOTES
========================================= */

async function generateNotes() {

    const topic =
        document.getElementById("topic").value.trim();

    const notes =
        document.getElementById("notesInput").value.trim();

    const videoUrl =
        document.getElementById("videoUrl").value.trim();

    const loading =
        document.getElementById("notesLoading");

    const error =
        document.getElementById("notesError");

    const result =
        document.getElementById("notesResult");

    const generated =
        document.getElementById("generatedNotes");

    const button =
        document.getElementById("generateBtn");


    error.classList.add("hidden");
    result.classList.add("hidden");


    if (!topic) {

        error.textContent =
            "Please enter a topic.";

        error.classList.remove("hidden");

        return;
    }


    if (!notes && !videoUrl) {

        error.textContent =
            "Please enter your notes or provide a YouTube video link.";

        error.classList.remove("hidden");

        return;
    }


    loading.classList.remove("hidden");

    button.disabled = true;

    button.textContent = "🤖 Creating Notes...";


    try {

        const response = await fetch(
            "http://localhost:3000/api/notes",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    topic: topic,
                    notes: notes,
                    videoUrl: videoUrl
                })
            }
        );


        const data = await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error || "Could not generate notes."
            );
        }


        generated.textContent = data.notes;

        result.classList.remove("hidden");


    } catch (err) {

        console.error(err);

        error.textContent =
            "❌ " + err.message;

        error.classList.remove("hidden");

    } finally {

        loading.classList.add("hidden");

        button.disabled = false;

        button.textContent =
            "🤖 Generate AI Notes";
    }
}


/* =========================================
   COPY NOTES
========================================= */

function copyNotes() {

    const text =
        document.getElementById("generatedNotes").innerText;

    navigator.clipboard.writeText(text);

    alert("✅ Notes copied!");
}