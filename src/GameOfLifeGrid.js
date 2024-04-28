import Cell from './Cell.js';

/**
 * Classe représentant la grille de jeu
 */
export default class GameOfLifeGrid {
    #nbRows;
    #nbCols;
    #grid;
    // Liste des cellules vivantes. Optimisation du calcul des cellules mourantes.
    #listOfAliveCells = [];
    // Liste des cellules mortes voisines des cellules vivantes. Optimisation du calcul des cellules naissantes.
    #lisOfDeadNeighbours = [];

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

    #initDeadNeighbours(cell) {
        for (let neighbour of cell.neighbours) {
            if (!neighbour.isAlive && this.#lisOfDeadNeighbours.indexOf(neighbour) == -1) {
                this.#lisOfDeadNeighbours.push(neighbour);
            }
        }
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
                    this.#listOfAliveCells.push(myCell);
                    this.#initDeadNeighbours(myCell);
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

    /**
     * Retourne la liste des cellules naissantes pour la prochaine itération
     */
    get borningCells() {
        let borningCells = [];
        // Seules les cellules mortes voisines de cellules vivantes peuvent naître
        for (let myCell of this.#lisOfDeadNeighbours) {
            if (myCell.isAliveNext) {
                borningCells.push(myCell);
            }
        }
        return borningCells;
    }

    /**
     * Retourne la liste des cellules mourantes pour la prochaine itération
     */
    get dyingCells() {
        let dyingCells = [];
        // Seules les cellules vivantes peuvent mourir
        for (let myCell of this.#listOfAliveCells) {
            if (!myCell.isAliveNext && myCell.isAlive) {
                dyingCells.push(myCell);
            }
        }
        return dyingCells;
    }

    proceedToNextGeneration() {
        let borningCells = this.borningCells,
            dyingCells = this.dyingCells,
            generationChanges = {borningCells: borningCells, dyingCells: dyingCells};
        // Mise à jour des listes de cellules vivantes et mortes
        borningCells.forEach((cell) => {
            cell.born();
        });
        dyingCells.forEach((cell) => {
            cell.die();
        });
        // Suppression des cellules mourantes de la liste des cellules vivantes
        for (let cell of dyingCells) {
            let indexOfDeadCell = this.#listOfAliveCells.indexOf(cell);
            if (indexOfDeadCell != -1) {
                this.#listOfAliveCells.splice(indexOfDeadCell, 1);
            }
        }
        // Ajout des cellules naissantes à la liste des cellules vivantes (et ajout de leurs voisins morts à la liste des cellules mortes)
        for (let cell of borningCells) {
            this.#listOfAliveCells.push(cell);
            this.#initDeadNeighbours(cell);
        }
        // Epuration de la liste des cellules mortes (suppression des cellules qui sont nées durant cette génération)
        for (let cell of borningCells) {
            let indexOfAliveCell = this.#lisOfDeadNeighbours.indexOf(cell);
            if (indexOfAliveCell != -1) {
                this.#lisOfDeadNeighbours.splice(indexOfAliveCell, 1);
            }
        }
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
