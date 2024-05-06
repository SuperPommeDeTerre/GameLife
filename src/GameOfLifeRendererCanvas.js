import GameOfLifeUniverse from "./GameOfLifeUniverse.js";
import GameOfLifeCell from "./GameOfLifeCell.js";

export default class GameOfLifeRendererCanvas {
    #universe;
    #container;
    #canvas;
    #canvas_context;
    #start_timestamp = null;
    #previously_born_cells = []; // Utile afin de changer la couleur des cellules naissantes lors de la génération suivante.
    #cell_size = 5; // Taille par défaut des cellules (en px)
    CELL_SIZES = [ 1, 3, 5, 11, 21]; // Tailles de cellules autorisées.
    GRID_COLOR = "#CCCCCC"; // Couleur de la grille
    DEAD_COLOR = "#FFFFFF"; // Couleur des cellules mortes
    ALIVE_COLOR = "#000000"; // Couleur des cellules vivantes
    BORN_COLOR = "#0000FF"; // Couleur des cellules naissantes
    DYING_COLOR = "#FF0000"; // Couleur des cellules mourantes au prochain tour
    
    constructor(containerID = "gameContainer") {
        this.#container = document.getElementById(containerID);
        let containerWidth = this.#container.offsetWidth,
            containerHeight = this.#container.offsetHeight;
        // Calcul de la taille de l'univers à partir de la taille du conteneur
        let nbRows = 100, nbCols = 100;
        nbCols = Math.floor(containerWidth / (this.#cell_size + 1)) - 1;
        nbRows = Math.floor(containerHeight / (this.#cell_size + 1)) - 1;
        this.#universe = new GameOfLifeUniverse(nbRows, nbCols);
        this.#init();
    }

    #init() {
        this.#container.innerHTML = "";
        this.#canvas = document.createElement("canvas");
        this.#canvas.width = (this.#cell_size + 1) * this.#universe.nbCols + 1; 
        this.#canvas.height = (this.#cell_size + 1) * this.#universe.nbRows + 1;
        this.#container.appendChild(this.#canvas);
        this.#canvas_context = this.#canvas.getContext("2d");
        this.#drawGrid();
        this.#drawCells();
    }

    renderNextGeneration(tsChrono) {
        if (this.#start_timestamp == null) {
            this.#start_timestamp = tsChrono;
        }
        let elapsedTime = tsChrono - this.#start_timestamp;
        if (elapsedTime < 200000) {
            window.requestAnimationFrame(this.renderNextGeneration.bind(this));
            return;
        }
        let ts1 = performance.now(),
        ts2 = null;
        let universeTickResult = this.#universe.tick();
        ts2 = performance.now();
        console.log("Avancement de la grille : " + (ts2 - ts1) + "ms");
        ts1 = performance.now()
        let bornCells = universeTickResult.changes.births,
            diedCells = universeTickResult.changes.deaths;
        this.#drawCells(bornCells, diedCells, universeTickResult.coming.deaths);
        window.requestAnimationFrame(this.renderNextGeneration.bind(this));
        ts2 = performance.now();
        console.log("MAJ affichage : " + (ts2 - ts1) + "ms");
        this.#previously_born_cells = bornCells;
        return {
            number_of_changes: bornCells.length + diedCells.length,
            generation: universeTickResult.statistics.generation,
        };
    }

    #drawGrid() {
        let ctx = this.#canvas_context;
        ctx.beginPath();
        ctx.strokeStyle = this.GRID_COLOR;
      
        // Vertical lines.
        for (let i = 0; i <= this.#universe.nbCols; i++) {
          ctx.moveTo(i * (this.#cell_size + 1) + 1, 0);
          ctx.lineTo(i * (this.#cell_size + 1) + 1, (this.#cell_size + 1) * this.#universe.nbRows + 1);
        }
      
        // Horizontal lines.
        for (let j = 0; j <= this.#universe.nbRows; j++) {
          ctx.moveTo(0, j * (this.#cell_size + 1) + 1);
          ctx.lineTo((this.#cell_size + 1) * this.#universe.nbCols + 1, j * (this.#cell_size + 1) + 1);
        }
        ctx.stroke();
    }
    
    #drawCell(ctx, cell) {
        ctx.fillRect(
            cell.col * (this.#cell_size + 1) + 1,
            cell.row * (this.#cell_size + 1) + 1,
            this.#cell_size,
            this.#cell_size
        );
    }

    #drawCells(bornCells, deadCells, dyingCells) {
        let ctx = this.#canvas_context;
    
        ctx.beginPath();
        ctx.fillStyle = this.DEAD_COLOR;
        if (typeof deadCells != 'undefined') {
            deadCells.forEach((cell) => this.#drawCell(ctx, cell));
        } else {
            for (let row = 0; row < this.#universe.nbRows; row++) {
                for (let col = 0; col < this.#universe.nbCols; col++) {
                    if (this.#universe.aliveCells.hasOwnProperty(GameOfLifeCell.getCellKey(row, col))) {
                        continue;
                    }
                    ctx.fillRect(
                        col * (this.#cell_size + 1) + 1,
                        row * (this.#cell_size + 1) + 1,
                        this.#cell_size,
                        this.#cell_size
                    );
                }
            }
        }
        ctx.fillStyle = this.BORN_COLOR;
        if (typeof bornCells != 'undefined') {
            bornCells.forEach((cell) => this.#drawCell(ctx, cell));
        } else {
            Object.values(this.#universe.aliveCells).forEach((cell) => this.#drawCell(ctx, cell));
        }
        ctx.fillStyle = this.DYING_COLOR;
        if (typeof dyingCells != 'undefined') {
            dyingCells.forEach((cell) => this.#drawCell(ctx, cell));
        }
        ctx.fillStyle = this.ALIVE_COLOR;
        this.#previously_born_cells.forEach((cell) => this.#drawCell(ctx, cell));
        ctx.stroke();
    }
    
    initNewGrid(initialState = null, nbRows = null, nbCols = null) {
        this.#start_timestamp = null;
        let nbColsToSet = nbCols == null?this.#universe.nbCols:nbCols,
            nbRowsToSet = nbRows == null?this.#universe.nbRows:nbRows;
        this.#universe = new GameOfLifeUniverse(nbRowsToSet, nbColsToSet, initialState);
    }
}
