// common.js - Fonctions partagées entre toutes les pages

// Applique le fond d'écran sauvegardé
function applySavedBackground() {
    const savedBg = localStorage.getItem('selectedBackground');
    if (savedBg) {
        document.body.style.backgroundImage = `url('${savedBg}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    }
}

// Initialisation commune à toutes les pages
document.addEventListener('DOMContentLoaded', function() {
    // Applique le fond d'écran
    applySavedBackground();
    
    // Gestion de la navigation
    const settingsBtn = document.querySelector('.settings-button');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'parametres.html';
        });
    }
    
    const helpBtn = document.querySelector('.aide-button');
    if (helpBtn) {
        helpBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Vous êtes déjà dans la section Aide');
        });
    }
});
