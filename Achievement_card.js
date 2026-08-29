// Stage 2 Focus Test Logic (Line by line longest word validation)
let currentLineIndex = 0;
let stage2Sentences = [];
let targetLongestWord = "";

//Stage 3 Variables
let stage3RemainingSentences = [];
let stage3TargetWord = "";

//Stage 4 Variables
let stage4CurrentIndex = 0; // Track added line index
let stage4VisibleSentences = []; // Cumulative array of sentences

// Helper function to find the longest word in a sentence (ignoring punctuation)
function getLongestWord(sentence) {
    // A2-B1: Remove special characters and split text into words
    const cleanSentence = sentence.replace(/[^\w\s]/gi, '');
    const words = cleanSentence.split(/\s+/);
    
    let longest = "";
    words.forEach(word => {
        if (word.length > longest.length) {
            longest = word;
        }
    });
    return longest;
}

// Speak a specific text using SpeechSynthesis
function speakText(text, onEndCallback) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.7;

        if (onEndCallback) {
            utterance.onend = onEndCallback;
        }

        window.speechSynthesis.speak(utterance);
    }
}

// Extract lines and prepare Stage 2
function startStage2() {
    const descContainer = document.getElementById("card-term-desc");
    const spans = descContainer ? descContainer.querySelectorAll("span") : [];

    // Extract clean sentences from rendered HTML spans
    stage2Sentences = [];
    spans.forEach(span => {
        if (span.innerText.trim() !== "") {
            stage2Sentences.push(span.innerText.trim());
        }
    });

    currentLineIndex = 0;

    if (stage2Sentences.length > 0) {
        processCurrentLine();
    } else {
        console.error("No spans found for Stage 2 processing.");
    }
}

//Render line, speak text, and show longest word as placeholder for quick warm-up response
function processCurrentLine() {
    const feedbackEl = document.getElementById("stage2-feedback");
    const inputEl = document.getElementById("longest-word-input");
    const lineDisplay = document.getElementById("stage2-line-text");

    if (currentLineIndex < stage2Sentences.length) {
        const currentSentence = stage2Sentences[currentLineIndex];
        
        targetLongestWord = getLongestWord(currentSentence);        
        lineDisplay.innerText = currentSentence;
        inputEl.value = "";        
        inputEl.placeholder = "";
        feedbackEl.innerText = "";

        inputEl.focus();
        
        speakText(currentSentence, () => {
        speakText(`Type: ${targetLongestWord}`); 
        inputEl.placeholder = `Type: ${ targetLongestWord}`;
        });

    } else {
        // Stage 2 Complete -> Announce and switch to Stage 3 after short delay
        lineDisplay.innerText = "Stage 2 Completed.";
        document.getElementById("stage2-input-area").style.display = "none";
        
        speakText("Stage 2 completed.", () => {
            setTimeout(() => {
                switchToStage3();
            }, 1000);
        });
    }
}

//Function to switch interface from Stage 2 to Stage 3
function switchToStage3() {
    const stage2Box = document.getElementById("term-display-box-stage2");
    const stage3Box = document.getElementById("term-display-box-stage3");

    if (stage2Box && stage3Box) {
        stage2Box.style.display = "none";
        stage3Box.style.display = "block";
        startStage3(); // Call initial logic for Stage 3
    }
}

//Stage 3 initial function
function startStage3() {
    stage3RemainingSentences = [...stage2Sentences];

    // Speak welcome message first, then trigger line processing on end
    speakText("Welcome to Stage 3", () => {
        processStage3Round();
    });
}

//Render remaining lines, find target word from line 1, and speak full text
function processStage3Round() {
    const linesContainer = document.getElementById("stage3-lines-container");
    const inputEl = document.getElementById("stage3-word-input");
    const feedbackEl = document.getElementById("stage3-feedback");

    if (stage3RemainingSentences.length > 0) {
        // Render all remaining sentences
        linesContainer.innerHTML = "";
        stage3RemainingSentences.forEach(sentence => {
            const span = document.createElement("span");
            span.innerText = sentence;
            span.style.display = "block";
            span.style.marginBottom = "6px";
            linesContainer.appendChild(span);
        });

        // Find longest word from the top remaining line
        const firstLine = stage3RemainingSentences[0];
        stage3TargetWord = getLongestWord(firstLine);

        // Update UI: Show target word inside placeholder for warm-up interaction
        inputEl.value = "";
        inputEl.placeholder = "";
        feedbackEl.innerText = "";
        inputEl.focus();

        // Read all remaining sentences together
        const fullTextToRead = stage3RemainingSentences.join(". ");
        speakText(fullTextToRead, () => {
        speakText(`Type: ${stage3TargetWord}`);
        inputEl.placeholder = `Type: ${stage3TargetWord}`;
        });
    } else {
        // Stage 3 Complete -> Transition to Stage 4
        linesContainer.innerText = "Stage 3 Completed!";
        document.getElementById("stage3-input-area").style.display = "none";
        
        speakText("Great job! Stage 3 completed.", () => {
            setTimeout(() => {
                switchToStage4();
            }, 1000);
        });
    }
}

