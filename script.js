let rate_of_speach = 0.7;
// Helper function to find the longest word in a text line
function getLongestWord(text) {
    // Clean text from punctuation marks
    const cleanText = text.replace(/[^a-zA-Z0-9\s]/g, '');
    const words = cleanText.split(/\s+/);
    let longest = '';

    words.forEach(word => {
        if (word.length > longest.length) {
            longest = word;
        }
    });

    return longest;
}

// Function to sort the terms list alphabetically
function initTermsListSorting() {
    const termsList = document.getElementById("terms-list");
    if (!termsList) return;

    const items = Array.from(termsList.getElementsByTagName("li"));
    items.sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()));

    termsList.innerHTML = "";
    items.forEach(item => termsList.appendChild(item));
}

// Function to handle index page search input in real-time
function initSearchLogic() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    // Trigger search on every input change (typing or deleting)
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();
        const items = document.querySelectorAll("#terms-list li");

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? "" : "none";
        });
    });
}

// Function to update the total count of terms
function initTermCounter() {
    const totalTerms = document.querySelectorAll('ol li').length;
    const countElement = document.getElementById('term-count');
    
    if (countElement) {
        countElement.textContent = `[ ${totalTerms} terms ]`;
    }
}

// Function to handle global text-to-speech button
function initSpeechSynthesis() {
    const speakBtn = document.getElementById('speak-btn');
    const overviewText = document.querySelector('.term-overview');

    if (speakBtn && overviewText && 'speechSynthesis' in window) {
        let utterance = new SpeechSynthesisUtterance();
        utterance.lang = 'en-US';
        

        speakBtn.addEventListener('click', () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                speakBtn.innerText = '[ 🔊 Listen ]';
            } else {
                utterance.text = overviewText.innerText;
                
                utterance.onend = () => { speakBtn.innerText = '[ 🔊 Listen ]'; };
                utterance.onerror = () => { speakBtn.innerText = '[ 🔊 Listen ]'; };

                utterance.rate = rate_of_speach;
                window.speechSynthesis.speak(utterance);
                speakBtn.innerText = '[ ⏹️ Stop ]';
            }
        });
    }
}

