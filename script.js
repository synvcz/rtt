const SUPABASE_URL = "https://nwxlezzsntzamipthxkn.supabase.co";
const SUPABASE_KEY = "sb_publishable_bUKQSZtR3X6XvuM6NTtelA_Q-nu7w6T";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =========================
// ELEMENTS
// =========================

const startScreen = document.getElementById("start-screen");
const testScreen = document.getElementById("test-screen");
const resultScreen = document.getElementById("result-screen");

const reactionBox = document.getElementById("reaction-box");
const resultTime = document.getElementById("result-time");
const resultRating = document.getElementById("result-rating");

const tryAgain = document.getElementById("try-again");
const saveResult = document.getElementById("save-result");

const tooSoonButton = document.getElementById("too-soon-button");

const usernameModal = document.getElementById("username-modal");
const usernameInput = document.getElementById("username-input");
const saveScore = document.getElementById("save-score");
const skipScore = document.getElementById("skip-score");


// =========================
// LEADERBOARD ELEMENTS
// =========================

const leaderboardScreen = document.getElementById("leaderboard-screen");
const navLeaderboard = document.getElementById("nav-leaderboard");
const navTest = document.getElementById("nav-test");
const backToTest = document.getElementById("back-to-test");
const leaderboardList = document.getElementById("leaderboard-list");


// =========================
// VARIABLES
// =========================

let startTime = 0;
let timeout = null;

let waiting = false;
let ready = false;

let currentReactionTime = 0;


// =========================
// GUEST ID
// =========================

function getGuestId() {
    let guestId = localStorage.getItem("guestId");

    if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem("guestId", guestId);
    }

    return guestId;
}


// =========================
// START TEST
// =========================

function startTest() {
    clearTimeout(timeout);

    startScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    leaderboardScreen.classList.add("hidden");
    usernameModal.classList.add("hidden");
    tooSoonButton.classList.add("hidden");

    testScreen.classList.remove("hidden");

    reactionBox.classList.remove("green");

    reactionBox.querySelector("h2").textContent =
        "Wait for green...";

    waiting = true;
    ready = false;

    const delay = Math.random() * 4000 + 1000;

    timeout = setTimeout(() => {
        reactionBox.classList.add("green");

        reactionBox.querySelector("h2").textContent =
            "CLICK!";

        startTime = performance.now();

        waiting = false;
        ready = true;
    }, delay);
}


// =========================
// REACTION BOX CLICK
// =========================

reactionBox.addEventListener("click", () => {

    // Clicked too early
    if (waiting) {
        clearTimeout(timeout);

        waiting = false;
        ready = false;

        reactionBox.querySelector("h2").textContent =
            "Too soon!";

        tooSoonButton.classList.remove("hidden");

        return;
    }

    // Correct reaction
    if (ready) {
        const reactionTime = Math.round(
            performance.now() - startTime
        );

        showResult(reactionTime);
    }
});


// =========================
// SHOW RESULT
// =========================

function showResult(time) {
    ready = false;
    waiting = false;

    currentReactionTime = time;

    testScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    resultTime.textContent = `${time} ms`;

    if (time < 150) {
        resultRating.textContent = "Insane!";
    }
    else if (time < 200) {
        resultRating.textContent = "Excellent!";
    }
    else if (time < 250) {
        resultRating.textContent = "Fast!";
    }
    else if (time < 300) {
        resultRating.textContent = "Good!";
    }
    else if (time < 400) {
        resultRating.textContent = "Average";
    }
    else {
        resultRating.textContent = "Slow";
    }
}


// =========================
// TRY AGAIN
// =========================

tryAgain.addEventListener("click", () => {
    startTest();
});


// =========================
// SAVE RESULT BUTTON
// =========================

saveResult.addEventListener("click", () => {
    usernameModal.classList.remove("hidden");

    usernameInput.value = "";

    usernameInput.focus();
});


// =========================
// SAVE SCORE
// =========================

