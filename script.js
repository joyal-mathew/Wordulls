(() => {
    "use strict";

    const wordull = document.getElementById("wordull");
    const errorMessage = document.getElementById("error");
    const helpBox = document.getElementById("help");
    const overlay = document.getElementById("overlay");
    const letters = [];

    let hints = null;
    let numGuesses = 0;
    let chosenWord = window.wordullChoices[Math.random() * window.wordullChoices.length | 0].split("");
    let cursor = null;
    let unerror = null;
    let tempCursor = null;

    console.log(chosenWord);

    document.getElementById("helpButton").onclick = showHelp;

    document.getElementById("helpClose").onclick = () => {
        helpBox.removeAttribute("shown");
        overlay.removeAttribute("shown");
        cursor = tempCursor;
        if (cursor !== null) letters[cursor].setAttribute("highlight", "");
    };

    addEventListener("keypress", e => {
        if (cursor !== null && e.code.startsWith("Key") && cursor < letters.length) {
            letters[cursor].innerText = e.code.slice(3);
            letters[cursor].removeAttribute("highlight");
            letters[cursor].setAttribute("occupied", "");
            ++cursor;
            if (cursor < letters.length) letters[cursor].setAttribute("highlight", "");
        }
    });

    addEventListener("keydown", e => {
        if (cursor === null) return;

        switch (e.code) {
            case "Backspace":
                if (cursor < letters.length) letters[cursor].removeAttribute("highlight");
                if (cursor > 0) --cursor;
                letters[cursor].removeAttribute("occupied");
                letters[cursor].setAttribute("highlight", "");
                break;
            case "Enter":
                if (cursor >= letters.length) {
                    const guess = letters.map(letter => letter.innerText).join("");

                    if (!window.wordullWords.has(guess)) {
                        sendError("Not a word");
                        break;
                    }

                    ++numGuesses;

                    if (checkGuess()) {
                        cursor = null;
                        addWin();
                        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                        break;
                    }

                    letters.splice(0, letters.length);
                    addGuess();
                    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                }
                else {
                    sendError("Not enough letters");
                }
                break;
        }
    });

    addGuess();

    if (localStorage.getItem("wordulls") === null) {
        showHelp();
    }

    localStorage.setItem("wordulls", "");

    function checkGuess() {
        const guess = letters.map(letter => letter.innerText);
        const correctMask = guess.map((l, i) => l === chosenWord[i]);
        const remainingLetters = new Set(chosenWord.filter((_, i) => !correctMask[i]));
        const incorrectLetters = new Set(guess.filter((_, i) => !correctMask[i]));
        const correct = correctMask.reduce((a, b) => a + b);
        const present = Array.from(incorrectLetters).filter(l => remainingLetters.has(l)).length;

        addHint(correct, "green");
        addHint(present, "#cccc00");

        return correct === chosenWord.length;
    }

    function sendError(message) {
        letters.forEach(letter => letter.setAttribute("error", ""));
        errorMessage.innerText = message;
        errorMessage.setAttribute("error", "");

        if (unerror !== null) clearTimeout(unerror);
        unerror = setTimeout(() => {
            unerror = null;
            letters.forEach(letter => letter.removeAttribute("error"));
            errorMessage.removeAttribute("error");
        }, 512);
    }

    function addHint(num, color) {
        const hint = document.createElement("div");

        hint.innerText = num;
        hint.classList.add("box");
        hint.classList.add("hint");
        hint.style.backgroundColor = color;

        hints.appendChild(hint);
    }

    function makeError(message) {
        const err = document.createElement("div");

        err.innerText = message;
        err.classList.add("err");

        return err;
    }

    function addGuess() {
        const guess = document.createElement("div");
        const word = document.createElement("div");
        hints = document.createElement("div");

        for (let i = 0; i < chosenWord.length; ++i) {
            letters.push(document.createElement("div"));
        }

        guess.classList.add("guess");
        word.classList.add("word");
        hints.classList.add("hints");
        letters.forEach(letter => letter.classList.add("box"));
        letters.forEach(letter => letter.classList.add("letter"));

        wordull.removeChild(errorMessage);
        wordull.appendChild(guess);
        wordull.appendChild(errorMessage);
        guess.appendChild(word);
        guess.appendChild(hints);
        letters.forEach(letter => word.appendChild(letter));

        cursor = 0;
        letters[cursor].setAttribute("highlight", "");
    }

    function addWin() {
        const win = document.createElement("div");
        const message = document.createElement("span");
        const again = document.createElement("button");

        win.classList.add("win");
        message.innerText = `You won in ${numGuesses} guess${numGuesses === 1 ? "" : "es"}!`;
        again.classList.add("again");
        again.innerText = "Play Again";

        again.onclick = reset;

        win.appendChild(message);
        win.appendChild(again);
        wordull.appendChild(win);
    }

    function showHelp() {
        helpBox.setAttribute("shown", "");
        overlay.setAttribute("shown", "");
        if (cursor !== null) letters[cursor].removeAttribute("highlight");
        tempCursor = cursor;
        cursor = null;
    }

    function reset() {
        letters.splice(0, letters.length);
        wordull.replaceChildren(errorMessage);

        numGuesses = 0;
        chosenWord = window.wordullChoices[Math.random() * window.wordullChoices.length | 0].split("");

        addGuess();
    }
})();
