//
// Le script suivant gère l'intégralité des actions liés à l'affichage, la conservation et la modification des conversations via l'historique
//

// Variables globales
let currentHistoryId = null;
let histories = JSON.parse(localStorage.getItem('chatHistory')) || [];
let lastHistoryId = parseInt(localStorage.getItem('historyLastId')) || 0;

let idModified = false;
histories = histories.map((h) => {
    if (!h.id) {
        lastHistoryId += 1;
        idModified = true;
        return { ...h, id: lastHistoryId };
    }
    return h;
});

if (idModified) {
    localStorage.setItem('chatHistory', JSON.stringify(histories));
    localStorage.setItem('historyLastId', lastHistoryId);
}

const modal = document.getElementById('historyModal');
const closeBtn = document.querySelector('.close');
const historyForm = document.getElementById('historyForm');
const searchInput = document.getElementById('searchInput');
const historyTableBody = document.getElementById('historyTable').getElementsByTagName('tbody')[0];
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
const selectAllCheckbox = document.getElementById('selectAll');

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

historyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const historyData = {
        date: document.getElementById('historyDate').value,
        user: document.getElementById('historyUser').value || 'user',
        message: document.getElementById('historyMessage').value,
        response: document.getElementById('historyResponse').value
    };

    if (currentHistoryId) {
        const index = histories.findIndex(h => h.id === currentHistoryId);
        if (index !== -1) {
            histories[index] = {
                ...historyData,
                id: currentHistoryId,
                timestamp: new Date(historyData.date).toISOString()
            };
        }
    } else {
        lastHistoryId += 1;
        localStorage.setItem('historyLastId', lastHistoryId);
        const newId = lastHistoryId;
        histories.push({
            ...historyData,
            id: newId,
            timestamp: new Date(historyData.date).toISOString()
        });
    }

    localStorage.setItem('chatHistory', JSON.stringify(histories));
    renderHistoryTable();
    modal.style.display = 'none';
});

function renderHistoryTable(filteredHistories = null) {
    const data = filteredHistories || histories;
    historyTableBody.innerHTML = '';

    data.forEach(history => {
        const row = document.createElement('tr');

        const dateObj = new Date(history.timestamp || history.date);
        const formattedDate = dateObj.toLocaleString('fr-FR');

        row.innerHTML = `
            <td>
                <label class="checkbox-label">
                    <input type="checkbox" class="selectCheckbox" data-id="${history.id}">
                    <span class="custom-checkbox"></span>
                </label>
            </td>
            <td>${history.id || ''}</td>
            <td>${formattedDate}</td>
            <td>${history.user || 'user'}</td>
            <td>${history.message || history.question || ''}</td>
            <td>${history.response || history.answer || ''}</td>
            <td>
                <button class="editBtn btn-primary" data-id="${history.id}">Modifier</button>
            </td>
        `;

        historyTableBody.appendChild(row);
    });
}

historyTableBody.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('editBtn')) {
        const id = parseInt(target.getAttribute('data-id'));
        editHistory(id);
    }
});

function editHistory(id) {
    const history = histories.find(h => h.id === id);
    if (history) {
        currentHistoryId = id;
        document.getElementById('modalTitle').textContent = "Modifier l'Historique";
        const dt = history.timestamp ? new Date(history.timestamp) : new Date(history.date);
        const localDatetime = dt.toISOString().slice(0, 16);
        document.getElementById('historyDate').value = localDatetime;
        document.getElementById('historyUser').value = history.user || 'user';
        document.getElementById('historyMessage').value = history.message || history.question || '';
        document.getElementById('historyResponse').value = history.response || history.answer || '';
        modal.style.display = 'block';
    }
}

deleteSelectedBtn.addEventListener('click', () => {
    const selectedCheckboxes = document.querySelectorAll('.selectCheckbox:checked');
    if (selectedCheckboxes.length === 0) {
        alert("Veuillez sélectionner au moins un message à supprimer.");
        return;
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer les messages sélectionnés ?")) {
        const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.getAttribute('data-id')));
        histories = histories.filter(h => !selectedIds.includes(h.id));
        localStorage.setItem('chatHistory', JSON.stringify(histories));
        renderHistoryTable();
    }
});

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

selectAllCheckbox.addEventListener('change', () => {
    const isChecked = selectAllCheckbox.checked;
    const checkboxes = document.querySelectorAll('.selectCheckbox');
    checkboxes.forEach(cb => cb.checked = isChecked);
});

renderHistoryTable();