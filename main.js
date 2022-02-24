/**
 * Nombre de lignes du tableau par défaut
 */
var nbRow = 100;
/**
 * Nombre de colonnes du tableau par défaut
 */
var nbCol = 100;
/**
 * Pointeur vers l'intervalle de temps défini (temps d'itération)
 */
var nIntervId;
/**
 * Temps de l'intervalle de chaque génération
 */
var nIntervalTime = 200;
/**
 * Numéro de la génration en cours
 */
var nbGeneration = 0;
/**
 * Variable de stockage de l'état du jeu
 */
var gameState = {
    aliveCells: [],
    nbVoisins: new Array(nbRow),
    voisins: new Array(nbRow)
};
/**
 * Objet HTMLElement de l'élément DOM de la table
 */
var laTable = null;
/**
 * Objet HTMLElement de l'élément DOM du compteur de génération
 */
var generationContainer = null;

/**
 * Fonction d'initialisation de la table
 */
var initGame = function() {
    var ts1 = performance.now(),
        ts2 = null,
        html = '',
        i = null,
        listeToutesCellules = null;
    laTable.innerHTML = '';
    nbRow = parseInt(document.getElementById('nblignes').value, 10);
    nbCol = parseInt(document.getElementById('nbcolonnes').value, 10);
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
    var tmp = laTable.getElementsByClassName('estvivante');
    // Calcul des voisins à l'init
    listeToutesCellules = laTable.getElementsByTagName('td');
    [].forEach.call(listeToutesCellules, function(maCellule) {
        gameState.voisins[maCellule.parentElement.rowIndex][maCellule.cellIndex] = getVoisins(maCellule);
    });
    nbGeneration = 0;
    generationContainer.value = nbGeneration;
    ts2 = performance.now();
    console.log('initGame : ' + (ts2 - ts1) + 'ms');
}

/**
 * Récupère la liste des cellules voisines d'une case
 * 
 * @param {HTMLElement} cellule Cellule sont il faut récupérer les voisins
 * @returns {array<HTMLElement>} Liste des objets des cellules adjacentes
 */
var getVoisins = function(cellule) {
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
        if (colonneSuivante < nbCol) {
            valeurDeRetour.push(laTable.rows[lignePrecedente].cells[colonneSuivante]);
        }
    }
    // Traitement de la ligne en cours
    if (colonnePrecedente >= 0) {
        valeurDeRetour.push(laTable.rows[row].cells[colonnePrecedente]);
    }
    // On n'ajoute pas la cellule en cours...
    if (colonneSuivante < nbCol) {
        valeurDeRetour.push(laTable.rows[row].cells[colonneSuivante]);
    }
    // Traitement de la ligne suivante
    if (ligneSuivante < nbRow) {
        if (colonnePrecedente >= 0) {
            valeurDeRetour.push(laTable.rows[ligneSuivante].cells[colonnePrecedente]);
        }
        valeurDeRetour.push(laTable.rows[ligneSuivante].cells[col]);
        if (colonneSuivante < nbCol) {
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
    [].forEach.call(gameState.aliveCells, function(maCellule) {
        [].forEach.call(gameState.voisins[maCellule.parentElement.rowIndex][maCellule.cellIndex], function(maCelluleVoisine) {
            // Si la cellule adjacente n'est pas vivante, alors on incrémente son nombre de voisins.
            // Ce sera utilisé lors du calcul des naissances et du reste en vie.
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
        clearInterval(nIntervId);
        nIntervId = null;
        document.getElementById('pause').disabled = true;
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
 * Boucle principale
 */
var play = function() {
    var ts1 = performance.now(),
        ts2 = null,
        i = null;
    // Mise à jour du nombre des voisins
    updateNbVoisins();

    // Mise à jour de l'IHM
    initNextIteration(getAliveCellsNextIteration());

    // Reset du nombre des voisins
    for (i = 0; i < nbRow; i++) {
        gameState.nbVoisins[i].fill(0);
    }
    nbGeneration++;
    generationContainer.value = nbGeneration;
    ts2 = performance.now();
    console.log('play: ' + (ts2 - ts1) + 'ms');
}

/**
 * Exécuté lors du chargement de la page.
 * On effectue ici l'initialisation des gestionnaires d'évènements statiques et du DOM.
 */
document.addEventListener('DOMContentLoaded', function() {
    laTable = document.getElementById('dataTable').firstChild;
    generationContainer = document.getElementById('generation');

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')),
        tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        }),
        btnStart = document.getElementById('start'),
        btnPause = document.getElementById('pause'),
        btnRestart = document.getElementById('restart');

    btnStart.addEventListener('click', function() {
        if (!nIntervId) {
            nIntervId = setInterval(play, nIntervalTime);
        }
        btnPause.disabled = false;
        btnStart.disabled = true;
    });

    btnPause.addEventListener('click', function() {
        clearInterval(nIntervId);
        nIntervId = null;
        btnStart.disabled = false;
        btnPause.disabled = true;
    });

    btnRestart.addEventListener('click', function() {
        var alertNode = document.querySelector('#alerteDeFin .alert'),
            alertInstance = bootstrap.Alert.getInstance(alertNode);
        if (alertInstance != null) {
            alertInstance.close();
        }
        clearInterval(nIntervId);
        nIntervId = null;
        btnStart.disabled = false;
        btnPause.disabled = true;
        initGame();
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
