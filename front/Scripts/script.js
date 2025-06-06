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
    const conseils = [];

    // Météo très chaude (30°C+)
    if (temp >= 30) {
        conseils.push(
            `En temps de forte chaleur, penser à boire un peu d’eau régulièrement.`,
            "Lorsqu'il fait chaud n'hésiter pas a aérrer vos pieces en soirée cela peut rendre votre air plus agréable.",
            "Penser a fermer vos volets et vos rideaux en journée cela vous permetera de garder la fraîcheur à l’intérieur.",
            "Quand il fait chaud éviter d’utiliser trop d’appareils électriques permet de limiter la chaleur dans la maison.",
            "Si vous avez trop chaud, vous pouvez placer un petit bol d’eau devant un ventilateur pour humidifier et rafraîchir l’air ambiant.",
            "Par temps chaud il est préférable de choisir des vêtements légers comme des vétements en coton par exemple.",
            "Pour rester hydraté en temps de haute chaleur il est conseillé d'éviter les boissons alcoolisées ou très caféinées.",
            "Si vous aimez les plantes et qu'il fait chaud, sacher qu'avoir quelques plantes d’intérieur peut contribuer à rendre l’air plus agréable.",
            "Penser a fermer les pièces inutilisées permet souvent de mieux conserver la fraîcheur là où on se repose.",
            "Salut pourquoi ne pas préparer un repas froids aujourd'hui cela évitera de chauffer la cuisine et sera agréables puisqu'il annoce de forte température aujourd'hui.",
            "N'hésité pas à installer des petits ventilateurs dans les pièces fréquament utilisées afin d'améliorer votre confort en période de forte chaleur.",
            "Il peut être interessant d'installer des rideaux plus opaques dans les pièces exposées au soleil pour permettre de réduire la chaleur.",
            "Rester dans les pièces les plus fraîches aux heures chaudes de la journée permet éviter un coup de chaleur.",
            "Penser à faire une petite pause à l’ombre après chaque activité extérieure peut éviter la fatigue.",
            "Garder un petit brumisateur à portée de main peut rendre la température plus supportable lorsqu'il fait chaud.",
            "Si vous prévoyer de sortir aujourdhui pensez a couvrire votre tête, Cela vous évitera d'attraper une insolation ."
        );
    }

    // Temps ensoleillé et doux (20-29°C)
    else if (temp >= 20 && condition.toLowerCase().includes("soleil")) {
        conseils.push(
            `Le soleil est agréable à ${city}, cela peut être un bon moment pour s’assurer que tout fonctionne bien à la maison.`,
            "Il fait beau aujourd’hui, alors n’hésitez pas à faire une petite promenade matinale ou en fin de journée : c’est agréable et ça permet de bouger sans souffrir de la chaleur.",
            "Il peut être judicieux de préparer un sac avec l’essentiel pour vos sorties : chapeau, lunettes de soleil, crème solaire et bouteille d’eau.",
            "Garder un éventail ou un brumisateur à portée de main, c’est un petit plaisir simple pour mieux supporter la chaleur.",
            "Penser a vérifier l’état des moustiquaires et ouvrer quelques fenêtres en fin de journée, c’est une bonne façon d’aérer sans faire entrer d’insectes.",
            "Et si vous en profitiez pour nettoyer légèrement vos ventilateurs ou grilles d’aération ? Un appareil bien entretenu est plus efficace et plus silencieux.",
            "Il peut être intéressant de jeter un œil aux plantes d’intérieur ou du balcon : un petit arrosage ou déplacement à l’ombre peut leur faire du bien.",
            "Saviez-vous qu’un petit coin lecture à l’ombre, avec un fauteuil confortable, peut devenir l’endroit préféré de votre après-midi ?",
            "Il fait beau, pourquoi ne pas partager un café ou un jus frais à l’extérieur avec un voisin ou un proche ? Un moment simple qui fait du bien.",
            "Penser à porter des vêtements légers, amples et de couleur claire peut aider à rester à l’aise toute la journée.",
            "Il peut être utile de vérifier que les rampes, poignées ou mains courantes exposées au soleil ne sont pas trop chaudes au toucher.",
            "Un petit tour au marché ou à la boulangerie tôt le matin, c’est l’occasion de profiter de l’air frais et de croiser quelques visages familiers.",
            "Pensez à ranger les objets ou outils laissés sur la terrasse ou dans le jardin, cela évite les risques de chute et garde l’espace agréable.",
            "Et si vous organisiez une pause à l’ombre avec un peu de musique douce ou un jeu de mémoire ? Une bonne idée pour se détendre sans s’exposer.",
            "Il peut être agréable de rafraîchir la maison en ouvrant grand tôt le matin, puis en fermant les rideaux pour garder la fraîcheur."
        );
    }

    // Temps pluvieux ou orageux
    if (condition.toLowerCase().includes("pluie") || condition.toLowerCase().includes("orage")) {
        conseils.push(
            `Quand il pleut à ${city}, prendre le temps de vérifier les zones d’entrée peut prévenir les glissades.`,
            "Nettoyer les gouttières ou vérifier les joints de fenêtres peut éviter bien des tracas.",
            "Installer un petit tapis absorbant près de la porte est souvent utile par temps humide.",
            "Il peut être bon de ranger les objets légers qui risquent d’être emportés par le vent.",
            "Garder une lampe de secours et quelques bougies à portée de main peut être rassurant.",
            "Un rapide coup d'œil aux arbres ou branches proches peut prévenir certains risques en cas de vent fort.",
            "Penser à surélever les produits fragiles ou dangereux en cas de fortes pluies est une précaution utile.",
            "Avoir des chaussons antidérapants à l’entrée rend les retours au sec plus sûrs.",
            "Vérifier que les descentes d’eau pluviale ne sont pas obstruées aide à éviter les inondations.",
            "Fermer doucement les fenêtres exposées peut éviter que l’eau ne s’infiltre.",
            "Préparer une petite lampe dans chaque pièce peut être rassurant si l’orage coupe le courant.",
            "Ranger les outils de jardin dans un endroit sec évite la rouille.",
            "Relever les fils électriques au sol évite les accidents avec l’humidité.",
            "Un petit contrôle des tapis mouillés permet d’éviter les chutes.",
            "Vérifier si les tuiles ou bardeaux sont bien en place est une bonne précaution.",
            "Il peut être utile de repérer les endroits glissants à l’intérieur et d’y mettre un tapis.",
            "Fermer les rideaux en cas d’orage peut rendre l’atmosphère plus sereine.",
            "Gardez une liste de numéros utiles à proximité en cas de besoin.",
            "Prévoir un petit sac d’urgence avec lampe, batterie et eau peut toujours servir.",
            "Il fait beau ajourd'hui c'est le temps parfait pour une petite randonné ou une sortie en exterieur.",
            "Prendre quelques minutes pour s’assurer que tout est bien rangé autour de la maison est rassurant."
        );
    }

    // Temps froid (<10°C)
    if (temp < 10) {
        conseils.push(
            `Quand il fait froid à ${city}, il est souvent rassurant de vérifier que le chauffage fonctionne correctement.`,
            "Prévoir une couverture ou un plaid bien à portée de main peut offrir un confort immédiat en cas de coup de froid.",
            "Il peut être utile de calfeutrer les portes ou les fenêtres pour limiter les courants d’air.",
            "Saviez-vous qu’un tapis bien fixé évite les glissades sur un sol froid, tout en ajoutant de la chaleur sous les pieds ?",
            "Garder à disposition une petite source de chaleur d’appoint peut s’avérer pratique en cas de besoin.",
            "Penser à avoir quelques boissons chaudes et de quoi grignoter en réserve, cela peut faire la différence pendant les jours plus rigoureux.",
            "Un petit contrôle du détecteur de monoxyde de carbone est recommandé lorsqu'on utilise des appareils de chauffage.",
            "Pensez a contrôler les tuyaux extérieurs ou exposés, cela permet parfois d’éviter des désagréments liés au gel.",
            "Des chaussons chauds ou des semelles bien épaisses peuvent améliorer le confort à la maison lorsqu'il fait froid.",
            "Laisser couler un léger filet d’eau par grand froid peut parfois éviter le gel des canalisations.",
            "Il peut être pratique de garder une lampe torche ou une source de lumière à portée de main en cas de coupure.",
            "Limiter les sorties longues ou mal protégées est une bonne façon d’éviter le coup de froid.",
            "Il peut être utile de vérifier que les systèmes de ventilation ne laissent pas entrer trop d’air froid.",
            "Prévoir un petit coin douillet avec coussins, plaid et lumière douce rend l’hiver plus agréable.",
            "S’assurer que le chauffe-eau fonctionne bien permet de ne pas manquer d’eau chaude quand on en a le plus besoin.",
            "Saviez-vous qu’une vérification annuelle de votre cheminée ou poêle contribue à votre sécurité et à leur bon fonctionnement ?",
            "Tenir à jour une liste de numéros utiles (voisin, médecin, dépannage) est toujours un bon réflexe en hiver.",
            "Et si le froid devient difficile à gérer, n’hésitez pas à demander un coup de main : c’est une preuve de bon sens, pas de faiblesse."
        );
    }

    // Neige ou grêle
    if (condition.toLowerCase().includes("neige") || condition.toLowerCase().includes("grêle")) {
        conseils.push(
            `Lorsqu’il neige à ${city}, il peut être utile de rendre les allées bien visibles et dégagées.`,
            "Avoir un peu de sel ou sable à portée de main peut rendre les déplacements plus sûrs.",
            "Penser à vérifier le toit ou les arbres autour de la maison est souvent judicieux.",
            "Installer un bon éclairage près des entrées peut éviter bien des mésaventures le soir venu.",
            "Préparer une trousse avec couvertures, lampe et collations peut être rassurant en cas de besoin.",
            "Des repères visuels sur les marches extérieures peuvent aider à mieux se déplacer.",
            "Contrôler de temps en temps l’état des chaussures d’extérieur peut faire une vraie différence en hiver.",
            "Mettre à l’abri les objets métalliques ou les outils limite leur usure.",
            "Réduire les déplacements à l’extérieur quand il neige peut rendre la journée plus agréable.",
            "Avoir une pelle à neige dans un endroit accessible peut toujours être utile.",
            "Mettre des tapis à l’entrée permet d’éviter d’apporter de l’eau à l’intérieur.",
            "Un petit coup de balai sur les marches évite qu’elles deviennent trop glissantes.",
            "Faire un repérage du terrain la veille d’une neige annoncée peut aider à anticiper.",
            "Penser à prévenir un proche ou voisin lors de déplacements en hiver est une bonne habitude.",
            "Stocker les produits dégivrants à portée de main rend les sorties plus simples.",
            "Installer une petite rampe ou barre d’appui peut sécuriser certaines zones.",
            "Mettre une lampe automatique à l’entrée peut rendre le retour plus sûr.",
            "Garder une paire de chaussons bien antidérapants à portée de main limite les risques de chute.",
            "Revoir son éclairage extérieur peut aider à se sentir plus à l’aise pour rentrer en fin de journée.",
            "Anticiper les besoins alimentaires ou de médicaments avant un épisode neigeux peut soulager l’esprit."
        );
    }

    // Messages génériques si aucune condition spécifique
    if (conseils.length === 0) {
        conseils.push(
            `À ${city}, une journée calme peut être l’occasion de faire quelques vérifications tranquilles à la maison.`,
            "Un petit contrôle des détecteurs de fumée et de monoxyde de carbone est toujours utile.",
            "S’assurer que les trousses de premiers soins sont à jour peut éviter des soucis plus tard.",
            "Réorganiser légèrement les espaces de passage peut rendre les déplacements plus sûrs.",
            "Il peut être réconfortant d’avoir les numéros importants facilement accessibles.",
            "Prendre quelques minutes pour revoir les consignes de sécurité avec ses proches est une bonne habitude.",
            "Un rapide contrôle des prises électriques permet de prévenir les petits incidents.",
            "Faire le point sur les objets lourds ou fragiles mal rangés est souvent utile.",
            "Tester les alarmes si la maison en est équipée peut rassurer tout le monde.",
            "Préparer un petit sac de secours avec lampe, piles, médicaments peut rendre service.",
            "Vérifier que les issues de secours ne sont pas encombrées peut être utile.",
            "Mettre les objets dangereux hors de portée ou bien rangés évite les accidents.",
            "Penser à bien fixer les meubles hauts ou instables apporte plus de sécurité.",
            "Il peut être bon d’évaluer l’éclairage des zones sombres ou peu utilisées.",
            "Faire un petit tri dans les produits périmés ou inutiles est souvent bénéfique.",
            "Vérifier les sols pour éliminer ce qui pourrait faire trébucher est une bonne habitude.",
            "S’assurer que les téléphones sont facilement accessibles et chargés est rassurant.",
            "Changer l’emplacement de certains meubles peut parfois faciliter la circulation.",
            "Préparer une petite liste de contacts d’urgence affichée dans la cuisine ou le salon peut toujours servir.",
            "Faire un tour du domicile à deux peut permettre de voir ce qu’on oublie parfois seul."
        );
    }

    // Sélection aléatoire de 6 messages (au lieu de 3 si tu veux équilibrer)
    const selectedMessages = [];
    for (let i = 0; i < 1; i++) { // Changé à 1 message pour la bulle initiale
        if (conseils.length > 0) {
            const randomIndex = Math.floor(Math.random() * conseils.length);
            selectedMessages.push(conseils[randomIndex]);
            conseils.splice(randomIndex, 1); // Évite les doublons
        }
    }

    return selectedMessages.join("\n• "); // Joindre avec des puces si plusieurs messages
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
    console.warn("❗ Bouton #sendButton introuvable");
  } else {
    console.log("✅ Bouton trouvé, écouteur ajouté");
    sendButton.addEventListener("click", envoyer);
  }
});

