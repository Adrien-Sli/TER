// navigation.js - Gère les redirections des boutons

// Appliquer le fond d'écran sauvegardé au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    const savedBg = localStorage.getItem('selectedBackground');
    if (savedBg) {
        document.body.style.backgroundImage = `url('${savedBg}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    }
});
