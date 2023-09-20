/**
 * Vitesses d'exécution disponibles
 */
let intervallesDisponibles = {
    'normal': 400,
    'rapide': 200,
    'tresrapide': 100
};
/**
 * Variable de stockage de l'état du jeu
 */
let gameState = {
    aliveCells: [],
    nbVoisins: [],
    voisins: []
};
/**
 * Objet HTMLElement de l'élément DOM de la table
 */
let laTable = null;

/**
 * Fonction d'initialisation de la table
 * 
 * @param {int} nbRow Nombre de lignes
 * @param {int} nbCol Nombre de colonnes
 */
let initGame = (nbRow, nbCol) => {
    let ts1 = performance.now(),
        ts2 = null,
        html = '';
    laTable.innerHTML = '';
    gameState.nbVoisins = new Array(nbRow);
    gameState.voisins = new Array(nbRow);
    for (let i = 0; i < nbRow; i++) {
        html += '<tr>';
        gameState.nbVoisins[i] = new Array(nbCol);
        gameState.voisins[i] = new Array(nbCol);
        gameState.nbVoisins[i].fill(0);
        for (let j = 0; j < nbCol; j++) {
            let estCelluleVivante = Math.floor(Math.random() * 2);
            html += '<td class="' + (estCelluleVivante != 0 ? 'estvivante':'') + '" data-row="' + i + '" data-col="' + j + '"></td>';
        }
        html += '</tr>';
    }
    laTable.innerHTML= html;
    gameState.aliveCells = Array.from(laTable.getElementsByClassName("estvivante"));
    // Calcul des voisins à l'init
    for (let i = 0, row; row = laTable.parentElement.rows[i]; i++) {
        //iterate through rows
        //rows would be accessed using the "row" variable assigned in the for loop
        for (let j = 0, maCellule; maCellule = row.cells[j]; j++) {
            gameState.voisins[i][j] = getVoisins(maCellule, nbRow, nbCol);
        }
    };
    document.getElementById("generation").value = 0;
    ts2 = performance.now();
    console.log('initGame : ' + (ts2 - ts1) + 'ms');
}

/**
 * Récupère la liste des cellules voisines d'une case
 * 
 * @param {HTMLElement} cellule Cellule sont il faut récupérer les voisins
 * @param {int} rowMax Nombre de lignes
 * @param {int} colMax Nombre de colonnes
 * @returns {array<HTMLElement>} Liste des objets des cellules adjacentes
 */
let getVoisins = (cellule, rowMax, colMax) => {
    // fonction pour obtenir les voisins de la cellule
    let valeurDeRetour = [],
        row = cellule.dataset.row * 1,
        col = cellule.dataset.col * 1,
        lignePrecedente = row - 1,
        ligneSuivante = row + 1,
        colonnePrecedente = col - 1,
        colonneSuivante = col + 1;
    // Traitement de la ligne précédente
    if (lignePrecedente >= 0) {
        if (colonnePrecedente >= 0) {
            valeurDeRetour.push(laTable.rows[lignePrecedente].cells[colonnePrecedente]);
        }
        valeurDeRetour.push(laTable.rows[lignePrecedente].cells[col]);
        if (colonneSuivante < colMax) {
            valeurDeRetour.push(laTable.rows[lignePrecedente].cells[colonneSuivante]);
        }
    }
    // Traitement de la ligne en cours
    if (colonnePrecedente >= 0) {
        valeurDeRetour.push(laTable.rows[row].cells[colonnePrecedente]);
    }
    // On n'ajoute pas la cellule en cours...
    if (colonneSuivante < colMax) {
        valeurDeRetour.push(laTable.rows[row].cells[colonneSuivante]);
    }
    // Traitement de la ligne suivante
    if (ligneSuivante < rowMax) {
        if (colonnePrecedente >= 0) {
            valeurDeRetour.push(laTable.rows[ligneSuivante].cells[colonnePrecedente]);
        }
        valeurDeRetour.push(laTable.rows[ligneSuivante].cells[col]);
        if (colonneSuivante < colMax) {
            valeurDeRetour.push(laTable.rows[ligneSuivante].cells[colonneSuivante]);
        }
    }
    return valeurDeRetour;
}

/**
 * Calcul global du nombre de voisins.
 */