// Function to handle interactive focus, cumulative, and sliding modes
function initFocusMode() {
    const practiceBtn = document.getElementById('practice-btn');
    const practiceBox = document.getElementById('practice-box');
    const practiceLine = document.getElementById('practice-line');
    const practicePrompt = document.getElementById('practice-prompt');
    const userInput = document.getElementById('user-input');
    const submitBtn = document.getElementById('submit-btn');
    const feedback = document.getElementById('practice-feedback');
    const switchModeBtn = document.getElementById('switch-mode-btn');
    const overviewSpans = document.querySelectorAll('.term-overview span');

    if (!practiceBtn || !overviewSpans.length) return;

    // Convert span texts into lines array
    const lines = Array.from(overviewSpans).map(span => span.innerText.trim());
    let currentIndex = 0;
    let targetWord = '';
    
    // Modes: 0 = Single Line, 1 = Cumulative, 2 = Sliding Window
    let currentMode = 0;

    // Helper text for mode button display
    function getModeLabel(mode) {
        if (mode === 0) return '[ 📈 Switch to Cumulative Mode ]';
        if (mode === 1) return '[ 📉 Switch to Sliding Mode ]';
        return '[ 🎯 Switch to Single Line Mode ]';
    }

    // Helper to lock inputs while speech is playing
    function disableInputs() {
        if (userInput) userInput.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
        if (feedback) {
            feedback.style.color = '#e2e8f0';
            feedback.innerText = '🎧 Listening... Please wait';
        }
    }

    // Helper to unlock inputs after speech finishes
    function enableInputs() {
        if (userInput) {
            userInput.disabled = false;
            userInput.focus();
        }
        if (submitBtn) submitBtn.disabled = false;
        if (feedback) feedback.innerText = '';
    }

    // Function to speak current displayed text and control input locks
    function speakText(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            // Lock inputs before starting audio
            disableInputs();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = rate_of_speach;

            // Enable inputs when speech ends
            utterance.onend = () => {
                enableInputs();
            };

            // Enable inputs on speech error to avoid blocking user
            utterance.onerror = () => {
                enableInputs();
            };

            window.speechSynthesis.speak(utterance);
        } else {
            // Fallback if SpeechSynthesis is not supported
            enableInputs();
        }
    }

    // Function to load current view step
    function loadStep(index) {
        if (index < lines.length) {
            let displayText = '';

            if (currentMode === 0) {
                // Mode 0: Single current line
                displayText = lines[index];
            } else if (currentMode === 1) {
                // Mode 1: Cumulative from start to index
                displayText = lines.slice(0, index + 1).join('\n');
            } else if (currentMode === 2) {
                // Mode 2: Sliding Window from current index to end
                displayText = lines.slice(index).join('\n');
            }

            // Target word is always the longest in the focus line (lines[index])
            targetWord = getLongestWord(lines[index]);
            
            practiceLine.innerText = displayText;
            
            if (practicePrompt) {
                practicePrompt.innerText = `Type "${targetWord}":`;
            }

            userInput.value = '';
            speakText(displayText);
        } else {
            practiceLine.innerText = '🎉 Excellent! You have completed all sentences.';
            document.querySelector('.practice-controls').style.display = 'none';
        }
    }

    // Toggle main practice box display
    practiceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (practiceBox.style.display === 'none') {
            practiceBox.style.display = 'block';
            currentIndex = 0;
            currentMode = 0;
            if (switchModeBtn) switchModeBtn.innerText = getModeLabel(currentMode);
            document.querySelector('.practice-controls').style.display = 'flex';
            loadStep(currentIndex);
        } else {
            practiceBox.style.display = 'none';
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }
    });

    // Switch between all 3 modes sequentially
    if (switchModeBtn) {
        switchModeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentMode = (currentMode + 1) % 3; // Cycle through 0, 1, 2
            switchModeBtn.innerText = getModeLabel(currentMode);
            
            currentIndex = 0; // Reset index on mode change
            document.querySelector('.practice-controls').style.display = 'flex';
            loadStep(currentIndex);
        });
    }

    // Check user text entry
    function checkAnswer() {
        if (userInput.disabled) return; // Prevent checking when locked

        const val = userInput.value.trim();
        if (val.toLowerCase() === targetWord.toLowerCase()) {
            feedback.style.color = '#68d391';
            feedback.innerText = 'Correct!';
            currentIndex++;
            setTimeout(() => {
                loadStep(currentIndex);
            }, 1000);
        } else {
            feedback.style.color = '#fc8181';
            feedback.innerText = 'Incorrect. Try again!';
            
            // Re-read active text block on failure
            let activeText = lines[currentIndex];
            if (currentMode === 1) activeText = lines.slice(0, currentIndex + 1).join('\n');
            if (currentMode === 2) activeText = lines.slice(currentIndex).join('\n');
            
            speakText(activeText);
        }
    }

    submitBtn.addEventListener('click', checkAnswer);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
}

// Function to setup global search shortcuts
function initSearchShortcuts() {
    document.addEventListener('keydown', (event) => {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        // Focus search input on '/' key press
        if (event.key === '/' && document.activeElement !== searchInput) {
            event.preventDefault(); // Prevent typing '/' inside input
            searchInput.focus();
        }

        // Focus search input on Ctrl+K or Cmd+K key press
        if ((event.ctrlKey || event.metaKey) && event.code === 'KeyK') {
            event.preventDefault(); 
            searchInput.focus();
            searchInput.select();   
        }
    });
}

