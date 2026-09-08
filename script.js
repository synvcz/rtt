const startScreen = document.getElementById("start-screen");
const testScreen = document.getElementById("test-screen");
const resultScreen = document.getElementById("result-screen");

const reactionBox = document.getElementById("reaction-box");

const resultTime = document.getElementById("result-time");
const resultRating = document.getElementById("result-rating");

const tryAgain = document.getElementById("try-again");
const tooSoonButton = document.getElementById("too-soon-button");

let startTime = 0;
let timeout;
let waiting = false;
let ready = false;


// Start the test

function startTest() {

    startScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");

    testScreen.classList.remove("hidden");

    reactionBox.classList.remove("green");

    reactionBox.querySelector("h2").textContent = "Wait for green...";

    waiting = true;
    ready = false;


    // Random delay: 1 - 5 seconds

    const delay = Math.random() * 4000 + 1000;

    timeout = setTimeout(() => {

        reactionBox.classList.add("green");

        reactionBox.querySelector("h2").textContent = "CLICK!";

        startTime = performance.now();

        waiting = false;
        ready = true;

    }, delay);
}


// Click reaction box

reactionBox.addEventListener("click", () => {

    // Clicked too early

    if (waiting) {

    clearTimeout(timeout);

    reactionBox.querySelector("h2").textContent = "Too soon!";

    waiting = false;

    tooSoonButton.classList.remove("hidden");

    return;
    }


    // Correct click

    if (ready) {

        const reactionTime =
            Math.round(performance.now() - startTime);

        showResult(reactionTime);
    }
});


// Show result

function showResult(time) {

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
        resultRating.textContent = " Average";
    }
    else {
        resultRating.textContent = "Slow";
    }

    ready = false;
}


// Try again

tryAgain.addEventListener("click", startTest);


// Clicking anywhere starts the first test

startScreen.addEventListener("click", startTest);

tooSoonButton.addEventListener("click", () => {

    tooSoonButton.classList.add("hidden");

    startTest();

});