let updateNbVoisins = () => {
    let ts1 = performance.now(),
        ts2 = null;
    // Les cellules vivantes sont à ajouter comme voisins des autres cellules, pas les autres.
    // Dans le pire des cas, on va boucler (nb cases noires * 8)
    gameState.aliveCells.forEach((maCellule) => {
        // On incrémente le nombre de voisins pour les cellules voisines de la cellule vivante (8 maximum)
        gameState.voisins[maCellule.dataset.row * 1][maCellule.dataset.col * 1].forEach((maCelluleVoisine) => {
            gameState.nbVoisins[maCelluleVoisine.dataset.row * 1][maCelluleVoisine.dataset.col * 1]++;
        });
    });
    ts2 = performance.now();
    console.log('updateNbVoisins: ' + (ts2 - ts1) + 'ms');
};

/**
 * Vérification si une cellule reste en vie à la prochaine itération.
 * 
 * @returns {array<HTMLElement>} Liste des cases vivantes à la prochaine itération
 */
let getAliveCellsNextIteration = () => {
    let ts1 = performance.now(),
        ts2 = null,
        tableCellulesAlive = [],
        maCellule = null;
    gameState.nbVoisins.forEach((maLigneVoisins, indexLigne) => {
        // On filtre les éléments pour ne garder que les voisins 2 et 3
        maLigneVoisins.forEach((nbVoisinsCellule, indexColonne) => {
            if (nbVoisinsCellule == 2 || nbVoisinsCellule == 3) {
                maCellule = laTable.rows[indexLigne].cells[indexColonne];
                // Si la cellule n'est pas vivante, mais qu'elle à 3 voisins, c'est une naissance.
                // Si la cellule est vivante et qu'elle a deux ou trois voisins, elle reste en vie.
                if (maCellule.className == "estvivante" || nbVoisinsCellule == 3) {
                    tableCellulesAlive.push(maCellule);
                }
            }
        });
    });
    ts2 = performance.now();
    console.log('getAliveCellsNextIteration: ' + (ts2 - ts1) + 'ms');
    return tableCellulesAlive;
};

/**
 * Mise à jour du DOM avec les élements de la nouvelle itération.
 * 
 * @param {array<HTMLElement>} cellulesVivantesIterationSuivantes Tableau contenant les cellules qui seront vivantes à la prochaine itération
 */
let initNextIteration = (cellulesVivantesIterationSuivantes) => {
    let ts1 = performance.now(),
        ts2 = null,
        cellulesVivantesActuelles = Array.from(laTable.getElementsByClassName("estvivante")),
        cellulesMourantes = [],
        cellulesNaissantes = [];
    // Calcul des cellules mourantes
    for (let cellule of cellulesVivantesActuelles.values()) {
        if (cellulesVivantesIterationSuivantes.indexOf(cellule) == -1) {
            cellulesMourantes.push(cellule);
        }
    }
    // Calcul des cellules naissantes
    for (let cellule of cellulesVivantesIterationSuivantes.values()) {
        if (cellulesVivantesActuelles.indexOf(cellule) == -1) {
            cellulesNaissantes.push(cellule);
        }
    }
    // On ne change l'état que des cellules naissantes ou mourantes.
    cellulesMourantes.forEach((el) => {
        el.className = "";
    });
    cellulesNaissantes.forEach((el) => {
        el.className = "estvivante";
    });

    if (cellulesVivantesIterationSuivantes.length == 0 || (cellulesMourantes.length == 0 && cellulesNaissantes.length == 0)) {
        // Plus aucune cellule de vivante ou aucun changement par rapport à l'étape précédente. On arrête là...
        let alertContainer = document.getElementById('alerteDeFin');
        alertContainer.innerHTML = '<div class="alert alert-warning alert-dismissible fade show" data-bs-dismiss="alert" role="alert"><strong>Fin du jeu&nbsp;!</strong> Plus aucune cellule n\'est vivante ou aucun changement. Le jeu ne peut plus continuer...<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fermer"></button></div>';
        new bootstrap.Alert(alertContainer.querySelector('.alert'));
        GameOfLife.end();
        document.getElementById('pause').disabled = true;
        document.getElementById('start').disabled = true;
        document.getElementById('rapide').disabled = true;
        document.getElementById('plusrapide').disabled = true;
        document.getElementById('restart').disabled = false;
    } else {
        gameState.aliveCells = cellulesVivantesIterationSuivantes.slice();
        // On remet à zéro le nombre de voisins
        gameState.nbVoisins.forEach((el) => {
            el.fill(0);
        });
    }
    ts2 = performance.now();
    console.log('initNextIteration: ' + (ts2 - ts1) + 'ms');
}

/**
 * Boucle principale
 */
let play = () => {
    let ts1 = performance.now(),
        ts2 = null;
    if (GameOfLife.needAliveCellsComputeNeeded) {
        gameState.aliveCells = Array.from(laTable.getElementsByClassName("estvivante"));
        GameOfLife.needAliveCellsComputeNeeded = false;
    }

    // Mise à jour du nombre des voisins
    updateNbVoisins();

    // Mise à jour de l'IHM
    initNextIteration(getAliveCellsNextIteration());

    document.getElementById('generation').value++;
    ts2 = performance.now();
    console.log('play: ' + (ts2 - ts1) + 'ms');
}

