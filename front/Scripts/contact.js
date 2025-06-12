document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".container");

    // Création du formulaire d'ajout de contact
    const form = document.createElement("form");
    form.innerHTML = `
        <h3>Ajouter un contact</h3>
        <input type="text" id="name" placeholder="Nom du service" required><br>
        <input type="tel" id="number" placeholder="Numéro de téléphone" required><br>
        <textarea id="desc" placeholder="Description" required></textarea><br>
        <button type="submit">Ajouter</button>
    `;
    container.appendChild(form);

    // Espace pour les contacts personnalisés
    const customSection = document.createElement("div");
    customSection.id = "custom-contacts";
    container.appendChild(customSection);

    // Charger les contacts depuis localStorage
    const loadContacts = () => {
        const contacts = JSON.parse(localStorage.getItem("customContacts")) || [];
        customSection.innerHTML = "<h2>Vos contacts ajoutés</h2>";
        contacts.forEach(contact => {
            const card = document.createElement("div");
            card.className = "contact-card info";
            card.innerHTML = `
                <div class="service-name">${contact.name}</div>
                <div class="number">${contact.number}</div>
                <p>${contact.desc}</p>
                <a href="tel:${contact.number.replace(/\s+/g, '')}" class="call-button">Appeler</a>
            `;
            customSection.appendChild(card);
        });
    };

    // Gérer la soumission du formulaire
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value.trim();
        const number = document.getElementById("number").value.trim();
        const desc = document.getElementById("desc").value.trim();

        if (!name || !number || !desc) return;

        const contact = { name, number, desc };
        const contacts = JSON.parse(localStorage.getItem("customContacts")) || [];
        contacts.push(contact);
        localStorage.setItem("customContacts", JSON.stringify(contacts));

        form.reset();
        loadContacts();
    });

    loadContacts();
});
