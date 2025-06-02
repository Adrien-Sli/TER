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

function updateBubble(bubbleType, text = "") {
    const centerPanel = document.querySelector('.center-panel');
    if (!centerPanel) {
        console.error("Element .center-panel non trouvé");
        return;
    }

    console.log("Chargement de la bulle de type:", bubbleType);

    const isCri = bubbleType === 'cri';
    const displayText = isCri ? text.toUpperCase() : text;
    const maxWidth = 600;
    const lineHeight = 40;
    const padding = bubbleType === 'cri' ? 140 : 60;
    const tailHeight = 60;

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

    bubbleWidth = Math.max(300, bubbleWidth + 2 * padding + 40);
    const svgWidth = bubbleWidth + 100;
    const svgHeight = totalHeight + 100;

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


// Attendre que tout le DOM soit chargé
document.addEventListener('DOMContentLoaded', initPage);

document.addEventListener('DOMContentLoaded', async function() {
    // Appliquer le fond d'écran sauvegardé
    const savedBg = localStorage.getItem('selectedBackground');
    if (savedBg) {
        document.body.style.backgroundImage = `url('${savedBg}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    }
    const preventionMessage = await displayWeather(); // ◄◄◄ Récupère le message
    manageHistory(preventionMessage);// Appeler la météo
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

        return preventionMessage;

    } catch (error) {
        console.error("Erreur lors de la récupération de la météo:", error);
        document.getElementById('weatherInfo').innerHTML = '<span>Météo indisponible</span>';
    }
}

function generatePreventionMessage(temp, condition, city) {
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
    for (let i = 0; i < 1; i++) {
        if (conseils.length > 0) {
            const randomIndex = Math.floor(Math.random() * conseils.length);
            selectedMessages.push(conseils[randomIndex]);
            conseils.splice(randomIndex, 1); // Évite les doublons
        }
    }

    return selectedMessages.join("\n• ");
    
}
// Ajoutez cette fonction pour gérer l'historique
function manageHistory(preventionMessage) { 
    let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    const historyContainer = document.getElementById('historyContainer');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    if (preventionMessage) {
        // Supprimer les anciens messages système (question vide)
        history = history.filter(entry => entry.question.trim() !== '');
        
        // Ajouter le nouveau message en premier
        history.unshift({
            question: '', 
            answer: preventionMessage,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('chatHistory', JSON.stringify(history));
    }
    // Fonction pour afficher l'historique
    function displayHistory() {
        historyContainer.innerHTML = '';
        history.slice().reverse().forEach(item => {
            // Conteneur pour chaque paire question-réponse
            const conversationItem = document.createElement('div');
            conversationItem.className = 'conversation-item';
            
            // Question
            if (item.question) { 
                const questionItem = document.createElement('div');
                questionItem.className = 'history-item history-question';
                questionItem.innerHTML = `<strong>Vous:</strong> ${item.question}`;
                conversationItem.appendChild(questionItem);
            }

            // Réponse
            const answerItem = document.createElement('div');
            answerItem.className = 'history-item history-answer';
            answerItem.innerHTML = `<strong>Assistant:</strong> ${item.answer}`;
            conversationItem.appendChild(answerItem);

            // Date
            const dateItem = document.createElement('div');
            dateItem.className = 'history-date';
            dateItem.textContent = new Date(item.timestamp).toLocaleString();
            conversationItem.appendChild(dateItem);

            historyContainer.appendChild(conversationItem);
            updateBubble(item.bubbleType, item.answer);
        });
        
        // Faire défiler vers le bas pour voir les nouveaux messages
        historyContainer.scrollTop = historyContainer.scrollHeight;
    }

    // Fonction pour ajouter une entrée à l'historique
    function addToHistory(question, answer, bubbleType) {
        const newEntry = { 
            question, 
            answer, 
            bubbleType, // Stocker le type de bulle
            timestamp: new Date().toISOString() 
        };
        
        history.push(newEntry);
        
        // Limiter l'historique à 100 entrées (peut être ajusté)
        if (history.length > 100) {
            history = history.slice(history.length - 100);
        }
        
        localStorage.setItem('chatHistory', JSON.stringify(history));
        displayHistory();
    }

    // Gestion du clic sur le bouton Envoyer
    sendButton.addEventListener('click', async function() {
        
        const question = messageInput.value.trim();
        if (question) {
            // Ajouter la question à l'historique immédiatement avec une réponse vide
            addToHistory(question, "En cours de traitement...");
            
            // Effacer le champ de saisie
            messageInput.value = '';
            
            try {
                // Ici vous devriez appeler votre API ou logique de génération de réponse
                // Pour l'exemple, nous utilisons une réponse simulée
                let answer;
                
                // Si la question concerne la météo
                if (question.toLowerCase().includes('météo') || 
                    question.toLowerCase().includes('temps') ||
                    question.toLowerCase().includes('température')) {
                    // Générer une réponse météo personnalisée
                    const rawData = localStorage.getItem('formulaireData') || localStorage.getItem('userData');
                    if (rawData) {
                        const dataUser = JSON.parse(rawData);
                        const city = dataUser.habitation || 'Grenoble';
                        answer = displayWeather();
                    } else {
                        answer = "Je ne peux pas accéder aux informations météo sans connaître votre ville. Veuillez configurer votre profil.";
                    }
                } else {
                    // Réponse par défaut
                    answer = "J'ai bien reçu votre message. Voici quelques conseils généraux : " + 
                             generatePreventionMessage().split('\n• ').slice(0, 3).join('\n• ');
                }
                
                // Mettre à jour la dernière entrée dans l'historique avec la vraie réponse
                if (history.length > 0) {
                    history[history.length - 1].answer = answer;
                    localStorage.setItem('chatHistory', JSON.stringify(history));
                    displayHistory();
                }
                
                // Mettre à jour la bulle avec la réponse
                const bubbleType = localStorage.getItem('selectedBubble') || 'dialogue';
                updateBubble(bubbleType, answer);
                
            } catch (error) {
                console.error("Erreur lors de la génération de la réponse:", error);
                
                // Mettre à jour avec un message d'erreur
                if (history.length > 0) {
                    history[history.length - 1].answer = "Désolé, une erreur s'est produite lors du traitement de votre demande.";
                    localStorage.setItem('chatHistory', JSON.stringify(history));
                    displayHistory();
                }
                
                updateBubble(localStorage.getItem('selectedBubble') || 'dialogue', "Désolé, une erreur s'est produite.");
            }
        }
    });

    // Gestion de la touche Entrée
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });

    // Bouton "Voir plus" - pourrait charger plus d'historique si pagination implémentée
    document.getElementById('loadMore').addEventListener('click', function() {
        // Implémentation potentielle pour charger plus d'historique
        console.log("Fonctionnalité 'Voir plus' à implémenter");
    });

    // Afficher l'historique au chargement
    displayHistory();
}