/**
 * Classe permettant de gérer le jeu
 */
let GameOfLife = () => {};

/**
 * Pointeur vers l'intervalle de temps défini (temps d'itération)
 */
GameOfLife.IntervalId = null;

/**
 * Booléen indiquant si un recalcul des cases vivantes est nécessaire (dans le cas d'un changement d'état manuel du tableau de jeu)
 */
GameOfLife.needAliveCellsComputeNeeded = true;

/**
 * Démarrage du jeu.
 * 
 * @param {*} vitesse Intervalle de temps de chaque tour de jeu.
 */
GameOfLife.start = (vitesse) => {
    if (GameOfLife.IntervalId) {
        clearInterval(GameOfLife.IntervalId);
    }
    GameOfLife.IntervalId = setInterval(play, vitesse);
};

/**
 * Fin du jeu
 */
GameOfLife.end = () => {
    if (GameOfLife.IntervalId) {
        clearInterval(GameOfLife.IntervalId);
    }
    clearInterval(GameOfLife.IntervalId);
};

/**
 * Exécuté lors du chargement de la page.
 * On effectue ici l'initialisation des gestionnaires d'évènements statiques et du DOM.
 */
document.addEventListener('DOMContentLoaded', function() {
    /**
     * Nombre de lignes du tableau par défaut
     */
    var nbRow = 100;
    /**
     * Nombre de colonnes du tableau par défaut
     */
    var nbCol = 100;

    laTable = document.getElementById('dataTable').firstChild;

    var btnStart = document.getElementById('start'),
        btnVitesseRapide = document.getElementById('rapide'),
        btnVitesseTresRapide = document.getElementById('plusrapide'),
        btnStepByStep = document.getElementById('stepbystep'),
        btnPause = document.getElementById('pause'),
        btnRestart = document.getElementById('restart');

    btnStepByStep.addEventListener('click', () => {
        btnPause.dispatchEvent(new Event('click'));
        play();
    });

    btnStart.addEventListener('click', function() {
        GameOfLife.start(intervallesDisponibles.normal);
        btnPause.disabled = false;
        btnStart.disabled = true;
        btnVitesseRapide.disabled = false;
        btnVitesseTresRapide.disabled = false;
    });

    btnVitesseRapide.addEventListener('click', function() {
        GameOfLife.start(intervallesDisponibles.rapide);
        btnPause.disabled = false;
        btnStart.disabled = false;
        btnVitesseRapide.disabled = true;
        btnVitesseTresRapide.disabled = false;
    });

    btnVitesseTresRapide.addEventListener('click', function() {
        GameOfLife.start(intervallesDisponibles.tresrapide);
        btnPause.disabled = false;
        btnStart.disabled = false;
        btnVitesseRapide.disabled = false;
        btnVitesseTresRapide.disabled = true;
    });

    btnPause.addEventListener('click', function() {
        GameOfLife.end();
        btnStart.disabled = false;
        btnPause.disabled = true;
        btnVitesseRapide.disabled = false;
        btnVitesseTresRapide.disabled = false;
    });

    btnRestart.addEventListener('click', function() {
        // Sur clic sur le bouton "Redémarrer", on supprime l'alerte éventuelle de fin de jeu.
        var alertNode = document.querySelector('#alerteDeFin .alert'),
            alertInstance = bootstrap.Alert.getInstance(alertNode);
        if (alertInstance != null) {
            alertInstance.close();
        }
        GameOfLife.end();
        btnStart.disabled = false;
        btnPause.disabled = true;
        btnVitesseRapide.disabled = false;
        btnVitesseTresRapide.disabled = false;
        // On récupère le paramétrage de nombre de lignes et de colonnes
        nbRow = parseInt(document.getElementById('nblignes').value, 10);
        nbCol = parseInt(document.getElementById('nbcolonnes').value, 10);
        initGame(nbRow, nbCol);
    });

    document.getElementById('dataTable').addEventListener('click', function(e) {
        // On ne prend que les click sur les cellules
        var noeudClique = e.target;
        if (noeudClique.nodeName == 'TD') {
            noeudClique.classList.toggle("estvivante");
        }
        // Les cellules vivantes ont changées. Il faut effectuer un recalcul à la prochaine itération...
        GameOfLife.needAliveCellsComputeNeeded = true;
    });

    btnRestart.dispatchEvent(new Event('click'));

}, false);
