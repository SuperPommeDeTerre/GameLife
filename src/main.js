import GameOfLifeRunner from "./GameOfLifeRunner.js";

/**
 * Exécuté lors du chargement de la page.
 * On effectue ici l'initialisation des gestionnaires d'évènements statiques et du DOM.
 */
document.addEventListener("DOMContentLoaded", () => {
    let btnStart = document.getElementById("start"),
        btnVitesseRapide = document.getElementById("rapide"),
        btnVitesseTresRapide = document.getElementById("plusrapide"),
        btnStepByStep = document.getElementById("stepbystep"),
        btnPause = document.getElementById("pause"),
        btnRestart = document.getElementById("restart"),
        chkDisplayGrid = document.getElementById("chkDisplayGrid"),
        lblGeneration = document.getElementById("generation"),
        gameRuner = null;

    btnStepByStep.addEventListener("click", () => {
        btnPause.dispatchEvent(new Event("click"));
        gameRuner.play(gameRuner);
    });

    btnStart.addEventListener("click", () => {
        gameRuner.speed = 400;
        btnPause.disabled = false;
        btnStepByStep.disabled = false;
        btnStart.disabled = true;
        btnVitesseRapide.disabled = false;
        btnVitesseTresRapide.disabled = false;
    });

    btnVitesseRapide.addEventListener("click", () => {
        gameRuner.speed = 200;
        btnPause.disabled = false;
        btnStepByStep.disabled = false;
        btnStart.disabled = false;
        btnVitesseRapide.disabled = true;
        btnVitesseTresRapide.disabled = false;
    });

    btnVitesseTresRapide.addEventListener("click", () => {
        gameRuner.speed = 100;
        btnPause.disabled = false;
        btnStepByStep.disabled = false;
        btnStart.disabled = false;
        btnVitesseRapide.disabled = false;
        btnVitesseTresRapide.disabled = true;
    });

    btnPause.addEventListener("click", () => {
        gameRuner.pause();
        btnStart.disabled = false;
        btnStepByStep.disabled = false;
        btnPause.disabled = true;
        btnVitesseRapide.disabled = false;
        btnVitesseTresRapide.disabled = false;
    });

    btnRestart.addEventListener("click", () => {
        // Sur clic sur le bouton "Redémarrer", on supprime l'alerte éventuelle de fin de jeu.
        let alertNode = document.querySelector("#alerteDeFin .alert"),
            alertInstance = bootstrap.Alert.getInstance(alertNode);
        if (alertInstance != null) {
            alertInstance.close();
        }
        if (gameRuner != null) {
            gameRuner.pause();
        }
        // On récupère le paramétrage de nombre de lignes et de colonnes
        let nbRow = parseInt(document.getElementById("nblignes").value, 10),
            nbCol = parseInt(document.getElementById("nbcolonnes").value, 10);
        gameRuner = new GameOfLifeRunner(nbRow, nbCol, "gameContainer", lblGeneration);
        btnStart.disabled = false;
        btnStepByStep.disabled = false;
        btnPause.disabled = true;
        btnVitesseRapide.disabled = false;
        btnVitesseTresRapide.disabled = false;
    });

    lblGeneration.addEventListener("generation.change", (e) => {
        lblGeneration.value = e.detail.generation;
    });

    chkDisplayGrid.addEventListener("click", (e) => {
        document.getElementById("gameContainer").classList.toggle("visually-hidden");
    });

    document.getElementById("gameContainer").addEventListener("click", (e) => {
        // On ne prend que les click sur les cellules
        let noeudClique = e.target;
        if (noeudClique.nodeName == "TD") {
            // Les cellules vivantes ont changées. Il faut effectuer un recalcul à la prochaine itération...
            gameRuner.toggleCellStatus(noeudClique.dataset.row, noeudClique.dataset.col);
        }
    });

    btnRestart.dispatchEvent(new Event("click"));
}, false);

// Path: main.js
