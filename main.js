var nbRow = 100,
    nbCol = 100,
    nIntervId,
    nbGeneration=0,
    vueTableau = [],
    nbVoisins = [],
    laTable = null,
    generationContainer = null;

var setTable = function() {
    var maLigne = null,
        maCellule = null,
        tableContainer = laTable.find('tbody').empty();
    vueTableau = new Array(nbRow);
    nbVoisins = new Array(nbRow);
    for (var i = 0; i < nbRow; i++) {
        maLigne = $('<tr></tr>');
        vueTableau[i] = new Array(nbCol);
        nbVoisins[i] = new Array(nbCol);
        nbVoisins[i].fill(0);
        for (var j = 0; j < nbCol; j++) {
            var color = Math.floor(Math.random() * 2);
            maCellule = $('<td class="' + (color != 0 ? 'estvivante':'') + '" id="' + i + '-' + j + '" data-row="' + i + '" data-col="' + j + '"></td>');
            maLigne.append(maCellule);
            vueTableau[i][j] = maCellule;
        }
        tableContainer.append(maLigne);
    }
    nbGeneration = 0;
    generationContainer.val(nbGeneration);
}

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

var checkCelluleStayAlive = function(tableGetVoisins, caseValue){
    var tableCellulesVivantes = [];
    var NbcellsNoiresVoisinnes = 0;

    $.each(tableGetVoisins, function() {
        if (this.hasClass('estvivante')) {
            NbcellsNoiresVoisinnes++;
        }
    });
    if (NbcellsNoiresVoisinnes == 2 || NbcellsNoiresVoisinnes == 3) {
        // la case reste vivante
        tableCellulesVivantes.push(caseValue);
    }
    return tableCellulesVivantes;
}

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

var updateFront = function(TableCellules) {
    // tout setup a blanc puis set les bonnes cellules a noir
    laTable.find('td').removeClass('estvivante');
    $.each(TableCellules, function() {
        this.addClass('estvivante');
    });
}

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
        tableCellulesVivantesGenerationSuivante = tableCellulesVivantesGenerationSuivante.concat(checkCelluleStayAlive(tableGetVoisins, maCellule));
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

    setTable();

    $('#start').click(function(){
        if (!nIntervId) {
            nIntervId = setInterval(play, 400);
        }
    });

    $('#pause').click(function(){
        clearInterval(nIntervId);
        nIntervId = null;
    });

    $('#restart').click(function(){
        clearInterval(nIntervId);
        nIntervId = null;
        setTable();
    });

    $('#dataTable').on('click', 'td', function(e) {
        $(this).toggleClass('estvivante');
    });
});
