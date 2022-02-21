var nbRow = 100,
    nbCol = 100,
    nIntervId,
    nbGeneration=0,
    vueTableau = [],
    laTable = null,
    generationContainer = null;

$(document).ready(function () {
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
        nbGeneration = 0;
        generationContainer.val(nbGeneration);
        setTable();
    });

    $('#dataTable').on('click', 'td', function(e) {
        $(this).toggleClass('estvivante');
    });
});

function setTable(){
    var maLigne = null,
        maCellule = null,
        tableContainer = laTable.find('tbody').empty();
    vueTableau = new Array(nbRow);
    for (var i = 0; i < nbRow; i++) {
        maLigne = $('<tr></tr>');
        vueTableau[i] = new Array(nbCol);
        for (var j = 0; j < nbCol; j++) {
            var color = Math.floor(Math.random() * 2);
            maCellule = $('<td class="' + (color != 0 ? 'estvivante':'') + '" id="' + i + '-' + j + '" data-row="' + i + '" data-col="' + j + '"></td>');
            maLigne.append(maCellule);
            vueTableau[i][j] = maCellule;
        }
        tableContainer.append(maLigne);
    }
}


function getVoisins(row, col) {
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

function checkCelluleStayAlive(tableGetVoisins, caseValue){
    var tableCellulesVivantes = [];
    var NbcellsNoiresVoisinnes = 0;

    $.each(tableGetVoisins, function(index, maCellule) {
        if (this.hasClass("estvivante")) {
            NbcellsNoiresVoisinnes++;
        }
    });
    if (NbcellsNoiresVoisinnes == 2 || NbcellsNoiresVoisinnes == 3) {
        // la case reste vivante
        tableCellulesVivantes.push(caseValue);
    }
    return tableCellulesVivantes;
}

function CheckNaissance(tableGetVoisins){
    var tableCellulesNaissantes = [];
    $.each(tableGetVoisins, function() {
        var tableGetVoisinsVoisins = getVoisins(this.data('row'), this.data('col')),
            NbcellsNoiresVoisinnes = 0;
        $.each(tableGetVoisinsVoisins, function() {
            if (this.hasClass("estvivante")) {
                NbcellsNoiresVoisinnes++;
            }
        });
        if (NbcellsNoiresVoisinnes == 3 && !this.hasClass('estvivante')) {
            // la case prend vie
            tableCellulesNaissantes.push(this);
        }
    });
    return tableCellulesNaissantes;
}

function updateFront(TableCellules){
    // tout setup a blanc puis set les bonnes cellules a noir
    laTable.find('td').removeClass('estvivante');
    $.each(TableCellules, function() {
        this.addClass('estvivante');
    });
}

function play() {
    var tableCheckCelluleStayAlive = [],
        tableCheckNaissance = [],
        tableConcateneAliveEtNaissance = [],
        elems = laTable[0].getElementsByClassName('estvivante'),
        i = null,
        maCellule = null;
    for (i = 0; i<elems.length; i++) {
        maCellule = $(elems.item(i));
        var tableGetVoisins = getVoisins(maCellule.data('row'), maCellule.data('col'));
        tableCheckCelluleStayAlive = checkCelluleStayAlive(tableGetVoisins, maCellule);
        tableCheckNaissance = CheckNaissance(tableGetVoisins);
        tableConcateneAliveEtNaissance = tableConcateneAliveEtNaissance.concat(tableCheckCelluleStayAlive, tableCheckNaissance);
    }

    // enlèvement des doublons
    tableConcateneAliveEtNaissance = tableConcateneAliveEtNaissance.filter(function(a, b) {
        return tableConcateneAliveEtNaissance.indexOf(a) == b;
    });

    updateFront(tableConcateneAliveEtNaissance);
    nbGeneration++;
    generationContainer.val(nbGeneration);
}
