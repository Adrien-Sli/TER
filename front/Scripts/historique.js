// Variables globales
let currentHistoryId = null;
let histories = JSON.parse(localStorage.getItem('chatHistory')) || [];
let lastHistoryId = parseInt(localStorage.getItem('historyLastId')) || 0;

// Corriger les historiques existants sans ID
let idModified = false;
histories = histories.map((h, index) => {
    if (!h.id) {
        lastHistoryId += 1;
        idModified = true;
        return { ...h, id: lastHistoryId };
    }
    return h;
});

// Si des ID ont été ajoutés, sauvegarder les données mises à jour
if (idModified) {
    localStorage.setItem('chatHistory', JSON.stringify(histories));
    localStorage.setItem('historyLastId', lastHistoryId);
}

// Éléments du DOM
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('historyModal');
const closeBtn = document.querySelector('.close');
const historyForm = document.getElementById('historyForm');
const searchInput = document.getElementById('searchInput');
const historyTableBody = document.getElementById('historyTable').getElementsByTagName('tbody')[0];

// Ouvrir le modal pour ajouter un historique
addBtn.addEventListener('click', () => {
    currentHistoryId = null;
    document.getElementById('modalTitle').textContent = 'Ajouter un Historique';
    historyForm.reset();
    modal.style.display = 'block';
});

// Fermer le modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Fermer le modal quand on clique en dehors
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Gérer la soumission du formulaire (ajout/modification)
historyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const historyData = {
        date: document.getElementById('historyDate').value,
        user: document.getElementById('historyUser').value || 'user',
        message: document.getElementById('historyMessage').value,
        response: document.getElementById('historyResponse').value
    };

    if (currentHistoryId) {
        // Modification
        const index = histories.findIndex(h => h.id === currentHistoryId);
        if (index !== -1) {
            histories[index] = {
                ...historyData,
                id: currentHistoryId,
                timestamp: new Date(historyData.date).toISOString()
            };
        }
    } else {
        // Ajout
        lastHistoryId += 1;
        localStorage.setItem('historyLastId', lastHistoryId);
        const newId = lastHistoryId;
        histories.push({
            ...historyData,
            id: newId,
            timestamp: new Date(historyData.date).toISOString()
        });
    }

    // Sauvegarder dans le localStorage
    localStorage.setItem('chatHistory', JSON.stringify(histories));

    renderHistoryTable();
    modal.style.display = 'none';
});

// Rendre le tableau des historiques
function renderHistoryTable(filteredHistories = null) {
    const data = filteredHistories || histories;
    historyTableBody.innerHTML = '';

    data.forEach(history => {
        const row = document.createElement('tr');

        const dateObj = new Date(history.timestamp || history.date);
        const formattedDate = dateObj.toLocaleString('fr-FR');

        row.innerHTML = `
            <td>${history.id || ''}</td>
            <td>${formattedDate}</td>
            <td>${history.user || 'user'}</td>
            <td>${history.message || history.question || ''}</td>
            <td>${history.response || history.answer || ''}</td>
            <td>
                <button class="editBtn" data-id="${history.id}">Modifier</button>
                <button class="deleteBtn btn-danger" data-id="${history.id}">Supprimer</button>
            </td>
        `;

        historyTableBody.appendChild(row);
    });
}

// Délégation d'événements sur le tbody pour gérer modifier/supprimer
historyTableBody.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('editBtn')) {
        const id = parseInt(target.getAttribute('data-id'));
        editHistory(id);
    } else if (target.classList.contains('deleteBtn')) {
        const id = parseInt(target.getAttribute('data-id'));
        if (confirm('Êtes-vous sûr de vouloir supprimer cet historique ?')) {
            deleteHistory(id);
        }
    }
});

// Modifier un historique
function editHistory(id) {
    const history = histories.find(h => h.id === id);
    if (history) {
        currentHistoryId = id;
        document.getElementById('modalTitle').textContent = 'Modifier l\'Historique';
        const dt = history.timestamp ? new Date(history.timestamp) : new Date(history.date);
        const localDatetime = dt.toISOString().slice(0, 16);
        document.getElementById('historyDate').value = localDatetime;
        document.getElementById('historyUser').value = history.user || 'user';
        document.getElementById('historyMessage').value = history.message || history.question || '';
        document.getElementById('historyResponse').value = history.response || history.answer || '';
        modal.style.display = 'block';
    }
}

// Supprimer un historique
function deleteHistory(id) {
    histories = histories.filter(h => h.id !== id);
    localStorage.setItem('chatHistory', JSON.stringify(histories));
    renderHistoryTable();
}

// Recherche dans les historiques
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm) {
        const filtered = histories.filter(history =>
            (history.user && history.user.toLowerCase().includes(searchTerm)) ||
            (history.message && history.message.toLowerCase().includes(searchTerm)) ||
            (history.question && history.question.toLowerCase().includes(searchTerm)) ||
            (history.response && history.response.toLowerCase().includes(searchTerm)) ||
            (history.answer && history.answer.toLowerCase().includes(searchTerm))
        );
        renderHistoryTable(filtered);
    } else {
        renderHistoryTable();
    }
});

// Initialiser le tableau avec les données du localStorage
renderHistoryTable();
