function initPage() {
    const fond = localStorage.getItem('selectedBackground');
    if (fond) {
        document.body.style.backgroundImage = `url('${fond}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    }

    // Charger le style de bulle
    let bubbleType = localStorage.getItem('selectedBubble') || 'dialogue';

    // NE PAS appeler updateBubble ici — attendre que le vrai contenu (météo ou textarea) le fasse

    // Réagir au changement de style de bulle (ex: depuis une autre page)
    window.addEventListener('storage', function(e) {
        if (e.key === 'selectedBubble') {
            bubbleType = e.newValue;
            const textarea = document.querySelector('.under-panel textarea');
            updateBubble(bubbleType, textarea?.value || "");
        }
    });

    // Mise à jour dynamique quand on tape dans le champ
    const textarea = document.querySelector('.under-panel textarea');
    if (textarea) {
        textarea.addEventListener('input', function() {
            updateBubble(bubbleType, this.value);
        });
    }
}


function wrapText(text, maxWidth) {
    if (!text) return [""];
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0] || "";
    
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const tempText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tempText.setAttribute("font-family", "Comic Sans MS");
        tempText.setAttribute("font-size", "28");
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

function updateBubble(bubbleType, text = "Bonjour je m'appelle Phil Il fait super beau a Grenoble aujourd'hui tu ne trouve pas ?") {
    const centerPanel = document.querySelector('.center-panel');
    if (!centerPanel) {
        console.error("Element .center-panel non trouvé");
        return;
    }
    
    console.log("Chargement de la bulle de type:", bubbleType);
    
    const isCri = bubbleType === 'cri';
    const displayText = isCri ? text.toUpperCase() : text;
    const maxWidth = 600; // Largeur maximale pour le texte
    const lineHeight = 40; // Hauteur de ligne
    const padding = 40; // Padding autour du texte
    const tailHeight = 60; // Hauteur de la queue de la bulle

    const lines = wrapText(displayText, maxWidth);
    const textHeight = lines.length * lineHeight;
    const bubbleHeight = textHeight + 2 * padding;
    const totalHeight = bubbleHeight + tailHeight;

    let bubbleWidth = 0;
    const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const tempText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tempText.setAttribute("font-family", "Comic Sans MS");
    tempText.setAttribute("font-size", "28");

    lines.forEach(line => {
        tempText.textContent = line;
        tempSvg.appendChild(tempText);
        document.body.appendChild(tempSvg);
        const width = tempText.getComputedTextLength();
        document.body.removeChild(tempSvg);
        if (width > bubbleWidth) bubbleWidth = width;
    });

    bubbleWidth = Math.max(300, bubbleWidth + 2 * padding);
    const svgWidth = bubbleWidth + 100;
    const svgHeight = totalHeight + 100;

    let svgContent = '';
    let pathData = '';

    switch(bubbleType) {
            case 'dialogue':
            case 'pensee':
            case 'cri':
                // Utilisation de la même forme de base pour tous les types
                pathData = `
                    M20,40 
                    Q40,20 60,20 
                    H${bubbleWidth}
                    Q${bubbleWidth + 30},20 ${bubbleWidth + 30},40 
                    V${bubbleHeight}
                    Q${bubbleWidth + 30},${bubbleHeight + 20} ${bubbleWidth},${bubbleHeight + 20} 
                    H80
                    Q65,${bubbleHeight + 20} 60,${bubbleHeight + 40}
                    Q55,${bubbleHeight + 20} 40,${bubbleHeight + 20}
                    Q20,${bubbleHeight + 20} 20,${bubbleHeight}
                    V60
                    Q20,50 20,40 Z`;
                break;
        }

        svgContent = `
            <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}">
                <defs>
                    <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        ${bubbleType === 'cri' ? `
                            <stop offset="0%" stop-color="#ffe5e5" />
                            <stop offset="100%" stop-color="#ffb3b3" />
                        ` : `
                            <stop offset="0%" stop-color="#fefefe" />
                            <stop offset="100%" stop-color="#f0f0f0" />
                        `}
                    </linearGradient>

                    <!-- Filtres spéciaux -->
                    <filter id="penseeEffect">
                        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1"/>
                        <feDisplacementMap in="SourceGraphic" scale="2"/>
                    </filter>
                    
                    <filter id="criEffect">
                        <feTurbulence type="turbulence" baseFrequency="0.05 0.08" result="noise" numOctaves="2"/>
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
                    </filter>
                </defs>

                <!-- Contour principal -->
                <path
                    d="${pathData}"
                    fill="url(#bubbleGrad)" 
                    stroke="${bubbleType === 'cri' ? '#ff4444' : '#bbb'}"
                    stroke-width="${bubbleType === 'cri' ? '3' : '1.5'}"
                    style="stroke-linejoin: round;
                        ${bubbleType === 'pensee' ? 'stroke-dasharray: 8,5; filter: url(#penseeEffect);' : ''}
                        ${bubbleType === 'cri' ? 'filter: url(#criEffect);' : ''}" />

                <!-- Texte -->
                ${lines.map((line, i) => `
                    <text x="${svgWidth / 2}" 
                        y="${padding + (i * lineHeight) + (lineHeight / 2)}"
                        text-anchor="middle" 
                        font-family="Comic Sans MS" 
                        font-size="28" 
                        fill="${bubbleType === 'cri' ? '#cc0000' : '#333'}"
                        ${bubbleType === 'cri' ? `
                            font-weight="bold"
                            style="text-shadow: 2px 2px 4px rgba(255,0,0,0.3);"
                        ` : ''}
                        dominant-baseline="middle">
                        ${bubbleType === 'cri' ? line.toUpperCase() : line}
                    </text>
                `).join('')}

                <!-- Éléments spécifiques à la pensée -->
                ${bubbleType === 'pensee' ? `
                    <g transform="translate(${bubbleWidth * 0.25}, ${svgHeight - 50})">
                        <circle r="12" fill="none" stroke="#bbb" stroke-width="2" stroke-dasharray="3,2"/>
                        <circle r="8" fill="none" stroke="#bbb" stroke-width="2" stroke-dasharray="2,3" 
                                transform="translate(15, 18)"/>
                        <circle r="5" fill="none" stroke="#bbb" stroke-width="2" stroke-dasharray="1,4" 
                                transform="translate(25, 25)"/>
                        <path d="M30,30 Q40,35 50,30" stroke="#bbb" stroke-width="2" fill="none" 
                            stroke-dasharray="5,3"/>
                    </g>
                ` : ''}

                <!-- Éléments spécifiques au cri -->
                ${bubbleType === 'cri' ? `
                    <g stroke="#ff4444" stroke-width="2" stroke-linecap="round">
                        <path d="M${svgWidth * 0.1},${svgHeight * 0.1} L${svgWidth * 0.15},${svgHeight * 0.05}"/>
                        <path d="M${svgWidth * 0.9},${svgHeight * 0.1} L${svgWidth * 0.85},${svgHeight * 0.05}"/>
                        <path d="M${svgWidth * 0.1},${svgHeight * 0.9} L${svgWidth * 0.05},${svgHeight * 0.85}"/>
                        <path d="M${svgWidth * 0.9},${svgHeight * 0.9} L${svgWidth * 0.95},${svgHeight * 0.85}"/>
                        <path d="M${svgWidth * 0.5},10 L${svgWidth * 0.5},30"/>
                        <path d="M10,${svgHeight * 0.5} L30,${svgHeight * 0.5}"/>
                    </g>
                ` : ''}
            </svg>`;

        centerPanel.innerHTML = svgContent;
    }

// Attendre que tout le DOM soit chargé
document.addEventListener('DOMContentLoaded', initPage);

document.addEventListener('DOMContentLoaded', function() {
    // Appliquer le fond d'écran sauvegardé
    const savedBg = localStorage.getItem('selectedBackground');
    if (savedBg) {
        document.body.style.backgroundImage = `url('${savedBg}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    }

    displayWeather(); // Appeler la météo
});

