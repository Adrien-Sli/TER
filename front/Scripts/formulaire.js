document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    form.addEventListener("submit", function (e) {
        e.preventDefault(); // Empêche le rechargement

        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            // Gestion des champs avec [] comme les checkboxes
            if (key.endsWith("[]")) {
                const cleanKey = key.replace("[]", "");
                if (!data[cleanKey]) {
                    data[cleanKey] = [];
                }
                data[cleanKey].push(value);
            } else {
                if (data[key]) {
                    if (!Array.isArray(data[key])) data[key] = [data[key]];
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }
        }

        // Simulation d'écriture du JSON (pour usage réel, côté serveur requis)
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "rep.json";
        a.click();
        URL.revokeObjectURL(url);
    });
});