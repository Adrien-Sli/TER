// navigation.js - Gère les redirections des boutons

document.addEventListener('DOMContentLoaded', function() {
    // Sélectionne les éléments
    const settingsBtn = document.querySelector('.settings-button');
    const helpBtn = document.querySelector('.aide-button');
    
    // Redirection pour le bouton Paramètres
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Empêche le comportement par défaut
            window.location.href = 'settings.html';
        });
    }
    
    // Redirection pour le bouton Aide
    if (helpBtn) {
        helpBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'help.html';
        });
    }
});