function envoyer() {
    console.log("🚀 Fonction envoyer() déclenchée");

    const input = document.getElementById("messageInput");
    const message = input.value.trim();

    if (!message) {
        console.warn("⛔ Aucun message à envoyer.");
        return;
    }

    // Affiche la question dans l'historique (optionnel)
    const historyContainer = document.getElementById("historyContainer");
    const questionItem = document.createElement("div");
    questionItem.className = "history-item";
    questionItem.textContent = message;
    historyContainer.appendChild(questionItem);

    // Appel à Ollama
    fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "mistral",
            prompt: message,
            stream: false
        })
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log("✅ Réponse Ollama :", data);
        const responseText = data.response || "[aucune réponse]";
        updateBubble("dialogue", responseText);
    })
    .catch(error => {
        console.error("❌ Erreur lors de la requête vers Ollama :", error);
        updateBubble("dialogue", "⚠️ Erreur : impossible de contacter le modèle.");
    });

    // Réinitialise le champ
    input.value = "";
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
    // 1. Charger le fond d'écran sauvegardé
    const fond = localStorage.getItem('selectedBackground');
    if (fond) {
        document.body.style.backgroundImage = `url('${fond}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    }

    // 2. Initialiser la gestion de l'historique et récupérer le message de prévention initial (météo)
    const preventionMessage = await displayWeather();
    manageHistory(preventionMessage); // Remplit l'historique avec le message initial si nécessaire

    // 3. Réagir aux changements de 'selectedBubble' dans le localStorage (pour les autres onglets)
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

    // 4. Configurer les écouteurs d'événements pour le champ de saisie et le bouton d'envoi
    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { // Envoie au pressage de "Entrée" (sans "Shift")
            e.preventDefault();
            handleSendMessage();
        }
    });

    // 5. Afficher l'historique et la bulle initiale dès le chargement de la page
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