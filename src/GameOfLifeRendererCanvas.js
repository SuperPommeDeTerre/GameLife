import GameOfLifeCell from "./GameOfLifeCell.js";

export default class GameOfLifeRendererCanvas {
    #universe_dimensions;
    #container;
    #canvas;
    #canvas_context;
    #previously_born_cells = []; // Utile afin de changer la couleur des cellules naissantes lors de la génération suivante.
    #cell_size = 5; // Taille par défaut des cellules (en px)
    CELL_SIZES = [ 1, 3, 5, 11, 21]; // Tailles de cellules autorisées.
    GRID_COLOR = "#CCCCCC"; // Couleur de la grille
    DEAD_COLOR = "#FFFFFF"; // Couleur des cellules mortes
    ALIVE_COLOR = "#000000"; // Couleur des cellules vivantes
    BORN_COLOR = "#0000FF"; // Couleur des cellules naissantes
    DYING_COLOR = "#FF0000"; // Couleur des cellules mourantes au prochain tour
    
    constructor(container = null, nbRows = null, nbCols = null, cellSize = 5) {
        this.#container = container;
        let containerWidth = this.#container.offsetWidth,
            containerHeight = this.#container.offsetHeight;
        // Calcul de la taille de l'univers à partir de la taille du conteneur
        this.#universe_dimensions = {
            width: (nbCols == null?Math.floor(containerWidth / (this.#cell_size + 1)) - 1:nbCols),
            height: (nbRows == null?Math.floor(containerHeight / (this.#cell_size + 1)) - 1: nbRows),
        };
        this.#init();
    }

    get universe_dimensions() { return this.#universe_dimensions; }
    get canvas() { return this.#canvas; }
    get cell_size() { return this.#cell_size; }

    #init() {
        this.#container.innerHTML = "";
        this.#canvas = document.createElement("canvas");
        this.#canvas.width = (this.#cell_size + 1) * this.#universe_dimensions.width + 1; 
        this.#canvas.height = (this.#cell_size + 1) * this.#universe_dimensions.height + 1;
        this.#container.appendChild(this.#canvas);
        this.#canvas_context = this.#canvas.getContext("2d");
    }

    initUniverse(universe) {
        this.#drawGrid();
        this.#drawCells(null, null, null, universe.aliveCells);
    }

    render(universeTickResult = null) {
        window.requestAnimationFrame(this.#renderNextGeneration.bind(this, universeTickResult));
    }

    #renderNextGeneration(universeTickResult) {
        let bornCells = universeTickResult.changes.births,
            diedCells = universeTickResult.changes.deaths,
            ts1 = performance.now(),
            ts2 = null;
        this.#drawCells(bornCells, diedCells, universeTickResult.coming.deaths);
        ts2 = performance.now();
        console.log("MAJ affichage : " + (ts2 - ts1) + "ms");
        this.#previously_born_cells = [...bornCells];
    }

    #drawGrid() {
        let ctx = this.#canvas_context;
        ctx.beginPath();
        ctx.strokeStyle = this.GRID_COLOR;
      
        // Vertical lines.
        for (let i = 0; i <= this.#universe_dimensions.width; i++) {
          ctx.moveTo(i * (this.#cell_size + 1) + 1, 0);
          ctx.lineTo(i * (this.#cell_size + 1) + 1, (this.#cell_size + 1) * this.#universe_dimensions.height + 1);
        }
      
        // Horizontal lines.
        for (let j = 0; j <= this.#universe_dimensions.height; j++) {
          ctx.moveTo(0, j * (this.#cell_size + 1) + 1);
          ctx.lineTo((this.#cell_size + 1) * this.#universe_dimensions.width + 1, j * (this.#cell_size + 1) + 1);
        }
        ctx.stroke();
    }
    
    #drawCell(ctx, row, col) {
        ctx.fillRect(
            col * (this.#cell_size + 1) + 1,
            row * (this.#cell_size + 1) + 1,
            this.#cell_size,
            this.#cell_size
        );
    }

    #drawCells(bornCells = null, deadCells = null, dyingCells = null, aliveCells = null) {
        let ctx = this.#canvas_context;
    
        ctx.beginPath();
        ctx.fillStyle = this.DEAD_COLOR;
        if (deadCells != null) {
            deadCells.forEach((cell) => this.#drawCell(ctx, cell.row, cell.col));
        } else {
            for (let row = 0; row < this.#universe_dimensions.height; row++) {
                for (let col = 0; col < this.#universe_dimensions.width; col++) {
                    if (aliveCells.hasOwnProperty(GameOfLifeCell.getCellKey(row, col))) {
                        continue;
                    }
                    this.#drawCell(ctx, row, col);
                }
            }
        }
        ctx.fillStyle = this.BORN_COLOR;
        if (bornCells != null) {
            bornCells.forEach((cell) => this.#drawCell(ctx, cell.row, cell.col));
        } else {
            if (aliveCells != null) {
                ctx.fillStyle = this.ALIVE_COLOR;
            }
            Object.values(aliveCells).forEach((cell) => this.#drawCell(ctx, cell.row, cell.col));
        }
        ctx.fillStyle = this.DYING_COLOR;
        if (dyingCells != null) {
            dyingCells.forEach((cell) => this.#drawCell(ctx, cell.row, cell.col));
        }
        ctx.fillStyle = this.ALIVE_COLOR;
        this.#previously_born_cells.forEach((cell) => {
            if (cell.isAlive) {
                this.#drawCell(ctx, cell.row, cell.col);
            }
        });
        ctx.stroke();
    }
    
    initNewGrid(initialState = null, nbRows = null, nbCols = null) {
        this.#canvas_context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    toggleCellStatus(cell) {
        let ctx = this.#canvas_context;
        ctx.fillStyle = cell.isAlive?this.ALIVE_COLOR:this.DEAD_COLOR;
        this.#drawCell(ctx, cell);
        ctx.stroke();
    }
}
