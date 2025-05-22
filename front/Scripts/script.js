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
            `À ${city}, penser à boire un peu d’eau régulièrement, même sans ressentir la soif, peut vraiment aider.`,
            "Créer un peu de courant d’air en soirée peut rendre l’atmosphère plus agréable.",
            "Fermer les volets ou rideaux en journée permet souvent de garder la fraîcheur à l’intérieur.",
            "Éviter d’utiliser trop d’appareils électriques aide à limiter la chaleur dans la maison.",
            "Placer un petit bol d’eau devant un ventilateur peut légèrement rafraîchir l’air ambiant.",
            "Préparer à l’avance un endroit frais pour conserver les médicaments peut être prudent.",
            "Choisir des vêtements légers en coton peut améliorer le confort par temps chaud.",
            "Il peut être utile d’humidifier doucement la nuque ou les poignets en cas de forte chaleur.",
            "Éviter les boissons alcoolisées ou très caféinées aide à mieux rester hydraté.",
            "Avoir quelques plantes d’intérieur peut contribuer à rendre l’air plus agréable.",
            "Fermer les pièces inutilisées permet souvent de mieux conserver la fraîcheur là où on se repose.",
            "Les repas froids évitent de chauffer la cuisine et restent agréables en période chaude.",
            "Installer un petit ventilateur dans les pièces utilisées peut améliorer le confort.",
            "Un gant humide sur le front ou les bras peut apporter un soulagement temporaire.",
            "Installer des rideaux plus opaques dans les pièces exposées peut être bénéfique.",
            "Rester dans les pièces les plus fraîches aux heures chaudes de la journée peut éviter un coup de chaleur.",
            "Penser à faire une petite pause à l’ombre après chaque activité extérieure peut éviter la fatigue.",
            "Faire vérifier son système d’aération ou de climatisation avant les fortes chaleurs est souvent utile.",
            "Garder une serviette humide dans le frigo pour s’en servir en cas de besoin peut être une astuce rafraîchissante.",
            "Un petit brumisateur à portée de main peut être agréable au fil de la journée."
        );
    }

    // Temps ensoleillé et doux (20-29°C)
    else if (temp >= 20 && condition.toLowerCase().includes("soleil")) {
        conseils.push(
            `Le soleil est agréable à ${city}, mais c’est souvent un bon moment pour s’assurer que tout fonctionne bien à la maison.`,
            "Un petit nettoyage des ventilateurs ou climatiseurs peut améliorer leur efficacité.",
            "Un contrôle rapide des stores et parasols permet de bien profiter de la terrasse ou du balcon.",
            "Ranger les produits sensibles à la chaleur dans un endroit ombragé peut éviter des désagréments.",
            "S’assurer que les moustiquaires sont en bon état permet de profiter de l’air sans les insectes.",
            "Préparer un sac avec un chapeau, une bouteille d’eau et un peu de crème solaire près de la porte peut être bien pratique.",
            "Il est souvent utile de vérifier les câbles ou objets exposés longtemps au soleil.",
            "Penser à limiter les efforts physiques aux heures les plus fraîches peut éviter la fatigue.",
            "Profiter de cette météo pour organiser un peu l’espace de vie rend les journées plus agréables.",
            "Vérifier les systèmes d’arrosage permet d’éviter les flaques et glissades involontaires.",
            "Jeter un œil aux meubles de jardin assure plus de confort et de stabilité.",
            "Prévoir une casquette ou un chapeau pour les sorties offre une protection supplémentaire.",
            "Tester les poignées métalliques exposées au soleil évite les brûlures accidentelles.",
            "Faire une promenade tôt le matin ou en fin de journée permet de profiter sans trop de chaleur.",
            "Laisser les portes ouvertes entre pièces peut faciliter la circulation de l’air.",
            "Ranger les outils après jardinage limite les risques de trébuchement.",
            "Faire de petits gestes d’aération en fin d’après-midi permet de renouveler l’air en douceur.",
            "Garder un éventail ou brumisateur à portée de main peut rendre les journées plus agréables.",
            "Se reposer à l’ombre pendant les heures chaudes permet d’éviter la fatigue excessive.",
            "Un petit coin tranquille à l’intérieur avec un peu de musique ou de lecture peut faire du bien."
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
            "Prendre quelques minutes pour s’assurer que tout est bien rangé autour de la maison est rassurant."
        );
    }

    // Temps froid (<10°C)
    if (temp < 10) {
        conseils.push(
            `Quand il fait froid à ${city}, s’assurer que le chauffage fonctionne bien est souvent rassurant.`,
            "Prévoir une couverture supplémentaire ou un plaid à portée de main apporte un confort rapide.",
            "Penser à isoler les courants d’air peut aider à garder la chaleur à l’intérieur.",
            "Vérifier que les tapis tiennent bien en place évite de glisser sur un sol froid.",
            "Garder à proximité de quoi se chauffer en cas de panne éventuelle est une bonne précaution.",
            "Il est souvent utile de préparer un petit stock de nourriture ou de boissons chaudes.",
            "Des rideaux plus épais ou un tapis épais peuvent rendre l’atmosphère plus chaleureuse.",
            "Un petit contrôle du détecteur de monoxyde de carbone peut renforcer la sécurité en hiver.",
            "Contrôler les conduites d’eau exposées évite parfois les problèmes liés au gel.",
            "Mettre des chaussons chauds peut contribuer à un meilleur confort au quotidien.",
            "Laisser un peu couler l’eau par grand froid peut parfois empêcher le gel dans les tuyaux.",
            "Prévoir une source de lumière d’appoint au cas où le froid entraîne une coupure de courant.",
            "Organiser ses déplacements en limitant les sorties trop longues est souvent plus sûr.",
            "Éviter les tapis trop fins sur le carrelage froid peut prévenir les glissades.",
            "Contrôler les systèmes de ventilation empêche l’air froid d’entrer inutilement.",
            "Prévoir un petit coin douillet bien aménagé peut rendre l’hiver plus doux.",
            "S’assurer que le chauffe-eau fonctionne bien permet d’avoir de l’eau chaude sans surprise.",
            "Faire une vérification annuelle de la cheminée ou des poêles est rassurant.",
            "Tenir à jour une liste de contacts en cas de besoin rapide est toujours utile.",
            "Ne pas hésiter à demander de l’aide si le froid devient difficile à gérer, cela fait partie des bons réflexes."
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
        });
        
        // Faire défiler vers le bas pour voir les nouveaux messages
        historyContainer.scrollTop = historyContainer.scrollHeight;
    }

    // Fonction pour ajouter une entrée à l'historique
    function addToHistory(question, answer) {
        const newEntry = { 
            question, 
            answer, 
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
                
                updateBubble('dialogue', "Désolé, une erreur s'est produite.");
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

