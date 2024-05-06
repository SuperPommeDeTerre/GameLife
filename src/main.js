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
        lblGeneration = document.getElementById("generation"),
        gameRuner = null;

    btnStepByStep.addEventListener("click", () => {
        btnPause.dispatchEvent(new Event("click"));
        gameRuner.tick();
    });

    btnStart.addEventListener("click", () => {
        gameRuner.speed = 400;
        btnPause.disabled = false;
        btnStepByStep.disabled = false;
        btnStart.disabled = true;
        btnVitesseTresRapide.disabled = false;
    });

    btnVitesseTresRapide.addEventListener("click", () => {
        gameRuner.speed = 100;
        btnPause.disabled = false;
        btnStepByStep.disabled = false;
        btnStart.disabled = false;
        btnVitesseTresRapide.disabled = true;
    });

    btnPause.addEventListener("click", () => {
        gameRuner.pause();
        btnStart.disabled = false;
        btnStepByStep.disabled = false;
        btnPause.disabled = true;
        btnVitesseTresRapide.disabled = false;
    });

    btnRestart.addEventListener("click", () => {
        if (gameRuner != null) {
            gameRuner.pause();
        }
        // On récupère le paramétrage de nombre de lignes et de colonnes
        gameRuner = new GameOfLifeRunner(document.getElementById("gameContainer"), null, null, lblGeneration);
        btnStart.disabled = false;
        btnStepByStep.disabled = false;
        btnPause.disabled = true;
        btnVitesseTresRapide.disabled = false;
    });

    lblGeneration.addEventListener("generation.change", (e) => {
        lblGeneration.innerText = e.detail.generation;
    });

    btnRestart.dispatchEvent(new Event("click"));
}, false);

// Path: main.js
