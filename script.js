document.addEventListener("DOMContentLoaded", () => {
    const termsList = document.getElementById("terms-list");
    const searchInput = document.getElementById("search-input");

    // 1. Automatic alphabetical sorting
    if (termsList) {
        const items = Array.from(termsList.getElementsByTagName("li"));
        items.sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()));

        termsList.innerHTML = "";
        items.forEach(item => termsList.appendChild(item));
    }

    // 2. Search logic on Enter key press
    if (searchInput) {
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault(); // يمنع إعادة تحميل الصفحة عند الضغط على Enter

                const query = searchInput.value.toLowerCase().trim();
                const items = document.querySelectorAll("#terms-list li");

                items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    item.style.display = text.includes(query) ? "" : "none";
                });
            }
        });
    }

    // Update term count automatically
    const totalTerms = document.querySelectorAll('ol li').length;
    const countElement = document.getElementById('term-count');
    if (countElement) {
        countElement.textContent = `[ ${totalTerms} terms ]`;
    }

    const speakBtn = document.getElementById('speak-btn');
    const overviewText = document.querySelector('.term-overview');
    if (speakBtn && overviewText && 'speechSynthesis' in window) {
        let utterance = new SpeechSynthesisUtterance();
        utterance.lang = 'en-US';
        utterance.rate = 0.85;

        speakBtn.addEventListener('click', () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                speakBtn.innerText = '🔊 Listen';
            } else {
                utterance.text = overviewText.innerText;
                
                utterance.onend = () => { speakBtn.innerText = '[ 🔊 Listen ]'; };
                utterance.onerror = () => { speakBtn.innerText = '[ 🔊 Listen ]'; };

                window.speechSynthesis.speak(utterance);
                speakBtn.innerText = '[ ⏹️ Stop ]';
            }
        });
    }

});

// Focus search box on pressing '/'
document.addEventListener('keydown', (event) => {
    const searchInput = document.getElementById('search-input');
    // Check if the user is not already typing in an input
    if (event.key === '/' && document.activeElement !== searchInput) {
        event.preventDefault(); // Prevent typing '/' into the input
        searchInput.focus();
    }
});

document.addEventListener('keydown', (event) => {
    const searchInput = document.getElementById('search-input');
    
    //Ctrl Cmd + K
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyK') {
        event.preventDefault(); 
        searchInput.focus();
        searchInput.select();   
    }
});