async function displayWeather() {
    try {
        // Récupérer les données du localStorage
        const rawData = localStorage.getItem('formulaireData') || localStorage.getItem('userData');
        if (!rawData) {
            console.error("Aucune donnée utilisateur trouvée dans le localStorage.");
            return;
        }

        const dataUser = JSON.parse(rawData);
        const city = dataUser.habitation || 'Grenoble'; // fallback

        const apiKey = "dab27fb29b8649b087492631251505"; // Remplace par ta vraie clé
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&lang=fr`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("Erreur API météo:", data.error.message);
            return;
        }

        // Mettre à jour l'interface météo
        document.getElementById('weatherCity').textContent = data.location.name;
        document.getElementById('weatherTemp').textContent = `${data.current.temp_c}°C`;
        document.getElementById('weatherIcon').src = `https:${data.current.condition.icon}`;
        document.getElementById('weatherIcon').alt = data.current.condition.text;

        // Génération du message météo
        const preventionMessage = generatePreventionMessage(data.current.temp_c, data.current.condition.text, data.location.name);

        // Affichage dans la bulle
        const bubbleType = localStorage.getItem('selectedBubble') || 'dialogue';
        updateBubble(bubbleType, preventionMessage);

    } catch (error) {
        console.error("Erreur lors de la récupération de la météo:", error);
        document.getElementById('weatherInfo').innerHTML = '<span>Météo indisponible</span>';
    }
}

function generatePreventionMessage(temp, condition, city) {
    const conseils = [];

    // Météo très chaude
    if (temp >= 30) {
        conseils.push(
            "Pensez à bien vous hydrater aujourd'hui à " + city + ".",
            "Évitez les efforts intenses pendant les heures les plus chaudes.",
            "N'oubliez pas votre casquette si vous sortez !",
            "Fermez les volets et aérez tôt le matin.",
            "Buvez de l’eau régulièrement, même sans soif.",
            "Restez dans un endroit frais.",
            "Évitez de sortir entre 12h et 16h.",
            "Portez des vêtements légers et clairs."
        );
    }

    // Temps ensoleillé et doux
    else if (temp >= 20 && condition.includes("soleil")) {
        conseils.push(
            "Une belle journée pour sortir à " + city + " ! N'oubliez pas votre crème solaire.",
            "Profitez du beau temps, mais portez un chapeau.",
            "Attention aux coups de soleil, protégez votre peau.",
            "Idéal pour une promenade, mais restez vigilant aux escaliers glissants si vous avez arrosé le jardin.",
            "N'oubliez pas votre bouteille d’eau si vous partez en balade.",
            "Portez des lunettes de soleil."
        );
    }

    // Temps pluvieux ou orageux
    if (condition.toLowerCase().includes("pluie") || condition.toLowerCase().includes("orage")) {
        conseils.push(
            "Soyez prudent : les sols peuvent être glissants à cause de la pluie.",
            "Évitez de sortir si vous n'êtes pas bien chaussé.",
            "Attention aux tapis mouillés à l’entrée.",
            "Pensez à bien essuyer vos chaussures pour éviter de glisser.",
            "Rangez les câbles électriques à l'intérieur si vous avez ouvert les fenêtres.",
            "Fermez bien vos fenêtres pour éviter les infiltrations d'eau.",
            "Restez à l’abri pendant les orages."
        );
    }

    // Temps froid
    if (temp < 10) {
        conseils.push(
            "Couvrez-vous bien, surtout les extrémités (mains, tête, pieds).",
            "Attention au chauffage : aérez votre logement chaque jour.",
            "Vérifiez que vos sols ne sont pas glissants en rentrant.",
            "Utilisez des chaussons antidérapants à la maison.",
            "Buvez des boissons chaudes régulièrement.",
            "Évitez les courants d'air."
        );
    }

    // Si pas de conseil spécifique, un message générique
    if (conseils.length === 0) {
        conseils.push(
            "Prenez soin de vous aujourd’hui à " + city + ".",
            "Une journée calme en perspective, pensez à vérifier vos équipements de sécurité.",
            "Un bon moment pour faire un peu de rangement en toute sécurité."
        );
    }

    // Choisir un message au hasard
    const message = conseils[Math.floor(Math.random() * conseils.length)];
    return message;
}