//Validate Stage 3 input
function validateStage3Word() {
    const userInput = document.getElementById("stage3-word-input").value.trim();
    const feedbackEl = document.getElementById("stage3-feedback");

    if (userInput.toLowerCase() === stage3TargetWord.toLowerCase()) {
        feedbackEl.style.color = "#f3f3f3";
        feedbackEl.innerText = "Correct.";

        // 5. If correct -> Remove top line and re-process remaining lines
        setTimeout(() => {
            stage3RemainingSentences.shift(); // Remove top line
            processStage3Round();
        }, 1000);
    } else {
        // 4. If wrong -> Re-read all remaining lines and ask again
        feedbackEl.style.color = "#ff4d4d";
        feedbackEl.innerText = "Incorrect. Listen to full text again!";
        
        const fullTextToRead = stage3RemainingSentences.join(". ");
        speakText(fullTextToRead);
    }
}

//Function to switch interface from Stage 3 to Stage 4
function switchToStage4() {
    const stage3Box = document.getElementById("term-display-box-stage3");
    const stage4Box = document.getElementById("term-display-box-stage4");

    if (stage3Box && stage4Box) {
        stage3Box.style.display = "none";
        stage4Box.style.display = "block";
        startStage4(); // Call initial logic for Stage 4
    }
}

//Stage 4 initial function
function startStage4() {
    stage4CurrentIndex = 0;
    stage4VisibleSentences = [];
    
    speakText("Welcome to Stage 4, the final challenge!", () => {
        addNewLineAndProcess();
    });
}

//Add next line, update container, and speak full visible text
function addNewLineAndProcess() {
    const linesContainer = document.getElementById("stage4-lines-container");
    const inputEl = document.getElementById("stage4-sentence-input");
    const feedbackEl = document.getElementById("stage4-feedback");

    if (stage4CurrentIndex < stage2Sentences.length) {
        // Add current sentence to visible list
        stage4VisibleSentences.push(stage2Sentences[stage4CurrentIndex]);

        // Render cumulative lines
        linesContainer.innerHTML = "";
        stage4VisibleSentences.forEach(sentence => {
            const span = document.createElement("span");
            span.innerText = sentence;
            span.style.display = "block";
            span.style.marginBottom = "6px";
            linesContainer.appendChild(span);
        });

        // Reset UI inputs
        inputEl.value = "";
        inputEl.placeholder = "";
        feedbackEl.innerText = "";
        inputEl.focus();

        // Read all visible sentences built so far
        const textToRead = stage4VisibleSentences.join(". ");
        speakText(textToRead, () => {
        speakText("Type the last sentence."); 
        inputEl.placeholder = "Type the last sentence...";
        });
    } else {
        //Hide Stage 4 box and show final achievement card container
        const stage4Box = document.getElementById("term-display-box-stage4");
        const finalBox = document.getElementById("stage-final-container"); // Change ID to match your card wrapper

        if (stage4Box) stage4Box.style.display = "none";
        if (finalBox) finalBox.style.display = "block";

        // Speak final congratulation message
        speakText("Congratulations! You have successfully mastered all stages.", () => {
            // Optional: trigger html2canvas or card render logic here if needed
        });
    }
}

//Validate user input for the LAST sentence only
function validateStage4Sentence() {
    const userInput = document.getElementById("stage4-sentence-input").value.trim();
    const feedbackEl = document.getElementById("stage4-feedback");
    
    // Target is always the last added sentence
    const targetSentence = stage4VisibleSentences[stage4VisibleSentences.length - 1];

    if (userInput.toLowerCase() === targetSentence.toLowerCase()) {
        feedbackEl.style.color = "#f3f3f3";
        feedbackEl.innerText = "Correct!";

        // Move to next line
        stage4CurrentIndex++;
        setTimeout(() => {
            addNewLineAndProcess();
        }, 1000);
    } else {
        // Incorrect input -> Re-read only the LAST sentence for correction
        feedbackEl.style.color = "#ff4d4d";
        feedbackEl.innerText = "Incorrect. Listen to the last sentence again!";
        
        speakText(targetSentence);
    }
}


// Validate user input against target word
function validateLongestWord() {
    const userInput = document.getElementById("longest-word-input").value.trim();
    const feedbackEl = document.getElementById("stage2-feedback");

    if (userInput.toLowerCase() === targetLongestWord.toLowerCase()) {
        feedbackEl.style.color = "#f3f3f3";
        feedbackEl.innerText = "Correct!";
        
        setTimeout(() => {
            currentLineIndex++;
            processCurrentLine();
        }, 1000);
    } else {
        feedbackEl.style.color = "#ff4d4d";
        feedbackEl.innerText = "Incorrect. Listen again and try!";
        
        // Re-read current sentence on failure
        speakText(stage2Sentences[currentLineIndex]);
    }
}

