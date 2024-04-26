import GameOfLifeRendererHtml from './GameOfLifeRendererHtml.js';

/**
 * Classe de gestion du jeu de la vie
 */
export default class GameOfLifeRunner {
    #renderer;
    #initialState;
    #speed;
    #generation;
    #timerId;
    #eventListener;

    /**
     * 
     * @param {int} nbRows 
     * @param {int} nbCols 
     * @param {string} containerId
     * @param {array} initialState
     * @param {int} speed 
     * @param {GameOfLifeRendererHtml} renderer 
     */
    constructor(nbRows, nbCols, containerId, eventListener = null, initialState = null, speed = 200, renderer = null) {
        this.#renderer = renderer==null?new GameOfLifeRendererHtml(containerId, nbRows, nbCols):renderer;
        this.#initialState = initialState;
        this.#speed = speed;
        this.#generation = 0;
        this.#eventListener = eventListener;
    }

    get speed() { return this.#speed; }
    set speed(value) {
        this.#speed = value;
        if (this.#timerId != null) {
            this.pause();
        }
        this.start();
    }

    get generation() { return this.#generation; }

    get isRunning() { return this.#timerId != null; }

    toggleCellStatus(row, col) {
        this.#renderer.toggleCellStatus(row, col);
    }

    play(runner) {
        let numberOfChanges = runner.#renderer.renderNextGeneration();
        // Incrémentation du compteur de génération
        runner.#generation++;
        // Si aucun changement, on arrête le jeu
        if (numberOfChanges == 0) {
            runner.pause();
        }
        // Génèration d'un évènement personnalisé pour indiquer le changement de génération
        if (runner.#eventListener != null) {
            let nextGenerationEvent = new CustomEvent("generation.change", { detail: {generation: runner.#generation }});
            runner.#eventListener.dispatchEvent(nextGenerationEvent);
        }
    }

    start() {
        this.#timerId = window.setInterval(this.play, this.#speed, this);
    }

    pause() {
        window.clearTimeout(this.#timerId);
        this.#timerId = null;
    }

    reset() {
        // On arrête le jeu
        this.pause();
        // On réinitialise la grille
        this.#renderer.initNewGrid(this.#initialState);
        // Et les compteurs !
        this.#generation = 0;
    }
}