// Function to handle interactive test mode (Cloze test)
function initTestMode() {
    const testBtn = document.getElementById('test-btn');
    const testBox = document.getElementById('test-box');
    const testSentence = document.getElementById('test-sentence');
    const testInput = document.getElementById('test-input');
    const testSubmitBtn = document.getElementById('test-submit-btn');
    const testFeedback = document.getElementById('test-feedback');
    const overviewText = document.querySelector('.term-overview');
    const overviewSpans = document.querySelectorAll('.term-overview span');

    if (!testBtn || !overviewSpans.length || !overviewText) return;

    // Convert span elements text into array
    const lines = Array.from(overviewSpans).map(span => span.innerText.trim());
    let currentIndex = 0;
    let targetWord = '';

    // Function to handle speech synthesis using global speech rate
    function speakText(text) {
        // Check if speech synthesis is supported
        if (!('speechSynthesis' in window)) return;

        // Cancel any ongoing speech before starting new speech
        window.speechSynthesis.cancel();

        // Create utterance instance and assign global speed rate
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate_of_speach;
        utterance.lang = 'en-US';

        // Speak the text with current rate
        window.speechSynthesis.speak(utterance);
    }

    // Function to load test step
    function loadStep(index) {
        if (index < lines.length) {
            const currentLine = lines[index];
            targetWord = getLongestWord(currentLine);

            // Replace target word with blank spaces
            const maskedLine = currentLine.replace(new RegExp(`\\b${targetWord}\\b`, 'gi'), '__________');
            
            // Text to speak without the target word
            const speakableLine = currentLine.replace(new RegExp(`\\b${targetWord}\\b`, 'gi'), '');

            testSentence.innerText = maskedLine;
            testInput.value = '';
            testFeedback.innerText = '';
            testInput.focus();

            speakText(speakableLine);
        } else {
            testSentence.innerText = '🎉 Excellent! You passed the test for all sentences.';
            document.querySelector('#test-box .practice-controls').style.display = 'none';
        }
    }

    // Toggle Test Me mode box and hide overview
    testBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Stop any running speech
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();

        if (testBox.style.display === 'none') {
            overviewText.style.display = 'none'; // Hide main overview text
            testBox.style.display = 'block';
            currentIndex = 0;
            document.querySelector('#test-box .practice-controls').style.display = 'flex';
            loadStep(currentIndex);
        } else {
            testBox.style.display = 'none';
            overviewText.style.display = 'block'; // Show overview text again
        }
    });

    // Check user answer
    function checkAnswer() {
        const val = testInput.value.trim();
        if (val.toLowerCase() === targetWord.toLowerCase()) {
            testFeedback.style.color = '#68d391';
            testFeedback.innerText = 'Correct!';
            currentIndex++;
            setTimeout(() => {
                loadStep(currentIndex);
            }, 1000);
        } else {
            testFeedback.style.color = '#fc8181';
            testFeedback.innerText = 'Incorrect. Try again!';
            
            // Re-read current sentence without the target word on error
            const currentLine = lines[currentIndex];
            const speakableLine = currentLine.replace(new RegExp(`\\b${targetWord}\\b`, 'gi'), '');
            speakText(speakableLine);
        }
    }

    testSubmitBtn.addEventListener('click', checkAnswer);
    testInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
}

// Function to inject speech rate toggle button into header
function initSpeechRateControl() {
    // Reference to the speaker button element
    const speakBtn = document.getElementById('speak-btn');
    if (!speakBtn) return;

    // Create speed control button element
    const speedBtn = document.createElement('a');
    speedBtn.href = '#';
    speedBtn.id = 'speed-btn';
    speedBtn.className = 'back-link';
    speedBtn.textContent = `[⚡ ${rate_of_speach}x]`;

    //Insert speed control button right after the speak button
    speakBtn.insertAdjacentElement('afterend', speedBtn);

    // Toggle speech rate on button click
    speedBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Cycle through speech rate options from 0.5 to 1.0
        if (rate_of_speach >= 1.0) {
            rate_of_speach = 0.5;
        } else {
            // Round to 1 decimal place to fix floating point math issues
            rate_of_speach = Math.round((rate_of_speach + 0.1) * 10) / 10;
        }

        // Update button text with current rate value
        speedBtn.textContent = `[⚡ ${rate_of_speach}x]`;
    });
}

// Function to append copyright notice after footer
function appendCopyright() {
    // Create the copyright element
    const copyrightParagraph = document.createElement("p");
    copyrightParagraph.className = "copyright";
    
    // Set text content and designer name
    copyrightParagraph.innerHTML = 'Designed by <span class="designer-name">Yasir Faur</span>, all rights reserved © 2026';

    // Find the footer element
    const footer = document.querySelector("footer");

    // Insert the paragraph right after the footer
    if (footer) {
        footer.insertAdjacentElement("afterend", copyrightParagraph);
    } else {
        document.body.appendChild(copyrightParagraph);
    }
}

