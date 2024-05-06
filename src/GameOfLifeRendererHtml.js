import GameOfLifeUniverse from "./GameOfLifeUniverse.js";

/**
 * Classe d'affichage HTML du jeu de la vie
 */
export default class GameOfLifeRendererHtml {
    static #defaultNbRows = 100;
    static #defaultNbCols = 100;
    static #aliveClassName = "estvivante";
    #grid;
    #containerID;

    constructor(containerID = "gameContainer", nbRows = null, nbCols = null) {
        if (nbRows == null || nbCols == null) {
            this.#grid = new GameOfLifeUniverse(GameOfLifeRendererHtml.#defaultNbRows, GameOfLifeRendererHtml.#defaultNbCols);
        } else {
            this.#grid = new GameOfLifeUniverse(nbRows, nbCols);
        }
        this.#containerID = containerID;
        this.#initialRender(this.#containerID);
    }

    /**
     * Initialisation de l'affichage (création du tableau)
     * 
     * @param {string} containerID Identifiant du conteneur dans lequel afficher le tableau
     */
    #initialRender(containerID) {
        let container = document.getElementById(containerID),
            gridTable = document.createElement("table");
            gridTable.classList.add("table", "table-bordered", "table-sm");
        for (let rowNumber = 0; rowNumber < this.#grid.nbRows; rowNumber++) {
            let tableRow = gridTable.insertRow();
            for (let colNumber = 0; colNumber < this.#grid.nbCols; colNumber++) {
                let tableCell = tableRow.insertCell(),
                    gridCell = this.#grid.getCellFromCoords(rowNumber, colNumber);
                tableCell.className = gridCell.isAlive?GameOfLifeRendererHtml.#aliveClassName:"";
                tableCell.dataset.row = rowNumber;
                tableCell.dataset.col = colNumber;
                gridCell.underlyingCell = tableCell;
            }
        }
        // On vide le conteneur avant de le remplir
        container.innerHTML = "";
        container.appendChild(gridTable);

        gridTable.addEventListener("click", (e) => {
            // On ne prend que les click sur les cellules
            let noeudClique = e.target;
            if (noeudClique.nodeName == "TD") {
                // Les cellules vivantes ont changées. Il faut effectuer un recalcul à la prochaine itération...
                gameRuner.toggleCellStatus(noeudClique.dataset.row, noeudClique.dataset.col);
            }
        });
    }

    /**
     * Mise à jour de l'affichage pour la prochaine génération.
     * A des fins d'optimisation, on n'effectue le changement que des cellules naissantes ou mourantes.
     */
    renderNextGeneration() {
        // Mise à jour de l'IHM
        let ts1 = performance.now(),
        ts2 = null;
        let generationChanges = this.#grid.proceedToNextGeneration();
        ts2 = performance.now();
        console.log("Avancement de la grille : " + (ts2 - ts1) + "ms");
        ts1 = performance.now()
        let borningCells = generationChanges.borningCells,
            dyingCells = generationChanges.dyingCells;
        borningCells.forEach((cell) => {
            cell.underlyingCell.className = GameOfLifeRendererHtml.#aliveClassName;
        });
        dyingCells.forEach((cell) => {
            cell.underlyingCell.className = "";
        });
        ts2 = performance.now();
        console.log("MAJ DOM : " + (ts2 - ts1) + "ms");
        return borningCells.length + dyingCells.length;
    }

    toggleCellStatus(row, col) {
        let myCell = this.#grid.getCellFromCoords(row, col);
        this.#grid.toggleCellStatus(myCell);
        myCell.underlyingCell.classList.toggle(GameOfLifeRendererHtml.#aliveClassName);
    }

    initNewGrid(initialState = null, nbRows = null, nbCols = null) {
        let nbColsToSet = nbCols == null?this.#grid.nbCols:nbCols,
            nbRowsToSet = nbRows == null?this.#grid.nbRows:nbRows;
        this.#grid = new GameOfLifeUniverse(nbRowsToSet, nbColsToSet, initialState);
    }
}
