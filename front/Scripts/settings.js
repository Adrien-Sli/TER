// Vérifie si le localStorage est disponible
function isLocalStorageAvailable() {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        console.error("LocalStorage n'est pas disponible", e);
        return false;
    }
}

// ========== Gestion du fond d'écran ==========
document.addEventListener('DOMContentLoaded', function() {
    if (!isLocalStorageAvailable()) {
        alert("Votre navigateur ne supporte pas le stockage local. Les paramètres ne seront pas sauvegardés.");
        return;
    }

    // Charger le fond sauvegardé s'il existe
    const savedBg = localStorage.getItem('selectedBackground');
    console.log('Fond sauvegardé:', savedBg);
    
    if (savedBg) {
        document.body.style.backgroundImage = `url('${savedBg}')`;
        
        // Marquer l'option sélectionnée
        const options = document.querySelectorAll('.background-option');
        options.forEach(option => {
            if (option.getAttribute('data-bg') === savedBg) {
                option.classList.add('selected');
            }
        });
    }

    // Charger le style de bulle sauvegardé s'il existe
    const savedBubble = localStorage.getItem('selectedBubble');
    if (savedBubble) {
        selectBubble(savedBubble, false);
    } else {
        // Sélectionner la bulle de dialogue par défaut
        selectBubble('dialogue', false);
    }

    // Charger la police sauvegardée s'il existe
    const savedFont = localStorage.getItem('selectedFont');
    if (savedFont) {
        selectFont(savedFont, false);
        const fontSelector = document.getElementById('fontSelector');
        if (fontSelector) {
            fontSelector.value = savedFont;
        }
    }

    // Charger la taille de police sauvegardée s'il existe
    const savedFontSize = localStorage.getItem('selectedFontSize');
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    console.log("Valeur sauvegardée taille police:", savedFontSize);

    if (savedFontSize) {
        fontSizeSlider.value = savedFontSize;
        updateFontSize(savedFontSize, false);
    } else {
        const defaultValue = '16';
        fontSizeSlider.value = defaultValue;
        updateFontSize(defaultValue, false);
    }
});

function changeBackground(element, bgName) {
    document.querySelectorAll('.background-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    element.classList.add('selected');
    const bgUrl = element.getAttribute('data-bg');
    document.body.style.backgroundImage = `url('${bgUrl}')`;
}

// ========== Gestion des polices ==========
function selectFont(fontFamily, updateStorage = true) {
    document.body.style.fontFamily = fontFamily;

    if (updateStorage && isLocalStorageAvailable()) {
        localStorage.setItem('selectedFont', fontFamily);
    }
}
    

function updateFontSize(size, updateStorage = true) {
    // Mettre à jour l'affichage de la valeur
    document.getElementById('fontSizeValue').textContent = size + 'px';
    
    // Appliquer la taille de police
    document.body.style.fontSize = size + 'px';
    
    // Sauvegarder dans le localStorage si demandé
    if (updateStorage && isLocalStorageAvailable()) {
        localStorage.setItem('selectedFontSize', size);
    }
}

// ========== Gestion des bulles ==========
let selectedBubbleType = null;

function selectBubble(type, updateStorage = true) {
    selectedBubbleType = type;
    
    // Retirer la classe 'selected' de toutes les options
    document.querySelectorAll('.bubble-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Ajouter la classe 'selected' à l'option cliquée
    event.currentTarget.classList.add('selected');
    
    // Mettre à jour la bulle
    updateBubble();
    
    // Sauvegarder dans le localStorage si demandé
    if (updateStorage && isLocalStorageAvailable()) {
        localStorage.setItem('selectedBubble', type);
    }
}

function wrapText(text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const tempText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tempText.setAttribute("font-family", "Comic Sans MS");
        tempText.setAttribute("font-size", "16");
        tempText.textContent = currentLine + ' ' + word;
        tempSvg.appendChild(tempText);
        document.body.appendChild(tempSvg);
        const width = tempText.getComputedTextLength();
        document.body.removeChild(tempSvg);
        
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

// ========== Gestion des paramètres ==========
function applySettings() {
    if (!isLocalStorageAvailable()) return;
    
    try {
        // Sauvegarder le fond d'écran
        const selectedBgOption = document.querySelector('.background-option.selected');
        if (selectedBgOption) {
            const bgUrl = selectedBgOption.getAttribute('data-bg');
            localStorage.setItem('selectedBackground', bgUrl);
            console.log('Fond enregistré:', bgUrl);
        }
        
        // Sauvegarder le style de bulle
        if (selectedBubbleType) {
            localStorage.setItem('selectedBubble', selectedBubbleType);
            console.log('Bulle enregistrée:', selectedBubbleType);
        }
        
        // Sauvegarder la police
        const fontSelector = document.getElementById('fontSelector');
        if (fontSelector) {
            const fontFamily = fontSelector.value;
            localStorage.setItem('selectedFont', fontFamily);
        }
        
        // Sauvegarder l'avatar
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        if (selectedAvatar) {
            const avatarUrl = selectedAvatar.getAttribute('data-avatar');
            localStorage.setItem('avatarImage', avatarUrl);
            console.log('Avatar enregistré:', avatarUrl);
        }
        // Sauvegarder la taille de police
        const fontSize = document.getElementById('fontSizeSlider').value;
        localStorage.setItem('selectedFontSize', fontSize);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    } catch(e) {
        console.error("Erreur lors de la sauvegarde:", e);
        alert("Erreur lors de la sauvegarde des paramètres");
    }
}

function resetSettings() {
    if (!isLocalStorageAvailable()) return;
    
    try {
        // Réinitialiser le fond d'écran
        localStorage.removeItem('selectedBackground');
        document.body.style.backgroundImage = '';
        document.querySelectorAll('.background-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Réinitialiser le style de bulle
        localStorage.removeItem('selectedBubble');
        selectBubble('dialogue', false);
        
        // Réinitialiser la police
        localStorage.removeItem('selectedFont');
        document.querySelectorAll('.font-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        document.body.style.fontFamily = '';
        
        // Réinitialiser la taille de police
        localStorage.removeItem('selectedFontSize');
        document.getElementById('fontSizeSlider').value = 16;
        document.getElementById('fontSizeValue').textContent = '16px';
        document.body.style.fontSize = '16px';
        
        alert('Paramètres réinitialisés');
        console.log('LocalStorage effacé');
    } catch(e) {
        console.error("Erreur lors de la réinitialisation:", e);
    }
}
function selectAvatar(element) {
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    element.classList.add('selected');
    const avatarUrl = element.getAttribute('data-avatar');

    if (isLocalStorageAvailable()) {
        localStorage.setItem('mainAvatar', avatarUrl); // Stocke dans mainAvatar
    }
}

// Charger l'avatar au démarrage
document.addEventListener('DOMContentLoaded', function () {
    const savedAvatar = localStorage.getItem('mainAvatar');
    if (savedAvatar) {
        const avatarOptions = document.querySelectorAll('.avatar-option');
        avatarOptions.forEach(option => {
            if (option.getAttribute('data-avatar') === savedAvatar) {
                option.classList.add('selected');
            }
        });
    }
});
