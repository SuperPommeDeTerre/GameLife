import GameOfLifeRendererCanvas from './GameOfLifeRendererCanvas.js';
import GameOfLifeUniverse from './GameOfLifeUniverse.js';

/**
 * Classe de gestion du jeu de la vie
 */
export default class GameOfLifeRunner {
    #renderer;
    #initialState;
    #speed;
    #timerId;
    #eventListener;
    #universe;

    /**
     * 
     * @param {int} nbRows 
     * @param {int} nbCols 
     * @param {string} containerId
     * @param {array} initialState
     * @param {int} speed 
     * @param {GameOfLifeRendererCanvas} renderer
     */
    constructor(container, nbRows, nbCols, eventListener = null, initialState = null, speed = 200, renderer = null) {
        // Initialisation du renderer en premier afin de déterminer les dimensions de l'univers
        this.#renderer = renderer==null?new GameOfLifeRendererCanvas(container, nbRows, nbCols):renderer;
        // Création de l'univers
        this.#universe = new GameOfLifeUniverse(this.#renderer.universe_dimensions.height, this.#renderer.universe_dimensions.width, initialState);
        this.#renderer.initUniverse(this.#universe);
        this.#initialState = initialState;
        this.#speed = speed;
        this.#eventListener = eventListener;
        this.#renderer.canvas.addEventListener("click", (event) => {
            // Calcul de la cellule cliquée
            let rect = this.#renderer.canvas.getBoundingClientRect(),
                x = event.clientX - rect.left,
                y = event.clientY - rect.top,
                col = Math.floor(x / (this.#renderer.cell_size + 1)),
                row = Math.floor(y / (this.#renderer.cell_size + 1));
            this.toggleCellStatus(this.#universe.getCellFromCoords(row, col));
        });
    }

    get speed() { return this.#speed; }
    set speed(value) {
        this.#speed = value;
        if (this.#timerId != null) {
            this.pause();
        }
        this.start();
    }

    get isRunning() { return this.#timerId != null; }

    toggleCellStatus(cell) {
        this.#universe.toggleCellStatus(cell);
        this.#renderer.toggleCellStatus(cell);
    }

    tick() {
        // On fait avancer l'univers d'une génération
        let ts1 = performance.now(),
        ts2 = null;
        let universeTickResult = this.#universe.tick();
        ts2 = performance.now();
        console.log("Calcul de génération : " + (ts2 - ts1) + "ms");
        // Incrémentation du compteur de génération
        this.#renderer.render(universeTickResult);
        // Génèration d'un évènement personnalisé pour indiquer le changement de génération
        if (this.#eventListener != null) {
            let nextGenerationEvent = new CustomEvent("generation.change", { detail: {generation: this.#universe.generation }});
            this.#eventListener.dispatchEvent(nextGenerationEvent);
        }
        return universeTickResult;
    }

    play() {
        let universeTickResult = this.tick();
        // Si aucun changement, on arrête le jeu
        if (universeTickResult.is_stall) {
            this.pause();
            return;
        }
        // On relance le timer
        this.#timerId = window.setTimeout(this.play.bind(this), this.#speed);
    }

    start() {
        this.#timerId = window.setTimeout(this.play.bind(this), this.#speed);
    }

    pause() {
        if (this.#timerId != null) {
            window.clearTimeout(this.#timerId);
            this.#timerId = null;
        }
    }

    reset() {
        // On arrête le jeu
        this.pause();
        // On réinitialise la grille
        this.#renderer.initNewGrid(this.#initialState);
    }
}
