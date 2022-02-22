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
var nbGeneration=0;
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
var setTable = function() {
    var html = '',
        tableContainer = laTable.find('tbody').empty();
    vueTableau = new Array(nbRow);
    nbVoisins = new Array(nbRow);
    for (var i = 0; i < nbRow; i++) {
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
    tableContainer.append(html);
    tableContainer.find('td').each(function() {
        vueTableau[this.parentNode.rowIndex][this.cellIndex] = $(this);
    });
    nbGeneration = 0;
    generationContainer.val(nbGeneration);
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
 * Vérification si une cellule reste en vie à la prochaine itération.
 * 
 * @param {array<jQuery>} tableGetVoisins Liste des cellule adjacentes à la cellule
 * @param {jQuery} caseValue Objet jQuery de la cellule à tester
 * @returns {boolean} <true> si la case reste vivante et <false> sinon
 */
var checkCelluleStayAlive = function(tableGetVoisins, caseValue){
    var valeurDeRetour = false;
    var NbcellsNoiresVoisinnes = 0;

    $.each(tableGetVoisins, function() {
        if (this.hasClass('estvivante')) {
            NbcellsNoiresVoisinnes++;
        }
    });
    if (NbcellsNoiresVoisinnes == 2 || NbcellsNoiresVoisinnes == 3) {
        // la case reste vivante
        valeurDeRetour = true;
    }
    return valeurDeRetour;
}

/**
 * Calcul des cellules qui vont naître à la prochaine itération.
 * 
 * @returns {array<jQuery>} Tableau contenant les objets jQuery des cellules qui vont naître.
 */
var CheckNaissance = function() {
    var i = null,
        j = null,
        tableCellulesNaissantes = [],
        ligneEncours = null,
        celluleEnCours = null;
    for (i = 0; i < vueTableau.length; i++) {
        ligneEncours = vueTableau[i];
        for (j = 0; j < ligneEncours.length; j++) {
            celluleEnCours = ligneEncours[j];
            if (!celluleEnCours.hasClass('estvivante') && nbVoisins[i][j] == 3) {
                tableCellulesNaissantes.push(celluleEnCours);
            }
        }
    }
    return tableCellulesNaissantes;
}

/**
 * Mise à jour du DOM avec les élements de la nouvelle itération.
 * 
 * @param {array<jQuery>} TableCellules Tableau contenant les cellules qui seront vivantes à la prochaine itération
 */
var updateFront = function(TableCellules) {
    // tout setup a blanc puis set les bonnes cellules a noir
    laTable.find('td').removeClass('estvivante');
    $.each(TableCellules, function() {
        this.addClass('estvivante');
    });
}

/**
 * Boucle principale
 */
var play = function() {
    var tableCellulesVivantesGenerationSuivante = [],
        elems = laTable[0].getElementsByClassName('estvivante'),
        i = null,
        j = null,
        maCellule = null;
    for (i = 0; i<elems.length; i++) {
        maCellule = $(elems.item(i));
        var tableGetVoisins = getVoisins(maCellule.data('row'), maCellule.data('col'));
        for (j = 0; j < tableGetVoisins.length; j++) {
            // Si la cellule adjacente n'est pas vivante, alors on incrémente son nombre de voisins.
            // Ce sera utilisé lors du calcul des naissances.
            if (!tableGetVoisins[j].hasClass('estvivante')) {
                nbVoisins[tableGetVoisins[j].data('row')][tableGetVoisins[j].data('col')]++;
            }
        }
        if (checkCelluleStayAlive(tableGetVoisins, maCellule)) {
            tableCellulesVivantesGenerationSuivante.push(maCellule);
        }
    }
    // On calcule les naissances en une fois.
    tableCellulesVivantesGenerationSuivante = tableCellulesVivantesGenerationSuivante.concat(CheckNaissance());

    updateFront(tableCellulesVivantesGenerationSuivante);
    // Reset du nombre des voisins
    for (i = 0; i < nbVoisins.length; i++) {
        nbVoisins[i].fill(0);
    }
    nbGeneration++;
    generationContainer.val(nbGeneration);
}

$(function() {
    laTable = $('#dataTable');
    generationContainer = $('#generation');
    $('[data-bs-toggle="tooltip"]').tooltip();

    setTable();

    $('#start').click(function() {
        if (!nIntervId) {
            nIntervId = setInterval(play, nIntervalTime);
        }
    });

    $('#pause').click(function() {
        clearInterval(nIntervId);
        nIntervId = null;
    });

    $('#restart').click(function() {
        clearInterval(nIntervId);
        nIntervId = null;
        setTable();
    });

    $('#dataTable').on('click', 'td', function(e) {
        $(this).toggleClass('estvivante');
    });
});
