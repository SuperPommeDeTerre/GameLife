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
    cells: [],
    voisins: []
};
/**
 * Tableau de stockage des éléments jQuery des cellules du tableau (pour éviter les interrogations du DOM)
 */
var vueTableau = [];
/**
 * Tableau de stockage du nombre de voisins vivants de chaque cellule
 */
var nbVoisins = [];
/**
 * Objet jQuery de l'élément DOM de la table
 */
var laTable = null;
/**
 * Objet jQuery de l'élément DOM du compteur de génération
 */
var generationContainer = null;

/**
 * Fonction d'initialisation de la table
 */
var initGame = function() {
    var ts1 = performance.now(),
        ts2 = null,
        html = '',
        i = null;
    laTable.innerHTML = '';
    nbRow = parseInt(document.getElementById('nblignes').value);
    nbCol = parseInt(document.getElementById('nbcolonnes').value);
    vueTableau = new Array(nbRow);
    nbVoisins = new Array(nbRow);
    for (i = 0; i < nbRow; i++) {
        html += '<tr>';
        vueTableau[i] = new Array(nbCol);
        nbVoisins[i] = new Array(nbCol);
        nbVoisins[i].fill(0);
        for (var j = 0; j < nbCol; j++) {
            var color = Math.floor(Math.random() * 2);
            html += '<td class="' + (color != 0 ? 'estvivante':'') + '" id="' + i + '-' + j + '" data-row="' + i + '" data-col="' + j + '"></td>';
        }
        html += '</tr>';
    }
    laTable.innerHTML= html;
    var cells = laTable.getElementsByTagName('td');
    for (i = 0; i < cells.length; i++) {
        var maCellule = cells[i];
        vueTableau[maCellule.dataset.row][maCellule.dataset.col] = maCellule;
    }
    nbGeneration = 0;
    generationContainer.value = nbGeneration;
    ts2 = performance.now();
    console.log('initGame : ' + (ts2 - ts1) + 'ms');
}

/**
 * Récupère la liste des cellules voisines d'une case
 * 
 * @param {int} row Numéro de ligne de la cellule
 * @param {int} col Numéro de colonne de la cellule
 * @returns {array<jQuery>} Liste des objets jQuery des cellules adjacentes
 */
var getVoisins = function(row, col) {
    // fonction pour obtenir les voisins de la cellule
    var valeurDeRetour = [],
        lignePrecedente = row - 1,
        ligneSuivante = row + 1,
        colonnePrecedente = col - 1,
        colonneSuivante = col + 1;
    // Traitement de la ligne précédente
    if (lignePrecedente >= 0) {
        if (colonnePrecedente >= 0) {
            valeurDeRetour.push(vueTableau[lignePrecedente][colonnePrecedente]);
        }
        valeurDeRetour.push(vueTableau[lignePrecedente][col]);
        if (colonneSuivante < nbCol) {
            valeurDeRetour.push(vueTableau[lignePrecedente][colonneSuivante]);
        }
    }
    // Traitement de la ligne en cours
    if (colonnePrecedente >= 0) {
        valeurDeRetour.push(vueTableau[row][colonnePrecedente]);
    }
    if (colonneSuivante < nbCol) {
        valeurDeRetour.push(vueTableau[row][colonneSuivante]);
    }
    // Traitement de la ligne précédente
    if (ligneSuivante < nbRow) {
        if (colonnePrecedente >= 0) {
            valeurDeRetour.push(vueTableau[ligneSuivante][colonnePrecedente]);
        }
        valeurDeRetour.push(vueTableau[ligneSuivante][col]);
        if (colonneSuivante < nbCol) {
            valeurDeRetour.push(vueTableau[ligneSuivante][colonneSuivante]);
        }
    }
    return valeurDeRetour;
}

/**
 * Calcul global du nombre de voisins.
 */
var updateNbVoisins = function() {
    var ts1 = performance.now(),
        ts2 = null,
        elems = laTable.getElementsByClassName('estvivante'),
        i = null,
        j = null,
        maCellule = null,
        maCelluleVoisine = null,
        tableGetVoisins = null;
    for (i = 0; i<elems.length; i++) {
        maCellule = elems[i];
        tableGetVoisins = getVoisins(parseInt(maCellule.dataset.row), parseInt(maCellule.dataset.col));
        for (j = 0; j < tableGetVoisins.length; j++) {
            maCelluleVoisine = tableGetVoisins[j];
            // Si la cellule adjacente n'est pas vivante, alors on incrémente son nombre de voisins.
            // Ce sera utilisé lors du calcul des naissances et.
            nbVoisins[parseInt(maCelluleVoisine.dataset.row)][parseInt(maCelluleVoisine.dataset.col)]++;
        }
    }
    ts2 = performance.now();
    console.log('updateNbVoisins: ' + (ts2 - ts1) + 'ms');
};

