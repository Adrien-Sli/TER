document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');

    // 📌 Affichage conditionnel des médicaments
    const medicamentOui = document.getElementById('medicament_oui');
    const medicamentNon = document.getElementById('medicament_non');
    const medicamentsDetails = document.getElementById('medicaments_details');

    medicamentOui.addEventListener('change', function () {
        if (this.checked) {
            medicamentsDetails.style.display = 'block';
        }
    });

    medicamentNon.addEventListener('change', function () {
        if (this.checked) {
            medicamentsDetails.style.display = 'none';
        }
    });

    // 📌 Affichage conditionnel des sections selon le type de logement
    const typeLogementSelect = document.getElementById('type_logement');
    const sectionMaison = document.getElementById('section_maison');
    const sectionAppartement = document.getElementById('section_appartement');
    const sectionEhpad = document.getElementById('section_ehpad');

    function setSectionEnabled(section, enabled) {
        const elements = section.querySelectorAll('input, select, textarea');
        elements.forEach(el => {
            el.disabled = !enabled;
        });
    }

    function afficherSectionLogement(type) {
        const sections = [
            { element: sectionMaison, key: 'maison' },
            { element: sectionAppartement, key: 'appartement' },
            { element: sectionEhpad, key: 'ehpad' }
        ];

        sections.forEach(section => {
            const show = (type === section.key);
            section.element.style.display = show ? 'block' : 'none';
            setSectionEnabled(section.element, show);
        });
    }

    typeLogementSelect.addEventListener('change', function () {
        afficherSectionLogement(this.value);
    });

    // 📌 Initialiser l'affichage à partir de la valeur sélectionnée (utile si le champ est pré-rempli)
    afficherSectionLogement(typeLogementSelect.value);

    // 📌 Soumission du formulaire
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            genre: document.querySelector('input[name="genre"]:checked')?.value,
            age: document.querySelector('select[name="age"]').value,
            habitation: document.querySelector('input[name="habitation"]').value,
            seul: document.querySelector('input[name="seul"]:checked')?.value,
            type_logement: document.querySelector('select[name="type_logement"]').value,
            antecedent: Array.from(document.querySelectorAll('input[name="antecedent[]"]:checked')).map(el => el.value),
            autre_antecedent: document.querySelector('input[name="autre_antecedent"]')?.value || '',
            medicament: document.querySelector('input[name="medicament"]:checked')?.value,
            medicaments_liste: document.querySelector('textarea[name="medicaments_liste"]')?.value || '',
            difficulte: Array.from(document.querySelectorAll('input[name="difficulte[]"]:checked')).map(el => el.value),
            aide_technique: Array.from(document.querySelectorAll('input[name="aide_technique[]"]:checked')).map(el => el.value),
            equipement_maison: Array.from(document.querySelectorAll('input[name="equipement_maison[]"]:checked')).map(el => el.value),
            escaliers_maison: document.querySelector('input[name="escaliers_maison"]:checked')?.value,
            eclairage: document.querySelector('input[name="eclairage"]:checked')?.value,
            etage: document.querySelector('input[name="etage"]:checked')?.value,
            equipement_appt: Array.from(document.querySelectorAll('input[name="equipement_appt[]"]:checked')).map(el => el.value),
            parties_communes: document.querySelector('input[name="parties_communes"]:checked')?.value,
            options_ehpad: Array.from(document.querySelectorAll('input[name="options_ehpad[]"]:checked')).map(el => el.value),
            frequence_personnel: document.querySelector('input[name="frequence_personnel"]:checked')?.value,
            formation_personnel: document.querySelector('input[name="formation_personnel"]:checked')?.value,
            espaces_communs: Array.from(document.querySelectorAll('input[name="espaces_communs[]"]:checked')).map(el => el.value),
            equipement_cuisine: Array.from(document.querySelectorAll('input[name="equipement_cuisine[]"]:checked')).map(el => el.value),
            amenagement_sdb: Array.from(document.querySelectorAll('input[name="amenagement_sdb[]"]:checked')).map(el => el.value),
            equipement_chambre: Array.from(document.querySelectorAll('input[name="equipement_chambre[]"]:checked')).map(el => el.value),
            chute: document.querySelector('input[name="chute"]:checked')?.value,
            dispositifs: Array.from(document.querySelectorAll('input[name="dispositifs[]"]:checked')).map(el => el.value),
            activites: Array.from(document.querySelectorAll('input[name="activites[]"]:checked')).map(el => el.value),
            autre_activite_detail: document.querySelector('input[name="autre_activite_detail"]')?.value || '',
            courses: document.querySelector('input[name="courses"]:checked')?.value,
            animaux: document.querySelector('input[name="animaux"]:checked')?.value,
            conseils: Array.from(document.querySelectorAll('input[name="conseils[]"]:checked')).map(el => el.value)
        };

        localStorage.setItem('formulaireData', JSON.stringify(formData));
        window.location.href = 'profil.html';
    });
});
