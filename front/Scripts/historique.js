// Variables globales
let currentHistoryId = null;
let histories = [
    {
        id: 1,
        date: '2023-05-15T14:30',
        user: 'user123',
        message: 'Bonjour, comment ça va ?',
        response: 'Je vais bien, merci ! Et vous ?'
    },
    {
        id: 2,
        date: '2023-05-15T15:45',
        user: 'user456',
        message: 'Quel est le temps aujourd\'hui ?',
        response: 'Je ne peux pas accéder aux données météo en temps réel.'
    }
];

// Éléments du DOM
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('historyModal');
const closeBtn = document.querySelector('.close');
const historyForm = document.getElementById('historyForm');
const searchInput = document.getElementById('searchInput');
const historyTable = document.getElementById('historyTable').getElementsByTagName('tbody')[0];

// Ouvrir le modal pour ajouter un historique
addBtn.addEventListener('click', () => {
    currentHistoryId = null;
    document.getElementById('modalTitle').textContent = 'Ajouter un Historique';
    document.getElementById('historyForm').reset();
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
        user: document.getElementById('historyUser').value,
        message: document.getElementById('historyMessage').value,
        response: document.getElementById('historyResponse').value
    };
    
    if (currentHistoryId) {
        // Modification
        const index = histories.findIndex(h => h.id === currentHistoryId);
        if (index !== -1) {
            histories[index] = { ...historyData, id: currentHistoryId };
        }
    } else {
        // Ajout
        const newId = histories.length > 0 ? Math.max(...histories.map(h => h.id)) + 1 : 1;
        histories.push({ ...historyData, id: newId });
    }
    
    renderHistoryTable();
    modal.style.display = 'none';
});

// Rendre le tableau des historiques
function renderHistoryTable(filteredHistories = null) {
    const data = filteredHistories || histories;
    historyTable.innerHTML = '';
    
    data.forEach(history => {
        const row = document.createElement('tr');
        
        // Formatage de la date pour l'affichage
        const dateObj = new Date(history.date);
        const formattedDate = dateObj.toLocaleString('fr-FR');
        
        row.innerHTML = `
            <td>${history.id}</td>
            <td>${formattedDate}</td>
            <td>${history.user}</td>
            <td>${history.message}</td>
            <td>${history.response}</td>
            <td>
                <button class="editBtn" data-id="${history.id}">Modifier</button>
                <button class="deleteBtn btn-danger" data-id="${history.id}">Supprimer</button>
            </td>
        `;
        
        historyTable.appendChild(row);
    });
    
    // Ajouter les événements aux boutons
    document.querySelectorAll('.editBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            editHistory(id);
        });
    });
    
    document.querySelectorAll('.deleteBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            if (confirm('Êtes-vous sûr de vouloir supprimer cet historique ?')) {
                deleteHistory(id);
            }
        });
    });
}

// Modifier un historique
function editHistory(id) {
    const history = histories.find(h => h.id === id);
    if (history) {
        currentHistoryId = id;
        document.getElementById('modalTitle').textContent = 'Modifier l\'Historique';
        document.getElementById('historyId').value = history.id;
        document.getElementById('historyDate').value = history.date;
        document.getElementById('historyUser').value = history.user;
        document.getElementById('historyMessage').value = history.message;
        document.getElementById('historyResponse').value = history.response;
        modal.style.display = 'block';
    }
}

// Supprimer un historique
function deleteHistory(id) {
    histories = histories.filter(h => h.id !== id);
    renderHistoryTable();
}

// Recherche dans les historiques
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm) {
        const filtered = histories.filter(history => 
            history.user.toLowerCase().includes(searchTerm) ||
            history.message.toLowerCase().includes(searchTerm) ||
            history.response.toLowerCase().includes(searchTerm)
        );
        renderHistoryTable(filtered);
    } else {
        renderHistoryTable();
    }
});

// Initialiser le tableau
renderHistoryTable();