// debug
console.log("script.js chargé !");

// Variable globale pour l'historique
let chatHistory = [];
const historyContainer = document.getElementById('historyContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// ---
// Fonctions utilitaires
// ---

/**
 * Enveloppe le texte pour qu'il tienne dans une largeur maximale.
 * @param {string} text - Le texte à envelopper.
 * @param {number} maxWidth - La largeur maximale en pixels.
 * @returns {string[]} Un tableau de lignes de texte.
 */

function wrapText(text, maxWidth) {
    if (!text) return [""];
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        // Créer un élément SVG temporaire pour mesurer la largeur du texte
        const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const tempText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tempText.setAttribute("font-family", "Comic Sans MS"); // Doit correspondre au style de la bulle
        tempText.setAttribute("font-size", "28"); // Doit correspondre au style de la bulle
        tempText.textContent = currentLine + ' ' + word;
        tempSvg.appendChild(tempText);
        document.body.appendChild(tempSvg); // Ajouter au DOM pour getComputedTextLength
        const width = tempText.getComputedTextLength();
        document.body.removeChild(tempSvg); // Supprimer l'élément temporaire

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
function updateMainAvatar(avatarUrl) {
    const mainAvatar = document.querySelector('.left-panel img');
    if (mainAvatar) {
        const savedMainAvatar = localStorage.getItem('mainAvatar'); // Nouveau
        if (savedMainAvatar) {
            mainAvatar.src = savedMainAvatar;
        } else if (avatarUrl) {
            mainAvatar.src = avatarUrl;
            localStorage.setItem('mainAvatar', avatarUrl); // Sauvegarde si nouveau
        } else {
            // Image par défaut si pas d'avatar sauvegardé
            mainAvatar.src = "https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortFlat&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=ShirtCrewNeck&clotheColor=Black&eyeType=Default&eyebrowType=RaisedExcited&mouthType=Smile&skinColor=Pale";
        }
    }
}
/**
 * Met à jour l'affichage de la bulle de dialogue SVG.
 * @param {string} bubbleType - Le type de bulle ('dialogue', 'pensee', 'cri').
 * @param {string} text - Le texte à afficher dans la bulle.
 */
function updateBubble(bubbleType, text = "") {
    const centerPanel = document.querySelector('.center-panel');
    if (!centerPanel) {
        console.error("Element .center-panel non trouvé");
        return;
    }

    console.log("Chargement de la bulle de type:", bubbleType);

    const isCri = bubbleType === 'cri';
    const displayText = text;
    const maxWidth = 600; // Largeur maximale pour le texte dans la bulle
    const lineHeight = 40; // Hauteur d'une ligne de texte
    const padding = bubbleType === 'cri' ? 140 : 60; // Rembourrage intérieur de la bulle
    const tailHeight = 60; // Hauteur de la "queue" de la bulle (pour dialogue/pensée)

    const lines = wrapText(displayText, maxWidth);
    const textHeight = lines.length * lineHeight;
    const bubbleHeight = textHeight + 2 * padding;
    const totalHeight = bubbleHeight + tailHeight; // Hauteur totale incluant la queue

    let bubbleWidth = 0;
    // Mesurer la largeur maximale des lignes pour déterminer la largeur de la bulle
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

    bubbleWidth = Math.max(300, bubbleWidth + 2 * padding + 40); // Largeur minimale de la bulle + ajustement
    const svgWidth = bubbleWidth + 100; // Largeur du conteneur SVG
    const svgHeight = totalHeight + 100; // Hauteur du conteneur SVG

    let pathData = '';

    // Définir la forme de la bulle en fonction de son type
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
            // Forme de bulle de cri (étoile ou forme dentelée)
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

    // Générer le contenu SVG de la bulle
    const svgContent = `
        <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}">
            <defs>
                <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    ${isCri ? `
                        <stop offset="0%" stop-color="#fefefe" />
                        <stop offset="100%" stop-color="#f0f0f0" />
                    ` : `
                        <stop offset="0%" stop-color="#fefefe" />
                        <stop offset="100%" stop-color="#f0f0f0" />
                    `}
                </linearGradient>
                <filter id="penseeEffect">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1"/>
                    <feDisplacementMap in="SourceGraphic" scale="2"/>
                </filter>
                <filter id="criEffect">
                    <feTurbulence type="turbulence" baseFrequency="0.05 0.08" result="noise" numOctaves="2"/>
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
                </filter>
            </defs>

            <path
                d="${pathData}"
                fill="url(#bubbleGrad)"
                stroke="${isCri ? '#000000' : '#bbb'}"
                stroke-width="${isCri ? '3' : '1.5'}"
                style="stroke-linejoin: round;
                    ${bubbleType === 'pensee' ? 'stroke-dasharray: 8,5; filter: url(#penseeEffect);' : ''}
                    ${isCri ? 'filter: url(#criEffect);' : ''}" />

            ${lines.map((line, i) => `
                <text x="${svgWidth / 2}"
                    y="${padding + (i * lineHeight) + (lineHeight / 2)}"
                    text-anchor="middle"
                    font-family="Comic Sans MS"
                    font-size="26"
                    fill="${isCri ? '#000000' : '#333'}"
                    font-weight="bold"
                    style="${isCri ? 'text-shadow: 2px 2px 5px rgba(255, 255, 255, 0.6);' : ''}"
                    dominant-baseline="middle">
                    ${line}
                </text>
            `).join('')}

            ${bubbleType === 'pensee' ? `
                <g transform="translate(${bubbleWidth * 0.25}, ${svgHeight - 50})">
                    <circle r="12" fill="none" stroke="#bbb" stroke-width="2" stroke-dasharray="3,2"/>
                    <circle r="8" fill="none" stroke="#bbb" stroke-width="2" stroke-dasharray="2,3" transform="translate(15, 18)"/>
                    <circle r="5" fill="none" stroke="#bbb" stroke-width="2" stroke-dasharray="1,4" transform="translate(25, 25)"/>
                    <path d="M30,30 Q40,35 50,30" stroke="#bbb" stroke-width="2" fill="none" stroke-dasharray="5,3"/>
                </g>
            ` : ''}
        </svg>`;

    centerPanel.innerHTML = svgContent;
}

/**
 * Récupère les données météorologiques et génère un message de prévention.
 * @returns {Promise<string>} Le message de prévention généré.
 */
async function displayWeather() {
    try {
        const rawData = localStorage.getItem('formulaireData') || localStorage.getItem('userData');
        if (!rawData) {
            console.error("Aucune donnée utilisateur trouvée dans le localStorage.");
            return "Désolé, je n'ai pas pu récupérer vos préférences de ville.";
        }

        const dataUser = JSON.parse(rawData);
        const city = dataUser.habitation || 'Grenoble';

        const apiKey = "dab27fb29b8649b087492631251505"; // Remplacez par votre vraie clé API
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&lang=fr`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("Erreur API météo:", data.error.message);
            return "Désolé, une erreur s'est produite lors de la récupération de la météo.";
        }

        document.getElementById('weatherCity').textContent = data.location.name;
        document.getElementById('weatherTemp').textContent = `${data.current.temp_c}°C`;
        document.getElementById('weatherIcon').src = `https:${data.current.condition.icon}`;
        document.getElementById('weatherIcon').alt = data.current.condition.text;

        const preventionMessage = generatePreventionMessage(data.current.temp_c, data.current.condition.text, data.location.name);

        // Mettre à jour la bulle avec le message de prévention
        const bubbleType = localStorage.getItem('selectedBubble') || 'dialogue';
        updateBubble(bubbleType, preventionMessage);

        return preventionMessage;

    } catch (error) {
        console.error("Erreur lors de la récupération de la météo:", error);
        document.getElementById('weatherInfo').innerHTML = '<span>Météo indisponible</span>';
        return "Désolé, je n'ai pas pu récupérer la météo.";
    }
}

/**
 * Génère un message de prévention basé sur la météo.
 * (Fonction non modifiée, mais incluse pour la complétude)
 * @param {number} temp - La température actuelle.
 * @param {string} condition - La description de la condition météo.
 * @param {string} city - Le nom de la ville.
 * @returns {string} Le message de prévention.
 */
function generatePreventionMessage(temp, condition, city) {
    if (!temp || !condition || !city) {
        return "Je n'ai pas pu récupérer les informations météo actuelles.";
    }

    console.log("Température :", temp);
    console.log("Condition météo :", condition);
    console.log("Ville :", city);

    const conseils = [];

    // Très chaud (30°C+)
    if (temp >= 30) {
        const intro = `À ${city}, une forte chaleur est annoncée. Voici quelques conseils pour rester au frais :`;
        const autresConseils = [
            "Penser à boire un peu d’eau régulièrement.",
            "Aérer vos pièces en soirée peut rendre l’air plus agréable.",
            "Fermer volets et rideaux en journée permet de garder la fraîcheur à l’intérieur.",
            "Éviter d’utiliser trop d’appareils électriques limite la chaleur dans la maison.",
            "Placer un bol d’eau devant un ventilateur humidifie et rafraîchit l’air ambiant.",
            "Privilégier des vêtements légers, comme ceux en coton.",
            "Éviter les boissons alcoolisées ou très caféinées aide à rester bien hydraté.",
            "Les plantes d’intérieur peuvent rendre l’air plus agréable.",
            "Fermer les pièces inutilisées aide à conserver la fraîcheur.",
            "Préparer un repas froid évite de chauffer la cuisine.",
            "Installer des ventilateurs dans les pièces utilisées améliore le confort.",
            "Des rideaux opaques limitent la chaleur dans les pièces exposées au soleil.",
            "Se reposer dans les pièces les plus fraîches aide à éviter un coup de chaleur.",
            "Faire des pauses à l’ombre évite la fatigue.",
            "Un brumisateur peut rendre la température plus supportable.",
            "Couvrir sa tête en sortant évite l’insolation."
        ];
        autresConseils.forEach(c => conseils.push(`${intro} ${c}`));
    }

    // Temps ensoleillé et doux (15-29°C)
    else if (temp >= 15 && condition.toLowerCase().includes("soleil")) {
        const intro = `Le soleil brille à ${city}, c’est une belle occasion pour prendre soin de votre maison et de vous-même.`;
        const autresConseils = [
            "Un petit tour dehors tôt le matin ou en fin de journée permet de profiter du beau temps sans surchauffe.",
            "Avant de sortir, glissez dans votre sac un chapeau, des lunettes de soleil, de la crème solaire et une bouteille d’eau.",
            "Un brumisateur ou un éventail peut apporter un vrai soulagement quand l’air devient un peu lourd.",
            "Pensez à aérer votre intérieur en fin de journée, surtout si les températures montent doucement.",
            "Pourquoi ne pas en profiter pour dépoussiérer vos ventilateurs ? Un appareil propre est plus efficace.",
            "Les plantes aussi apprécient une petite attention : un arrosage ou un coin plus ombragé peut leur faire du bien.",
            "Installer un coin lecture ou détente à l’ombre, c’est l’assurance d’un moment agréable en toute simplicité.",
            "C’est le temps idéal pour partager une boisson fraîche avec un proche ou un voisin à l’extérieur.",
            "Des vêtements clairs, légers et respirants sont vos meilleurs alliés pour rester à l’aise toute la journée.",
            "Un coup d’œil aux rampes ou surfaces métalliques exposées au soleil permet d’éviter les brûlures inattendues.",
            "Pourquoi ne pas faire vos petites courses tôt le matin ? Moins de monde, plus de fraîcheur, et plus de plaisir.",
            "Ranger ce qui traîne dehors (jouets, outils, arrosoirs) rend l’espace plus sûr et agréable.",
            "Un petit moment à l’ombre avec de la musique douce ou un jeu de cartes, c’est une bonne manière de faire une pause.",
            "Ouvrir grand les fenêtres le matin, puis fermer volets et rideaux dans l’après-midi aide à conserver la fraîcheur."
        ];
        autresConseils.forEach(c => conseils.push(`${intro} ${c}`));
    }

    // Pluie ou orage
    if (condition.toLowerCase().includes("pluie") || condition.toLowerCase().includes("orage")) {
        const intro = `À ${city}, la pluie ou l’orage demande un peu de vigilance.`;
        const autresConseils = [
            "Un petit coup d’œil aux tapis d’entrée permet d’éviter les glissades.",
            "Vérifiez que vos gouttières sont dégagées.",
            "Ranger les objets extérieurs légers évite qu’ils s’envolent.",
            "Gardez une lampe de secours ou une batterie de téléphone chargée.",
            "Inspecter les arbres proches peut éviter des dégâts.",
            "Surélevez les objets fragiles dans les pièces basses.",
            "Des chaussons antidérapants sont pratiques quand il fait humide.",
            "Assurez-vous que les descentes d’eau ne sont pas bouchées.",
            "Fermez bien les fenêtres pour éviter les infiltrations.",
            "Une veilleuse dans chaque pièce aide en cas de coupure de courant.",
            "Rentrer les outils de jardin préserve leur état.",
            "Relevez les fils électriques au sol pour éviter les risques.",
            "Essuyez les tapis mouillés pour éviter les chutes.",
            "Profitez d’une accalmie pour vérifier la toiture.",
            "Un tapis absorbant limite les flaques à l’entrée.",
            "Fermer les rideaux pendant un orage apaise l’ambiance.",
            "Gardez une liste de contacts d’urgence accessible.",
            "Préparez un petit sac d’urgence (lampe, eau, encas).",
            "Ranger pendant une pluie, c’est aussi s’assurer que tout est protégé."
        ];
        autresConseils.forEach(c => conseils.push(`${intro} ${c}`));
    }

    // Temps froid (<10°C)
    if (temp < 10) {
        const intro = `Quand les températures baissent à ${city}, quelques précautions s’imposent.`;
        const autresConseils = [
            "Vérifiez que le chauffage fonctionne bien.",
            "Un plaid à portée de main est toujours agréable.",
            "Calfeutrez portes et fenêtres contre les courants d’air.",
            "Un bon tapis réduit la sensation de sol froid.",
            "Préparez un chauffage d’appoint si besoin.",
            "Ayez du thé, de la soupe ou des boissons chaudes en réserve.",
            "Un détecteur de monoxyde de carbone est essentiel si vous chauffez au gaz.",
            "Vérifiez les tuyaux extérieurs pour éviter le gel.",
            "Chaussettes épaisses et semelles confortables sont vos alliées.",
            "Un léger filet d’eau peut éviter le gel des canalisations.",
            "Gardez une lampe torche à portée.",
            "Évitez les sorties prolongées mal couvertes.",
            "Maintenez la ventilation sans trop laisser entrer l’air froid.",
            "Créez un coin douillet pour vous détendre.",
            "Vérifiez le chauffe-eau et le poêle.",
            "Affichez une fiche de numéros utiles en cas de besoin.",
            "N’hésitez pas à parler à un proche si le froid vous pèse."
        ];
        autresConseils.forEach(c => conseils.push(`${intro} ${c}`));
    }

    // Neige ou grêle
    if (condition.toLowerCase().includes("neige") || condition.toLowerCase().includes("grêle")) {
        const intro = `Avec la neige ou la grêle à ${city}, un peu d’anticipation rend les journées plus simples.`;
        const autresConseils = [
            "Dégagez les allées pour circuler en sécurité.",
            "Gardez du sel ou du sable à portée.",
            "Inspectez les branches après une chute de neige.",
            "Un bon éclairage extérieur sécurise les déplacements.",
            "Préparez une trousse d’urgence en cas de blocage.",
            "Ajoutez des repères visibles sur les marches.",
            "Vérifiez que vos chaussures adhèrent bien.",
            "Rentrez les outils ou objets en métal.",
            "Limitez les sorties inutiles.",
            "Gardez une pelle accessible pour déneiger.",
            "Un bon tapis d’entrée évite d’apporter l’humidité.",
            "Dégagez la neige chaque jour facilite l’entretien.",
            "Repérez les zones glissantes autour de la maison.",
            "Prévenez un proche avant de sortir.",
            "Gardez des produits dégivrants prêts.",
            "Installez une barre d’appui si besoin.",
            "Une lumière automatique sécurise les retours le soir.",
            "Des chaussons antidérapants évitent les chutes.",
            "Faites les courses à l’avance en cas d’alerte neige."
        ];
        autresConseils.forEach(c => conseils.push(`${intro} ${c}`));
    }

    // Si aucun conseil spécifique
    if (conseils.length === 0) {
        const intro = `À ${city}, une journée calme peut être l’occasion de faire quelques vérifications utiles.`;
        const autresConseils = [
            "Contrôlez vos détecteurs de fumée.",
            "Vérifiez votre trousse de premiers soins.",
            "Réorganisez les espaces de passage.",
            "Gardez les numéros d’urgence accessibles.",
            "Revoir les consignes de sécurité est une bonne habitude.",
            "Contrôlez les prises électriques.",
            "Rangez les objets lourds ou fragiles.",
            "Testez les alarmes de sécurité.",
            "Préparez un sac de secours.",
            "Vérifiez que les sorties ne sont pas encombrées.",
            "Rangez les objets dangereux.",
            "Fixez les meubles instables.",
            "Évaluez l’éclairage des zones sombres.",
            "Faites un tri dans les produits périmés.",
            "Éliminez ce qui pourrait faire trébucher.",
            "Gardez les téléphones chargés et accessibles.",
            "Bougez les meubles si cela améliore la circulation.",
            "Affichez une fiche avec les contacts importants.",
            "Faites le tour du logement avec un proche."
        ];
        autresConseils.forEach(c => conseils.push(`${intro} ${c}`));
    }

    // Sélection finale
    const selectedMessages = [];
    for (let i = 0; i < 1; i++) {
        if (conseils.length > 0) {
            const randomIndex = Math.floor(Math.random() * conseils.length);
            selectedMessages.push(conseils[randomIndex]);
            conseils.splice(randomIndex, 1);
        }
    }

    return selectedMessages.join("\n• ");
}

// ---
// Gestion de l'historique et du chat
// ---

/**
 * Affiche l'historique de la conversation dans le conteneur dédié.
 */
function displayHistory() {
    historyContainer.innerHTML = ''; // Nettoie le conteneur avant d'afficher
    // Parcours l'historique en sens inverse pour afficher les messages du plus récent au plus ancien
    chatHistory.slice().reverse().forEach(item => {
        const conversationItem = document.createElement('div');
        conversationItem.className = 'conversation-item';

        if (item.question) {
            const questionItem = document.createElement('div');
            questionItem.className = 'history-item history-question';
            questionItem.innerHTML = `<strong>Vous:</strong> ${item.question}`;
            conversationItem.appendChild(questionItem);
        }

        const answerItem = document.createElement('div');
        answerItem.className = 'history-item history-answer';
        answerItem.innerHTML = `<strong>Assistant:</strong> ${item.answer}`;
        conversationItem.appendChild(answerItem);

        const dateItem = document.createElement('div');
        dateItem.className = 'history-date';
        dateItem.textContent = new Date(item.timestamp).toLocaleString();
        conversationItem.appendChild(dateItem);

        historyContainer.appendChild(conversationItem);
    });

    // Fait défiler le conteneur jusqu'en bas pour montrer les derniers messages
    historyContainer.scrollTop = historyContainer.scrollHeight;

    // Met à jour la bulle avec le dernier message de l'historique et le type de bulle actuel du localStorage
    if (chatHistory.length > 0) {
        const lastEntry = chatHistory[chatHistory.length - 1];
        const currentBubbleType = localStorage.getItem('selectedBubble') || 'dialogue';
        updateBubble(currentBubbleType, lastEntry.answer);
    } else {
        // Si l'historique est vide, affiche un message d'accueil initial
        const currentBubbleType = localStorage.getItem('selectedBubble') || 'dialogue';
        updateBubble(currentBubbleType, "Bienvenue ! Je suis là pour vous aider.");
    }
}

/**
 * Ajoute une nouvelle entrée à l'historique de la conversation et met à jour l'affichage.
 * @param {string} question - La question de l'utilisateur (peut être vide pour les messages système).
 * @param {string} answer - La réponse de l'assistant.
 * @param {string} [bubbleType='dialogue'] - Le type de bulle à utiliser pour cette entrée.
 */
function addToHistory(question, answer, bubbleType = 'dialogue') {
    const newEntry = {
        question,
        answer,
        // Utilise le bubbleType passé en paramètre ou celui du localStorage
        bubbleType: bubbleType || localStorage.getItem('selectedBubble') || 'dialogue',
        timestamp: new Date().toISOString()
    };

    chatHistory.push(newEntry);

    // Limite la taille de l'historique pour éviter qu'il ne devienne trop grand
    if (chatHistory.length > 100) {
        chatHistory = chatHistory.slice(chatHistory.length - 100);
    }

    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    displayHistory(); // Appelle displayHistory pour actualiser l'affichage ET la bulle
}

/**
 * Gère l'envoi d'un message par l'utilisateur.
 */
async function handleSendMessage() {
    const question = messageInput.value.trim();
    if (!question) return; // Ne fait rien si le champ est vide

    // Récupère le type de bulle actuellement sélectionné pour la nouvelle entrée
    const currentBubbleType = localStorage.getItem('selectedBubble') || 'dialogue';
    addToHistory(question, "En cours de traitement...", currentBubbleType); // Ajoute le message avec un état de chargement
    messageInput.value = ''; // Efface le champ de saisie

    try {
        let answer;
        // Simule une réponse basée sur la question (ici, seule la météo est gérée)
        if (question.toLowerCase().includes('météo') ||
            question.toLowerCase().includes('temps') ||
            question.toLowerCase().includes('température')) {
            answer = await displayWeather();
        } else {
            answer = "J'ai bien reçu votre message. Comment puis-je vous aider ?"; // Réponse générique
        }

        // Met à jour la dernière entrée de l'historique avec la réponse finale
        if (chatHistory.length > 0) {
            chatHistory[chatHistory.length - 1].answer = answer;
            // S'assure que le bubbleType de la dernière entrée correspond à celui qui était actif
            chatHistory[chatHistory.length - 1].bubbleType = currentBubbleType;
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
            displayHistory(); // Actualise l'affichage ET la bulle avec la réponse finale
        }

    } catch (error) {
        console.error("Erreur:", error);
        const errorMessage = "Désolé, une erreur s'est produite lors du traitement de votre demande.";
        // En cas d'erreur, met à jour la dernière entrée avec un message d'erreur
        if (chatHistory.length > 0) {
            chatHistory[chatHistory.length - 1].answer = errorMessage;
            chatHistory[chatHistory.length - 1].bubbleType = currentBubbleType;
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
            displayHistory();
        }
    }
}

// ---
// Gestion de l'envoi et de la réponse
// ---
document.addEventListener("DOMContentLoaded", function () {
  if (!sendButton) {
    console.warn(" Bouton #sendButton introuvable");
  } else {
    console.log("Bouton trouvé, écouteur ajouté");
    sendButton.addEventListener("click", envoyer);
  }
});

async function envoyer() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();
    input.value = "";

    if (!message) return;

    // Affiche la question dans l'historique
    const historyContainer = document.getElementById("historyContainer");
    const questionItem = document.createElement("div");
    questionItem.className = "history-item";
    questionItem.textContent = message;
    historyContainer.appendChild(questionItem);

    const bubbleType = localStorage.getItem('selectedBubble') || 'dialogue';
    let responseText = "";

    // Pré-affiche une bulle vide
    updateBubble(bubbleType, ""); 

    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mistral",
                prompt: message,
                stream: true
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true }).trim();
            const lines = chunk.split('\n');

            for (let line of lines) {
                if (!line) continue;
                try {
                    const json = JSON.parse(line);
                    if (json.response) {
                        responseText += json.response;
                        updateBubble(bubbleType, responseText);
                    }
                } catch (err) {
                    console.warn("Erreur de parsing JSON stream :", err);
                }
            }
        }

    } catch (err) {
        console.error("Erreur lors de la génération :", err);
        updateBubble(bubbleType, "⚠️ Erreur de génération.");
    }
}



/**
 * Gère l'initialisation de l'historique au chargement de la page.
 * @param {string} preventionMessage - Le message de prévention initial généré par la météo.
 */
function manageHistory(preventionMessage) {
    chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

    // Ajoute le message de prévention initial s'il est disponible et non déjà présent
    if (preventionMessage && typeof preventionMessage === 'string') {
        const isWeatherMessagePresent = chatHistory.some(entry =>
            entry.answer === preventionMessage && (entry.question === '' || entry.question === null)
        );

        if (!isWeatherMessagePresent) {
            const newEntry = {
                question: '', // Pas de question pour un message système/initial
                answer: preventionMessage,
                bubbleType: localStorage.getItem('selectedBubble') || 'dialogue', // Utilise le type de bulle actuel du localStorage
                timestamp: new Date().toISOString()
            };
            chatHistory.push(newEntry);
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        }
    }
}

// ---
// Initialisation de l'application
// ---

/**
 * Fonction principale d'initialisation de l'application.
 * Appelée une seule fois après le chargement complet du DOM.
 */
async function initApp() {
    //Charger le fond d'écran sauvegardé
    const fond = localStorage.getItem('selectedBackground');
    if (fond) {
        document.body.style.backgroundImage = `url('${fond}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    }
    //Mettre à jour l'avatar principal
    const savedAvatar = localStorage.getItem('avatarImage');
    updateMainAvatar(savedAvatar);
    //Initialiser la gestion de l'historique et récupérer le message de prévention initial (météo)
    const preventionMessage = await displayWeather();
    manageHistory(preventionMessage); // Remplit l'historique avec le message initial si nécessaire

    //Réagir aux changements de 'selectedBubble' dans le localStorage (pour les autres onglets)
    window.addEventListener('storage', function(e) {
        if (e.key === 'selectedBubble') {
            const newBubbleType = e.newValue;
            // Met à jour la bulle avec le dernier message de l'historique si disponible
            let lastMessage = "";
            if (chatHistory.length > 0) {
                lastMessage = chatHistory[chatHistory.length - 1].answer;
            }
            updateBubble(newBubbleType, lastMessage || "Bienvenue ! Je suis là pour vous aider.");
        }
    });

    //Configurer les écouteurs d'événements pour le champ de saisie et le bouton d'envoi
    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { // Envoie au pressage de "Entrée" (sans "Shift")
            e.preventDefault();
            handleSendMessage();
        }
    });
    window.addEventListener('storage', function(e) {
        if (e.key === 'mainAvatar') {
            updateMainAvatar(e.newValue);
        }
    });
    // Afficher l'historique et la bulle initiale dès le chargement de la page
    displayHistory();
}

// ---
// Événements DOM
// ---

// Attendre que tout le DOM soit chargé avant d'initialiser l'application
document.addEventListener('DOMContentLoaded', initApp);

// Bouton "Voir plus" (si vous l'implémentez, cette logique doit être ajoutée)
document.getElementById('loadMore')?.addEventListener('click', function() {
    console.log("Fonctionnalité 'Voir plus' à implémenter");
    // Exemple : charger plus d'historique depuis localStorage ou une API
});

// Gérer le changement du sélecteur de bulle sur la page (si vous avez un élément UI pour cela)
document.addEventListener('DOMContentLoaded', () => {
    const bubbleSelector = document.getElementById('bubbleSelector'); // Assurez-vous d'avoir un élément avec cet ID dans votre HTML

    if (bubbleSelector) {
        // Charger la sélection actuelle du localStorage au démarrage
        const savedBubbleType = localStorage.getItem('selectedBubble') || 'dialogue';
        bubbleSelector.value = savedBubbleType;

        // Écouteur pour le changement de sélection dans l'UI
        bubbleSelector.addEventListener('change', function() {
            const newBubbleType = this.value;
            localStorage.setItem('selectedBubble', newBubbleType); // Sauvegarde le nouveau type

            // Met à jour la bulle IMMÉDIATEMENT dans le même onglet
            let lastMessage = "";
            if (chatHistory.length > 0) {
                lastMessage = chatHistory[chatHistory.length - 1].answer;
            }
            updateBubble(newBubbleType, lastMessage || "Bienvenue ! Je suis là pour vous aider.");
            // Si vous voulez aussi que l'historique affiché mette à jour ses bulles (si elles sont interactives)
            // displayHistory(); // Cela re-générera l'historique avec le nouveau type de bulle si pertinent
        });
    }
});