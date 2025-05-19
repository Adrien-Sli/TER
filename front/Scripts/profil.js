document.addEventListener('DOMContentLoaded', function() {
    // URL de votre déploiement Google Apps Script
    const SCRIPT_URL = "AKfycbzfjOjK249ylsw5Olv7War4ntNu-WoHd9121EKB6doWTrDh_FfT6-kIh-ICDLunKQuEDA";
    
    fetch(SCRIPT_URL)
        .then(response => response.json())
        .then(userData => {
            // Formatage des données
            const formatList = (str) => str ? str.split(',').map(item => item.trim()) : [];
            
            // Remplissage des champs
            document.getElementById('prenom').textContent = userData.prenom || "Non renseigné";
            document.getElementById('nom').textContent = userData.nom || "Non renseigné";
            document.getElementById('age').textContent = userData.age || "XX";
            document.getElementById('genre').textContent = userData.genre || "Non précisé";
            document.getElementById('lieu').textContent = userData.lieu || "Non renseigné";
            document.getElementById('motricite').textContent = userData.motricite || "Aucune";
            document.getElementById('logement-type').textContent = userData.logement || "Non spécifié";
            document.getElementById('animaux').textContent = userData.animaux || "Aucun animal domestique";

            // Remplissage des listes
            fillList('antecedents', formatList(userData.antecedents));
            fillList('medicaments', formatList(userData.medicaments));
            fillList('activites', formatList(userData.activites));

            // Équipements
            const equipementsContainer = document.getElementById('equipements');
            equipementsContainer.innerHTML = '';
            const equipements = formatList(userData.equipements);
            
            equipements.forEach(equip => {
                const tag = document.createElement('span');
                tag.className = 'equipment-tag';
                tag.textContent = equip;
                equipementsContainer.appendChild(tag);
            });

            // Date de mise à jour
            document.getElementById('date-maj').textContent = new Date().toLocaleDateString('fr-FR');
        })
        .catch(error => {
            console.error("Erreur de chargement des données:", error);
            alert("Impossible de charger le profil. Veuillez réessayer plus tard.");
        });

    function fillList(elementId, items) {
        const listElement = document.getElementById(elementId);
        listElement.innerHTML = '';
        
        if (items && items.length > 0 && items[0] !== "") {
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                listElement.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = "Aucune information";
            listElement.appendChild(li);
        }
    }

    // Bouton d'édition
    document.getElementById('edit-btn').addEventListener('click', function() {
        // Stocker les données actuelles dans localStorage avant la redirection
        const currentData = {
            prenom: document.getElementById('prenom').textContent,
            nom: document.getElementById('nom').textContent,
            // Ajoutez tous les autres champs nécessaires...
        };
        localStorage.setItem('currentProfileData', JSON.stringify(currentData));
        
        // Redirection vers la page formulaire
        window.location.href = "formulaire.html";
    });
});