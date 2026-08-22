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
});