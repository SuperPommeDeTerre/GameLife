/**
 * Vitesses d'exécution disponibles
 */
var intervallesDisponibles = {
    'normal': 400,
    'rapide': 200,
    'tresrapide': 100
};
/**
 * Variable de stockage de l'état du jeu
 */
var gameState = {
    aliveCells: [],
    nbVoisins: [],
    voisins: []
};
/**
 * Objet HTMLElement de l'élément DOM de la table
 */
var laTable = null;

/**
 * Fonction d'initialisation de la table
 * 
 * @param {int} nbRow Nombre de lignes
 * @param {int} nbCol Nombre de colonnes
 */
var initGame = function(nbRow, nbCol) {
    var ts1 = performance.now(),
        ts2 = null,
        html = '',
        i = null,
        listeToutesCellules = null;
    laTable.innerHTML = '';
    gameState.nbVoisins = new Array(nbRow);
    gameState.voisins = new Array(nbRow);
    for (i = 0; i < nbRow; i++) {
        html += '<tr>';
        gameState.nbVoisins[i] = new Array(nbCol);
        gameState.voisins[i] = new Array(nbCol);
        gameState.nbVoisins[i].fill(0);
        for (var j = 0; j < nbCol; j++) {
            var color = Math.floor(Math.random() * 2);
            html += '<td class="' + (color != 0 ? 'estvivante':'') + '" id="cell' + i + '_' + j + '"></td>';
        }
        html += '</tr>';
    }
    laTable.innerHTML= html;
    gameState.aliveCells = laTable.querySelectorAll('.estvivante');
    // Calcul des voisins à l'init
    listeToutesCellules = laTable.getElementsByTagName('td');
    [].forEach.call(listeToutesCellules, function(maCellule) {
        gameState.voisins[maCellule.parentElement.rowIndex][maCellule.cellIndex] = getVoisins(maCellule, nbRow, nbCol);
    });
    document.getElementById('generation').value = 0;
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
var getVoisins = function(cellule, rowMax, colMax) {
    // fonction pour obtenir les voisins de la cellule
    var valeurDeRetour = [],
        row = cellule.parentElement.rowIndex,
        col = cellule.cellIndex,
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
var updateNbVoisins = function() {
    var ts1 = performance.now(),
        ts2 = null;
    // Les cellules vivantes sont à ajouter comme voisins des autres cellules, pas les autres.
    // Dans le pire des cas, on va boucler (nb cases noires * 8)
    [].forEach.call(gameState.aliveCells, function(maCellule) {
        // On incrémente le nombre de voisins pour les cellules voisines de la cellule vivante (8 maximum)
        [].forEach.call(gameState.voisins[maCellule.parentElement.rowIndex][maCellule.cellIndex], function(maCelluleVoisine) {
            gameState.nbVoisins[maCelluleVoisine.parentElement.rowIndex][maCelluleVoisine.cellIndex]++;
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
 var getAliveCellsNextIteration = function() {
    var ts1 = performance.now(),
        ts2 = null,
        tableCellulesAlive = [],
        maCellule = null;
    [].forEach.call(gameState.nbVoisins, function(maLigneVoisins, indexLigne) {
        // On filtre les éléments pour ne garder que les voisins 2 et 3
        [].forEach.call(maLigneVoisins, function(nbVoisinsCellule, indexColonne) {
            if (nbVoisinsCellule == 2 || nbVoisinsCellule == 3) {
                maCellule = laTable.rows[indexLigne].cells[indexColonne];
                // Si la cellule n'est pas vivante, mais qu'elle à 3 voisins, c'est une naissance.
                // Si la cellule est vivante et qu'elle a deux ou trois voisins, elle reste en vie.
                if (maCellule.classList.contains('estvivante') || nbVoisinsCellule == 3) {
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
var initNextIteration = function(cellulesVivantesIterationSuivantes) {
    var ts1 = performance.now(),
        ts2 = null;
    // tout setup a blanc puis set les bonnes cellules a noir
    [].forEach.call(laTable.querySelectorAll('.estvivante'), function(el) {
        el.classList.remove('estvivante');
    });
    if (cellulesVivantesIterationSuivantes.length == 0) {
        // Plus aucune cellule de vivante. On arrête là...
        var alertContainer = document.getElementById('alerteDeFin');
        alertContainer.innerHTML = '<div class="alert alert-warning alert-dismissible fade show" data-bs-dismiss="alert" role="alert"><strong>Fin du jeu&nbsp;!</strong> Plus aucune cellule n\'est vivante. Le jeu ne peut plus continuer...<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fermer"></button></div>';
        new bootstrap.Alert(alertContainer.querySelector('.alert'));
        GameOfLife.end();
        document.getElementById('pause').disabled = true;
        document.getElementById('start').disabled = true;
        document.getElementById('rapide').disabled = true;
        document.getElementById('plusrapide').disabled = true;
        document.getElementById('restart').disabled = false;
    } else {
        [].forEach.call(cellulesVivantesIterationSuivantes, function(el) {
            el.classList.add('estvivante');
        });
        gameState.aliveCells = [...cellulesVivantesIterationSuivantes];
        // On remet à zéro le nombre de voisins
        [].forEach.call(gameState.nbVoisins, function(el) {
            el.fill(0);
        });
    }
    ts2 = performance.now();
    console.log('initNextIteration: ' + (ts2 - ts1) + 'ms');
}

/**
 * Classe permettant de gérer le jeu
 */
var GameOfLife = function() {};

/**
 * Pointeur vers l'intervalle de temps défini (temps d'itération)
 */
GameOfLife.IntervalId = null;

/**
 * Démarrage dui jeu.
 * 
 * @param {*} vitesse Intervalle de temps de chaque tour de jeu.
 */
GameOfLife.start = function(vitesse) {
    if (GameOfLife.IntervalId) {
        clearInterval(GameOfLife.IntervalId);
    }
    GameOfLife.IntervalId = setInterval(play, vitesse);
};

/**
 * Fin du jeu
 */
GameOfLife.end = function() {
    if (GameOfLife.IntervalId) {
        clearInterval(GameOfLife.IntervalId);
    }
    clearInterval(GameOfLife.IntervalId);
};

/**
 * Boucle principale
 */
var play = function() {
    var ts1 = performance.now(),
        ts2 = null;
    // Mise à jour du nombre des voisins
    updateNbVoisins();

    // Mise à jour de l'IHM
    initNextIteration(getAliveCellsNextIteration());

    // Reset du nombre des voisins
    [].forEach.call(gameState.nbVoisins, function(nbVoisinsLigne) {
        nbVoisinsLigne.fill(0);
    });
    document.getElementById('generation').value++;
    ts2 = performance.now();
    console.log('play: ' + (ts2 - ts1) + 'ms');
}

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
        btnPause = document.getElementById('pause'),
        btnRestart = document.getElementById('restart');

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
        var noeudClique = e.path[0];
        if (noeudClique.nodeName == 'TD') {
            if (noeudClique.classList.contains('estvivante')) {
                noeudClique.classList.remove('estvivante');
            } else {
                noeudClique.classList.add('estvivante');
            }
        }
    });

    btnRestart.dispatchEvent(new Event('click'));

}, false);
