
// Rediriger vers formulaire.html si c'est la première visite
if (!localStorage.getItem("visited")) {
    localStorage.setItem("visited", "true");
    window.location.href = "formulaire.html";
}
// Déplacer le script en premier pour s'assurer qu'il s'exécute avant les autres
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

    manageHistory();

    // Réagir au changement de style de bulle (ex: depuis une autre page)
    window.addEventListener('storage', function(e) {
        if (e.key === 'selectedBubble') {
            bubbleType = e.newValue;
            const textarea = document.querySelector('.under-panel textarea');
            updateBubble(bubbleType, textarea?.value || "");
        }
    });
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

    switch (bubbleType) {
            case 'dialogue':
            case 'pensee':
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

                case 'cri':
                const w = bubbleWidth;
                const h = bubbleHeight;

                pathData = `
                    M${w * 0.1},${h * 0.3}
                    L${w * 0.05},${h * 0.1}
                    L${w * 0.2},${h * 0.15}
                    L${w * 0.25},${h * 0.0}
                    L${w * 0.4},${h * 0.15}
                    L${w * 0.5},${h * 0.0}
                    L${w * 0.6},${h * 0.15}
                    L${w * 0.75},${h * 0.0}
                    L${w * 0.8},${h * 0.15}
                    L${w * 0.95},${h * 0.1}
                    L${w * 0.9},${h * 0.3}
                    L${w},${h * 0.5}
                    L${w * 0.9},${h * 0.7}
                    L${w * 0.95},${h * 0.9}
                    L${w * 0.8},${h * 0.85}
                    L${w * 0.75},${h}
                    L${w * 0.6},${h * 0.85}
                    L${w * 0.5},${h}
                    L${w * 0.4},${h * 0.85}
                    L${w * 0.25},${h}
                    L${w * 0.2},${h * 0.85}
                    L${w * 0.05},${h * 0.9}
                    L${w * 0.1},${h * 0.7}
                    L0,${h * 0.5}
                    Z`;
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
                <g stroke="#ff4444" stroke-width="3" stroke-linecap="round">
                    <!-- Haut gauche -->
                    <path d="M${svgWidth * 0.2},${svgHeight * 0.1} L${svgWidth * 0.15},${svgHeight * 0.0}"/>
                    <path d="M${svgWidth * 0.25},${svgHeight * 0.15} L${svgWidth * 0.20},${svgHeight * 0.02}"/>

                    <!-- Haut droit -->
                    <path d="M${svgWidth * 0.8},${svgHeight * 0.1} L${svgWidth * 0.85},${svgHeight * 0.0}"/>
                    <path d="M${svgWidth * 0.75},${svgHeight * 0.15} L${svgWidth * 0.80},${svgHeight * 0.02}"/>

                    <!-- Bas gauche -->
                    <path d="M${svgWidth * 0.2},${svgHeight * 0.9} L${svgWidth * 0.15},${svgHeight * 1.0}"/>
                    <path d="M${svgWidth * 0.25},${svgHeight * 0.85} L${svgWidth * 0.20},${svgHeight * 0.98}"/>

                    <!-- Bas droit -->
                    <path d="M${svgWidth * 0.8},${svgHeight * 0.9} L${svgWidth * 0.85},${svgHeight * 1.0}"/>
                    <path d="M${svgWidth * 0.75},${svgHeight * 0.85} L${svgWidth * 0.80},${svgHeight * 0.98}"/>

                    <!-- Côtés -->
                    <path d="M${svgWidth * 0.05},${svgHeight * 0.5} L0,${svgHeight * 0.5}"/>
                    <path d="M${svgWidth * 0.95},${svgHeight * 0.5} L${svgWidth},${svgHeight * 0.5}"/>

                    <!-- Haut centre -->
                    <path d="M${svgWidth * 0.5},${svgHeight * 0.0} L${svgWidth * 0.5},${svgHeight * 0.05}"/>

                    <!-- Bas centre -->
                    <path d="M${svgWidth * 0.5},${svgHeight * 1.0} L${svgWidth * 0.5},${svgHeight * 0.95}"/>
                </g>
            ` : ''}
            </svg>`;

        centerPanel.innerHTML = svgContent;
    }

// Attendre que tout le DOM soit chargé
document.addEventListener('DOMContentLoaded', initPage);