/**
 * Vérification si une cellule reste en vie à la prochaine itération.
 * 
 * @returns {array<jQuery>} Liste des cases vivantes à la prochaine itération
 */
 var getAliveCells = function() {
    var ts1 = performance.now(),
        ts2 = null,
        i = null,
        j = null,
        tableCellulesAlive = [],
        ligneEncours = null,
        celluleEnCours = null,
        estCelluleVivante = true,
        lNbVoisins = 0;
    for (i = 0; i < nbRow; i++) {
        ligneEncours = vueTableau[i];
        for (j = 0; j < nbCol; j++) {
            celluleEnCours = ligneEncours[j];
            estCelluleVivante = celluleEnCours.classList.contains('estvivante');
            lNbVoisins = nbVoisins[i][j];
            // Si la cellule n'est pas vivante, mais qu'elle à 3 voisins, c'est une naissance.
            // Si la cellule est vivante et qu'elle a deux ou trois voisins, elle reste en vie.
            if ((!estCelluleVivante && lNbVoisins == 3) || (estCelluleVivante && (lNbVoisins == 2 || lNbVoisins == 3))) {
                tableCellulesAlive.push(celluleEnCours);
            }
        }
    }
    ts2 = performance.now();
    console.log('getAliveCells: ' + (ts2 - ts1) + 'ms');
    return tableCellulesAlive;
};

/**
 * Mise à jour du DOM avec les élements de la nouvelle itération.
 * 
 * @param {array<jQuery>} TableCellules Tableau contenant les cellules qui seront vivantes à la prochaine itération
 */
var updateFront = function(TableCellules) {
    var ts1 = performance.now(),
        ts2 = null;
    // tout setup a blanc puis set les bonnes cellules a noir
    if (TableCellules.length == 0) {
        document.getElementById('alerteDeFin').innerHTML = '<div class="alert alert-warning alert-dismissible fade show" role="alert"><strong>Fin du jeu&nbsp;!</strong> Plus aucune cellule n\'est vivante. Le jeu ne peut plus continuer...<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fermer"></button></div>';
        clearInterval(nIntervId);
        nIntervId = null;
    } else {
        [].forEach.call(laTable.querySelectorAll('.estvivante'), function(el) {
            el.classList.remove('estvivante');
        });
        [].forEach.call(TableCellules, function(el) {
            el.classList.add('estvivante');
        });
    }
    // Plus aucune cellule de vivante. On arrête là...
    if (TableCellules.length == 0) {
        document.getElementById('alerteDeFin').innerHTML = '<div class="alert alert-warning alert-dismissible fade show" role="alert"><strong>Fin du jeu&nbsp;!</strong> Plus aucune cellule n\'est vivante. Le jeu ne peut plus continuer...<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fermer"></button></div>';
        clearInterval(nIntervId);
        nIntervId = null;
    }
    ts2 = performance.now();
    console.log('updateFront: ' + (ts2 - ts1) + 'ms');
}

/**
 * Boucle principale
 */
var play = function() {
    var ts1 = performance.now(),
        ts2 = null,
        tableCellulesVivantesGenerationSuivante = [],
        i = null;
    // Mise à jour du nombre des voisins
    updateNbVoisins();

    // Calcul des cellules vivantes en fonction des voisins.
    tableCellulesVivantesGenerationSuivante = getAliveCells();

    // Mise à jour de l'IHM
    updateFront(tableCellulesVivantesGenerationSuivante);

    // Reset du nombre des voisins
    for (i = 0; i < nbRow; i++) {
        nbVoisins[i].fill(0);
    }
    nbGeneration++;
    generationContainer.value = nbGeneration;
    ts2 = performance.now();
    console.log('play: ' + (ts2 - ts1) + 'ms');
}

document.addEventListener('DOMContentLoaded', function() {
    laTable = document.getElementById('dataTable').firstChild;
    generationContainer = document.getElementById('generation');

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')),
        tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        });

    initGame();

    document.getElementById('start').addEventListener('click', function() {
        if (!nIntervId) {
            nIntervId = setInterval(play, nIntervalTime);
        }
    });

    document.getElementById('pause').addEventListener('click', function() {
        clearInterval(nIntervId);
        nIntervId = null;
    });

    document.getElementById('restart').addEventListener('click', function() {
        clearInterval(nIntervId);
        nIntervId = null;
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
}, false);