saveScore.addEventListener("click", async () => {

    const username = usernameInput.value.trim();

    if (!username) {
        usernameInput.focus();
        return;
    }

    saveScore.disabled = true;
    saveScore.textContent = "Saving...";

    const guestId = getGuestId();

    const { error } = await supabaseClient
        .from("results")
        .insert([{
            guest_id: guestId,
            username: username,
            reaction_time: currentReactionTime
        }]);

    if (error) {
        console.error("Failed to save result:", error);

        alert("Could not save your score.");

        saveScore.disabled = false;
        saveScore.textContent = "Save Score";

        return;
    }

    usernameModal.classList.add("hidden");

    saveScore.disabled = false;
    saveScore.textContent = "Save Score";
});


// =========================
// SKIP SCORE
// =========================

skipScore.addEventListener("click", () => {
    usernameModal.classList.add("hidden");
});


// =========================
// TOO SOON → TRY AGAIN
// =========================

tooSoonButton.addEventListener("click", () => {
    startTest();
});


// =========================
// START SCREEN CLICK
// =========================

startScreen.addEventListener("click", () => {
    startTest();
});


// =========================
// NAV → LEADERBOARD
// =========================

navLeaderboard.addEventListener("click", (e) => {
    e.preventDefault();

    clearTimeout(timeout);

    startScreen.classList.add("hidden");
    testScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    usernameModal.classList.add("hidden");

    leaderboardScreen.classList.remove("hidden");

    loadLeaderboard();
});


// =========================
// NAV → TEST
// =========================

navTest.addEventListener("click", (e) => {
    e.preventDefault();

    resultScreen.classList.add("hidden");
    testScreen.classList.add("hidden");

    switchScreen(leaderboardScreen, startScreen);
});


// =========================
// BACK TO TEST
// =========================

backToTest.addEventListener("click", () => {
    leaderboardScreen.classList.add("hidden");

    startScreen.classList.remove("hidden");
});


// =========================
// ESCAPE HTML
// =========================

function escapeHTML(text) {
    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// =========================
// LOAD LEADERBOARD
// =========================

async function loadLeaderboard() {
    leaderboardList.innerHTML = `
        <div class="leaderboard-row">
            <span></span>
            <span>Loading...</span>
            <span></span>
        </div>
    `;

    try {
        const { data, error } = await supabaseClient
            .from("results")
            .select("username, reaction_time, created_at")
            .order("reaction_time", { ascending: true })
            .limit(100);

        console.log("DATA:", data);
        console.log("ERROR:", error);

        if (error) {
            throw error;
        }

        leaderboardList.innerHTML = `
            <div class="leaderboard-header">
                <span>#</span>
                <span>Username</span>
                <span>Reaction Time</span>
            </div>
        `;

        if (!data || data.length === 0) {
            leaderboardList.innerHTML += `
                <div class="leaderboard-row">
                    <span></span>
                    <span>No scores yet.</span>
                    <span></span>
                </div>
            `;
            return;
        }

        data.forEach((score, index) => {
            const row = document.createElement("div");

            row.className = "leaderboard-row";

            row.innerHTML = `
                <span class="leaderboard-rank">
                    ${index + 1}
                </span>
                <span>
                    ${escapeHTML(score.username)}
                </span>
                <span class="leaderboard-time">
                    ${score.reaction_time} ms
                </span>
            `;

            leaderboardList.appendChild(row);
        });

    } catch (error) {
        console.error("REAL LEADERBOARD ERROR:", error);

        leaderboardList.innerHTML = `
            <div class="leaderboard-row">
                <span></span>
                <span>${escapeHTML(error.message || String(error))}</span>
                <span></span>
            </div>
        `;
    }
}

function switchScreen(hideScreen, showScreen) {
    hideScreen.classList.add("page-exit");

    setTimeout(() => {
        hideScreen.classList.add("hidden");
        hideScreen.classList.remove("page-exit");

        showScreen.classList.remove("hidden");
        showScreen.classList.add("page-enter");

        setTimeout(() => {
            showScreen.classList.remove("page-enter");
        }, 250);
    }, 120);
}

const navLogo = document.getElementById("nav-logo");

navLogo.addEventListener("click", (e) => {
    e.preventDefault();
    navTest.click();
});