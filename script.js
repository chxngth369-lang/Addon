function updateGallery() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const activeNavItem = document.querySelector('.nav-item.active');
    const activeCategory = activeNavItem ? activeNavItem.getAttribute('data-cat') : 'all';
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        const category = card.getAttribute('data-category');
        const isCategoryMatch = (activeCategory === 'all' || category === activeCategory);
        const isSearchMatch = title.includes(searchTerm);

        card.style.display = (isCategoryMatch && isSearchMatch) ? "flex" : "none";
    });
}

document.getElementById('searchInput').addEventListener('keyup', updateGallery);

function filterScripts(category, element) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    updateGallery();
}

function openModal(title, category, link) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalCategory').innerText = category;
    document.getElementById('scriptLink').href = link;
    document.getElementById('scriptModal').style.display = "block";
}

function closeModal() {
    document.getElementById('scriptModal').style.display = "none";
}

window.onclick = (e) => { if (e.target.className === 'modal') closeModal(); }
