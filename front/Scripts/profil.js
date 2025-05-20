// profil.js

document.addEventListener('DOMContentLoaded', function() {
    // Récupérer les données du formulaire depuis le localStorage
    const formData = JSON.parse(localStorage.getItem('formulaireData'));
    
    if (formData) {
        updateProfile(formData);
    }
    
    // Gestion du bouton "Modifier mon profil"
    document.getElementById('edit-btn').addEventListener('click', function() {
        window.location.href = 'formulaire.html';
    });
});

function updateContactSection(data) {
    const contactElem = document.getElementById('contact-info');
    
    if (data.contact_nom && data.contact_prenom && data.contact_telephone) {
        const lien = data.contact_lien ? ` (${getContactLienText(data.contact_lien)})` : '';
        contactElem.innerHTML = `
            <strong>${data.contact_prenom} ${data.contact_nom}</strong>${lien}<br>
            Téléphone: ${data.contact_telephone}
        `;
    } else {
        contactElem.textContent = 'Aucun contact renseigné';
    }
}

function updateProfile(data) {
    // Mise à jour des informations de base
    document.getElementById('age').textContent = data.age ? data.age.split('-')[0] : 'XX';
    document.getElementById('genre').textContent = getGenreText(data.genre);
    document.getElementById('lieu').textContent = data.habitation || 'Ville, Code postal';
    
    // Mise à jour de la date de mise à jour
    const now = new Date();
    document.getElementById('date-maj').textContent = now.toLocaleDateString('fr-FR');
    
    // Section Santé
    updateHealthSection(data);
    
    // Section Logement
    updateHousingSection(data);
    
    // Section Activités
    updateActivitiesSection(data);
    
    // Section Animaux
    updatePetsSection(data);
    // Section contact
    updateContactSection(data);
}

function getGenreText(genreValue) {
    switch(genreValue) {
        case 'homme': return 'Homme';
        case 'femme': return 'Femme';
        case 'autre': return 'Autre';
        default: return 'Genre';
    }
}

function updateHealthSection(data) {
    const antecedentsList = document.getElementById('antecedents');
    const medicamentsList = document.getElementById('medicaments');
    const motriciteElem = document.getElementById('motricite');
    
    // Antécédents médicaux
    antecedentsList.innerHTML = '';
    if (data.antecedent && data.antecedent.length > 0) {
        data.antecedent.forEach(item => {
            if (item !== 'aucun') {
                const li = document.createElement('li');
                li.textContent = getMedicalConditionText(item);
                antecedentsList.appendChild(li);
            }
        });
        
        if (data.autre_antecedent) {
            const li = document.createElement('li');
            li.textContent = data.autre_antecedent;
            antecedentsList.appendChild(li);
        }
        
        if (antecedentsList.children.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Aucun antécédent déclaré';
            antecedentsList.appendChild(li);
        }
    } else {
        const li = document.createElement('li');
        li.textContent = 'Aucun antécédent déclaré';
        antecedentsList.appendChild(li);
    }
    
    // Médicaments
    medicamentsList.innerHTML = '';
    if (data.medicament === 'oui' && data.medicaments_liste) {
        const medicaments = data.medicaments_liste.split('\n');
        medicaments.forEach(med => {
            if (med.trim()) {
                const li = document.createElement('li');
                li.textContent = med.trim();
                medicamentsList.appendChild(li);
            }
        });
    } else {
        const li = document.createElement('li');
        li.textContent = data.medicament === 'oui' ? 'Non spécifié' : 'Aucun médicament régulier';
        medicamentsList.appendChild(li);
    }
    
    // Difficultés motrices
    if (data.difficulte && data.difficulte.length > 0 && !data.difficulte.includes('aucune')) {
        const difficulties = data.difficulte.map(item => getDifficultyText(item));
        motriciteElem.textContent = difficulties.join(', ');
    } else {
        motriciteElem.textContent = 'Aucune difficulté déclarée';
    }
}