// Function to append copyright and verify author name
function initApp() {
    // Create and attach copyright notice
    const copyrightParagraph = document.createElement("p");
    copyrightParagraph.className = "copyright";
    copyrightParagraph.innerHTML = 'Designed by <span class="designer-name">Yasir Faur</span>, all rights reserved © 2026';

    const footer = document.querySelector("footer");
    if (footer) {
        footer.insertAdjacentElement("afterend", copyrightParagraph);
    } else {
        document.body.appendChild(copyrightParagraph);
    }

    // Check if element or author name is removed/modified
    setInterval(() => {
        const copyrightElem = document.querySelector(".copyright");
        const designerNameElem = document.querySelector(".designer-name");

        // Verify both element existence and exact designer name text
        if (!copyrightElem || !designerNameElem || designerNameElem.textContent.trim() !== "Yasir Faur") {
            // Break page functionality if copyright or name is deleted/altered
            document.body.innerHTML = "";
            alert("Unauthorized copy detected.");
        }
    }, 3000);
}

// Function to block right-click and common developer tool shortcuts
function preventInspection() {
    // Disable right-click context menu
    document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        return false;
    });

    // Disable DevTools shortcuts
    document.addEventListener("keydown", (e) => {
        // Block F12 key (using both e.key and e.code for cross-browser support)
        if (e.key === "F12" || e.code === "F12") {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && (e.code === "KeyI" || e.code === "KeyJ" || e.code === "KeyC")) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Block Ctrl+U (View Source) and Ctrl+S (Save Page)
        if (e.ctrlKey && (e.code === "KeyU" || e.code === "KeyS")) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true); // Use capture phase to catch event before other listeners
}

// Function to handle terms list auto scroll
function initTermsListAutoScroll() {
    // Get list element
    const termsList = document.getElementById('terms-list');
    if (!termsList) return;

    let scrollInterval = null;

    // Start auto scroll logic
    const startAutoScroll = () => {
        if (scrollInterval) return;
        scrollInterval = setInterval(() => {
            // Check scroll reach end point accurately
            const isAtBottom = Math.ceil(termsList.scrollTop + termsList.clientHeight) >= termsList.scrollHeight;
            
            if (isAtBottom) {
                // Reset smoothly to top
                termsList.scrollTop = 0;
            } else {
                // Increment scroll position
                termsList.scrollTop += 1;
            }
        }, 40);
    };

    // Stop auto scroll logic
    const stopAutoScroll = () => {
        clearInterval(scrollInterval);
        scrollInterval = null;
    };

    // Begin scrolling
    startAutoScroll();

    // Event listeners for user interaction
    termsList.addEventListener('mouseenter', stopAutoScroll);
    termsList.addEventListener('mouseleave', startAutoScroll);
    termsList.addEventListener('touchstart', stopAutoScroll, { passive: true });
    termsList.addEventListener('touchend', startAutoScroll, { passive: true });
}



// A2-B1: Handle direct professional share using published GitHub link
function shareProfessionalAchievement(platform) {
 // Official published GitHub Pages link
    const githubUrl = encodeURIComponent("https://yasirfaur.github.io/ciscoFlash/");

    let shareUrl = "";

    if (platform === 'facebook') {
        // Facebook sharer endpoint
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${githubUrl}`;
    } else if (platform === 'linkedin') {
        // LinkedIn share endpoint
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${githubUrl}`;
    }

    // Open popup share window
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=500');
    }
}


// Main event handler to initialize all functions
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize core feature systems
    try { initSpeechRateControl(); } catch (e) { console.error(e); }
    try { initTermsListSorting(); } catch (e) { console.error(e); }
    try { initSearchLogic(); } catch (e) { console.error(e); }
    try { initTermCounter(); } catch (e) { console.error(e); }
    try { initSpeechSynthesis(); } catch (e) { console.error(e); }
    try { initFocusMode(); } catch (e) { console.error(e); }
    try { initSearchShortcuts(); } catch (e) { console.error(e); }
    try { initTestMode(); } catch (e) { console.error(e); }


    // 2. Initialize copyright & integrity checks
    try { initApp(); } catch (e) { console.error(e); }

    // 3. Apply inspection protection last
    try { preventInspection(); } catch (e) { console.error(e); }

    try { initTermsListAutoScroll(); } catch (e) { console.error(e); }
});