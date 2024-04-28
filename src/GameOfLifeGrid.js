import Cell from './Cell.js';

/**
 * Classe représentant la grille de jeu
 */
export default class GameOfLifeGrid {
    #nbRows;
    #nbCols;
    #grid;

    constructor(nbRows, nbCols, intialState = null) {
        this.#nbRows = nbRows;
        this.#nbCols = nbCols;
        this.#grid = new Array(nbRows);
        this.#init(intialState);
    }

    get nbRows() { return this.#nbRows; }

    get nbCols() { return this.#nbCols; }

    #init(initialState = null) {
        for (let i = 0; i < this.#nbRows; i++) {
            this.#grid[i] = new Array(this.#nbCols);
            for (let j = 0; j < this.#nbCols; j++) {
                this.#grid[i][j] = new Cell(i, j);
            }
        }
        this.#initGridState(initialState);
    }
    
    #computeAllNeighBours() {
        for (let rowNumber = 0; rowNumber < this.#nbRows; rowNumber++) {
            for (let colNumber = 0; colNumber < this.#nbCols; colNumber++) {
                this.#grid[rowNumber][colNumber].neighbours = this.#getCellNeighbours(rowNumber, colNumber);
            }
        }
    }

    #getCellNeighbours(rowNumber, colNumber) {
        let neighbours = [];
        // Ligne du haut
        if (rowNumber > 0) {
            if (colNumber > 0) {
                neighbours.push(this.#grid[rowNumber-1][colNumber-1]);
            }
            neighbours.push(this.#grid[rowNumber-1][colNumber]);
            if (colNumber < this.nbCols - 1) {
                neighbours.push(this.#grid[rowNumber-1][colNumber+1]);
            }
        }
        // Ligne du milieu
        if (colNumber > 0) {
            neighbours.push(this.#grid[rowNumber][colNumber-1]);
        }
        if (colNumber < this.nbCols - 1) {
            neighbours.push(this.#grid[rowNumber][colNumber+1]);
        }
        // Ligne du bas
        if (rowNumber < this.nbRows - 1) {
            if (colNumber > 0) {
                neighbours.push(this.#grid[rowNumber+1][colNumber-1]);
            }
            neighbours.push(this.#grid[rowNumber+1][colNumber]);
            if (colNumber < this.nbCols - 1) {
                neighbours.push(this.#grid[rowNumber+1][colNumber+1]);
            }
        }
        return neighbours;
    }

    /**
     * Initialisation de l'état de la grille
     * 
     * @param {*} initialState Etat initial à appliquer à la grille
     */
    #initGridState(initialState = null) {
        let stateToApply = [];
        // Calcul des voisins de toutes les cellules
        this.#computeAllNeighBours();
        // Si l'état initial n'est pas fourni, on remplit la grille de manière aléatoire
        if (initialState == null) {
            stateToApply = {
                rowCount: this.#nbRows,
                colCount: this.#nbCols,
                data: new Array(this.#nbRows)
            };
            for (let rowNumber = 0; rowNumber < this.#nbRows; rowNumber++) {
                stateToApply.data[rowNumber] = new Array(this.#nbCols);
                for (let colNumber = 0; colNumber < this.#nbCols; colNumber++) {
                    // Initialisation aléatoire de l'état de la cellule
                    stateToApply.data[rowNumber][colNumber] = (Math.floor(Math.random() * 2) == 1);
                }
            }
        }
        // Calcul du décalage du pattern (centrage dans la grille affichée)
        let rowOffset = Math.floor((this.#nbRows - stateToApply.rowCount) / 2),
            colOffset = Math.floor((this.#nbCols - stateToApply.colCount) / 2);
        for (let rowNumber = 0; rowNumber < stateToApply.rowCount; rowNumber++) {
            for (let colNumber = 0; colNumber < stateToApply.colCount; colNumber++) {
                let cellStateToApply = stateToApply.data[rowNumber][colNumber];
                if (cellStateToApply) {
                    let myCell = this.#grid[rowNumber + rowOffset][colNumber + colOffset];
                    myCell.born();
                }
            }
        }
    }

    /**
     * Permet de redimensionner dynamiquement la grille
     * 
     * @param {int} nbRows Nouveau nombre de lignes
     * @param {int} nbCols Nouveau nombre de colonnes
     */
    resize(nbRows, nbCols) {
        // Si la grille est plus grande, on ajoute des cellules et on les initialise
        // Recalcule des voisins des cellules
    }

    proceedToNextGeneration() {
        let borningCells = [],
            dyingCells = [];
        for (let rowNumber = 0; rowNumber < this.#nbRows; rowNumber++) {
            for (let colNumber = 0; colNumber < this.#nbCols; colNumber++) {
                let myCell = this.#grid[rowNumber][colNumber];
                if (myCell.isAlive) {
                    // Seules les cellules vivantes peuvent mourir
                    if (!myCell.isAliveNext) {
                        dyingCells.push(myCell);
                    }
                    // Seules les voisines mortes d'une cellule vivante peuvent naître.
                    myCell.neighbours.forEach((neighbour) => {
                        if (!neighbour.isAlive && neighbour.isAliveNext && borningCells.indexOf(neighbour) == -1) {
                            borningCells.push(neighbour);
                        }
                    });
                }
            }
        }
        let generationChanges = { borningCells: borningCells, dyingCells: dyingCells };
        // Mise à jour des listes de cellules vivantes et mortes
        borningCells.forEach((cell) => {
            cell.born();
        });
        dyingCells.forEach((cell) => {
            cell.die();
        });
        // On retourne les changements effectués lors du changement de génération
        return generationChanges;
    }

    toggleCellStatus(cell) {
        if (cell.isAlive) {
            cell.die();
        } else {
            cell.born();
        }
    }
    
    getCellFromCoords(row, col) {
        return this.#grid[row][col];
    }
}