function updateHousingSection(data) {
    const logementTypeElem = document.getElementById('logement-type');
    const equipementsElem = document.getElementById('equipements');
    // Type de logement
    let typeText = '';
    if (data.type_logement) {
        typeText = data.type_logement.charAt(0).toUpperCase() + data.type_logement.slice(1); // ex: 'maison'
    } else {
        typeText = 'Logement non spécifié';
    }

    if (data.etage) {
        switch(data.etage) {
            case 'rdc': typeText += ' (Rez-de-chaussée)'; break;
            case 'ascenseur': typeText += ' (avec ascenseur)'; break;
            case 'sans_ascenseur': typeText += ' (sans ascenseur)'; break;
        }
    }

    logementTypeElem.textContent = typeText;
    
    // Équipements
    equipementsElem.innerHTML = '';
    
    // Détecteurs
    const detecteurs = [];
    if (data.equipement_maison && data.equipement_maison.includes('fumee')) {
        detecteurs.push('Détecteur de fumée');
    }
    if (data.equipement_maison && data.equipement_maison.includes('co')) {
        detecteurs.push('Détecteur de CO');
    }
    
    if (detecteurs.length > 0) {
        const p = document.createElement('p');
        p.innerHTML = `<strong>Sécurité :</strong> ${detecteurs.join(', ')}`;
        equipementsElem.appendChild(p);
    }
    
    // Aides techniques
    if (data.aide_technique && data.aide_technique.length > 0 && !data.aide_technique.includes('aucune')) {
        const aides = data.aide_technique.map(item => getAideTechniqueText(item));
        const p = document.createElement('p');
        p.innerHTML = `<strong>Aides techniques :</strong> ${aides.join(', ')}`;
        equipementsElem.appendChild(p);
    }
    
    // Équipements salle de bain
    if (data.amenagement_sdb && data.amenagement_sdb.length > 0 && !data.amenagement_sdb.includes('aucun')) {
        const sdbItems = data.amenagement_sdb.map(item => getSdbText(item));
        const p = document.createElement('p');
        p.innerHTML = `<strong>Salle de bain :</strong> ${sdbItems.join(', ')}`;
        equipementsElem.appendChild(p);
    }
    
    if (equipementsElem.children.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Aucun équipement spécifique déclaré';
        equipementsElem.appendChild(p);
    }
    if (data.cheminee) {
        const p = document.createElement('p');
        p.innerHTML = `<strong>Cheminée :</strong> ${data.cheminee === 'oui' ? 'Présente' : 'Absente'}`;
        equipementsElem.appendChild(p);
    }
}

function updateActivitiesSection(data) {
    const activitesList = document.getElementById('activites');
    activitesList.innerHTML = '';
    
    if (data.activites && data.activites.length > 0) {
        data.activites.forEach(item => {
            if (item !== 'autre') {
                const li = document.createElement('li');
                li.textContent = getActivityText(item);
                activitesList.appendChild(li);
            }
        });
        
        if (data.autre_activite_detail) {
            const li = document.createElement('li');
            li.textContent = data.autre_activite_detail;
            activitesList.appendChild(li);
        }
    }
    
    if (activitesList.children.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Aucune activité régulière déclarée';
        activitesList.appendChild(li);
    }
}


function getAnimalText(value) {
    switch(value) {
        case 'non': return 'Aucun animal domestique';
        case 'petit': return 'Petit animal (chat, petit chien...)';
        case 'gros': return 'Gros animal (grand chien...)';
        default: return 'Non spécifié';
    }
}

function updatePetsSection(data) {
    const animauxElem = document.getElementById('animaux');
    animauxElem.textContent = getAnimalText(data.animaux);
}

function getContactLienText(value) {
    switch(value) {
        case 'famille': return 'Membre de la famille';
        case 'ami': return 'Ami';
        case 'voisin': return 'Voisin';
        case 'autre': return 'Autre';
        default: return '';
    }
}

// Fonctions utilitaires pour les textes
function getMedicalConditionText(value) {
    switch(value) {
        case 'hypertension': return 'Hypertension';
        case 'diabete': return 'Diabète';
        case 'arthrose': return 'Arthrose/Problèmes articulaires';
        case 'visuels': return 'Troubles visuels';
        case 'auditifs': return 'Troubles auditifs';
        default: return value;
    }
}

function getDifficultyText(value) {
    switch(value) {
        case 'escaliers': return 'Monter les escaliers';
        case 'lever': return 'Se lever d\'une chaise';
        case 'porter': return 'Porter des charges légères';
        case 'toilettes': return 'Utiliser les toilettes/baignoire';
        default: return value;
    }
}

function getAideTechniqueText(value) {
    switch(value) {
        case 'deambulateur': return 'Déambulateur';
        case 'canne': return 'Canne';
        case 'fauteuil': return 'Fauteuil roulant';
        case 'prothese': return 'Prothèse';
        default: return value;
    }
}

function getSdbText(value) {
    switch(value) {
        case 'barres': return 'Barres d\'appui';
        case 'tapis': return 'Tapis antidérapants';
        case 'siege': return 'Siège de douche';
        case 'italienne': return 'Douche à l\'italienne';
        case 'baignoire': return 'Baignoire non sécurisée';
        case 'glissant': return 'Sol glissant';
        default: return value;
    }
}

function getActivityText(value) {
    switch(value) {
        case 'jardinage': return 'Jardinage';
        case 'bricolage': return 'Bricolage';
        case 'cuisine': return 'Cuisine';
        case 'marche': return 'Marche';
        case 'garde_enfant': return 'Garde d\'enfant';
        default: return value;
    }
}