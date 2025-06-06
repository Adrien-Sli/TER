function updateNavbarAvatar(avatarUrl) {
    const profilIcons = document.querySelectorAll('.profil-icon');
    const savedNavbarAvatar = localStorage.getItem('navbarAvatar');
    
    // Utilisez l'URL fournie si elle existe, sinon utilisez celle du localStorage
    const urlToUse = avatarUrl || savedNavbarAvatar;
    
    if (urlToUse) {
        profilIcons.forEach(icon => {
            icon.src = urlToUse;
        });
        // Sauvegardez dans le localStorage seulement si c'est une nouvelle image
        if (avatarUrl && !savedNavbarAvatar) {
            localStorage.setItem('navbarAvatar', avatarUrl);
        }
    } else {
        // Fallback à l'image par défaut
        profilIcons.forEach(icon => {
            icon.src = '../Image/profil.png';
        });
    }
}
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


// Applique la police sauvegardée
function applySavedFont() {
    const savedFont = localStorage.getItem('selectedFont');
    if (savedFont) {
        document.body.style.fontFamily = savedFont;
    }

    const savedFontSize = localStorage.getItem('selectedFontSize');
    if (savedFontSize) {
        document.body.style.fontSize = savedFontSize + 'px';
    }
}

// Initialisation commune à toutes les pages
document.addEventListener('DOMContentLoaded', function () {
    applySavedBackground();
    applySavedFont();

    // Boutons de navigation
    const settingsBtn = document.querySelector('.settings-button');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'settings.html';
        });
    }

    const helpBtn = document.querySelector('.aide-button');
    if (helpBtn) {
        helpBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'help.html';
        });
    }

    const homeBtn = document.querySelector('.home-button');
    if (homeBtn) {
        homeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

    // Si on est sur la page des paramètres
    if (window.location.pathname.includes('settings.html')) {
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');

        const savedFontSize = localStorage.getItem('selectedFontSize');
        if (fontSizeSlider) {
            const initialSize = savedFontSize || fontSizeSlider.value;
            fontSizeSlider.value = initialSize;
            document.body.style.fontSize = initialSize + 'px';
            if (fontSizeValue) fontSizeValue.textContent = initialSize + 'px';

            fontSizeSlider.addEventListener('input', function () {
                const newSize = fontSizeSlider.value;
                document.body.style.fontSize = newSize + 'px';
                localStorage.setItem('selectedFontSize', newSize);
                if (fontSizeValue) fontSizeValue.textContent = newSize + 'px';
            });
        }
    }
});
updateNavbarAvatar();