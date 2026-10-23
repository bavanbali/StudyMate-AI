const themeBtn = document.getElementById("themeBtn");


// =========================
// DARK MODE
// =========================

if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark");

    if (themeBtn) {
        themeBtn.textContent = "☀️";
    }
}


if (themeBtn) {

    themeBtn.addEventListener("click", function () {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {

            themeBtn.textContent = "☀️";

            localStorage.setItem("theme", "dark");

        } else {

            themeBtn.textContent = "🌙";

            localStorage.setItem("theme", "light");

        }

    });

}