// Function to handle switching elements between Stage 1 and Stage 2
function switchToStage2() {
    const stage1Box = document.querySelector('.stage1');
    const stage2Box = document.querySelector('.stage2');

    if (stage1Box && stage2Box) {
        stage1Box.style.display = 'none';
        stage2Box.style.display = 'block';
        startStage2(); // Trigger stage 2 logic after element swap
    }
}

// Function to start test duration timer (HH:MM:SS)
let timerInterval = null;
function startTimer() {
    let totalSeconds = 0;
    const timerDisplay = document.getElementById("test-timer");

    if (!timerDisplay) return;

    timerInterval = setInterval(() => {
        totalSeconds++;

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        timerDisplay.innerText = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }, 1000);
}

// Function to handle global text-to-speech button for Stage 1
function initSpeechSynthesis07() {
    const speakBtn = document.getElementById('speak-btn-07');
    const overviewText = document.getElementById('card-term-desc'); // Target specific description container

    if (speakBtn && overviewText && 'speechSynthesis' in window) {
        let utterance = new SpeechSynthesisUtterance();
        utterance.lang = 'en-US';

        speakBtn.addEventListener('click', (e) => {
            e.preventDefault();

            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                speakBtn.innerText = ' Stage 1: 🔊 Listen ';
            } else {
                utterance.text = overviewText.innerText;
                utterance.rate = 0.7;

                utterance.onend = () => { 
                    speakBtn.innerText = ' Stage 1: 🔊 Listen '; 
                    switchToStage2();
                };

                utterance.onerror = () => { 
                    speakBtn.innerText = ' Stage 1: 🔊 Listen '; 
                };

                window.speechSynthesis.speak(utterance);
                speakBtn.innerText = ' Stage 1: ⏹️ Stop ';
            }
        });
    }
}

// Load dataset from session storage
function load_data(){
    const currentTerm = sessionStorage.getItem("activeTermTitle");
    const currentDesc = sessionStorage.getItem("activeTermDesc");

    if (currentTerm && currentDesc) {
        document.getElementById("card-term-title").innerText = currentTerm;
        
        const descContainer = document.getElementById("card-term-desc");
        descContainer.innerHTML = currentDesc;

        const spans = descContainer.querySelectorAll("span");
        spans.forEach(span => {
            span.style.display = "block";
            span.style.marginBottom = "6px";
        });
    }
}

function stage2(){
const checkBtn = document.getElementById("check-word-btn");
    const inputEl = document.getElementById("longest-word-input");

    if (checkBtn) {
        checkBtn.addEventListener("click", validateLongestWord);
    }

    if (inputEl) {
        inputEl.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                validateLongestWord();
            }
        });
    }
}

function stage3(){
    const checkBtnStage3 = document.getElementById("stage3-check-btn");
    const inputElStage3 = document.getElementById("stage3-word-input");

    if (checkBtnStage3) {
        checkBtnStage3.addEventListener("click", validateStage3Word);
    }

    if (inputElStage3) {
        inputElStage3.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                validateStage3Word();
            }
        });
    }
}

function stage4(){
    const checkBtnStage4 = document.getElementById("stage4-check-btn");
    const inputElStage4 = document.getElementById("stage4-sentence-input");

    if (checkBtnStage4) {
        checkBtnStage4.addEventListener("click", validateStage4Sentence);
    }

    if (inputElStage4) {
        inputElStage4.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                validateStage4Sentence();
            }
        });
    }
}

//Generate canvas and download card as PNG
function downloadAchievementCard() {
    const cardElement = document.getElementById("achievement-card");

    if (!cardElement) {
        console.error("Card element not found");
        return;
    }

    // Check if library is loaded correctly
    if (typeof html2canvas === "undefined") {
        alert("Library is still loading or URL is incorrect!");
        return;
    }

    html2canvas(cardElement, {
        backgroundColor: "#14254c",
        scale: 2
    }).then((canvas) => {
        const imageURI = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "Achievement_Certificate.png";
        link.href = imageURI;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }).catch((err) => {
        console.error("Error generating canvas:", err);
    });
}

//Bind button click event
function Achievement_card() {
    const downloadBtn = document.getElementById("download-card-btn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", downloadAchievementCard);
    }
}

// Main DOM event setup
document.addEventListener("DOMContentLoaded", () => {
    load_data();
    initSpeechSynthesis07();
    startTimer();
    stage2();
    stage3();
    stage4();
    Achievement_card();
});