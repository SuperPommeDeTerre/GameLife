"use strict";

/**
 * Classe représentant une cellule du jeu de la vie
 */
class Cell {
    #row;
    #col;
    #isAlive;
    #underlyingCell;
    #numberOfAliveNeighbours;
    #neighbours;

    /**
     * Constructeur de cellule.
     * @param {int} row Numéro de la ligne
     * @param {int} col Numéro de la colonne
     */
    constructor(row, col, isAlive = false) {
        this.#row = row;
        this.#col = col;
        this.#isAlive = isAlive;
        this.#underlyingCell = null;
        this.#numberOfAliveNeighbours = 0;
        this.#neighbours = [];
    }

    get row() { return this.#row; }

    get col() { return this.#col; }

    /**
     * Liste des cellules voisines de la cellule
     */
    get neighbours() { return this.#neighbours; }
    set neighbours(value) { this.#neighbours = value; }

    /**
     * Cellule sous-jacente dans le DOM (permet d'éviter de parcourir le DOM à chaque itération)
     */
    get underlyingCell() { return this.#underlyingCell; }
    set underlyingCell(value) { this.#underlyingCell = value; }

    get isAlive() { return this.#isAlive; }

    /**
     * Indique si la cellule est vivante à la prochaine itération
     */
    get isAliveNext() {
        return (this.#numberOfAliveNeighbours == 3 || (this.#isAlive && this.#numberOfAliveNeighbours == 2));
    }

    born() {
        this.#isAlive = true;
        for (let neighbour of this.#neighbours) {
            neighbour.#numberOfAliveNeighbours++;
        }
    }

    die() {
        this.#isAlive = false;
        for (let neighbour of this.#neighbours) {
            neighbour.#numberOfAliveNeighbours--;
        }
    }
}

/**
 * Classe représentant la grille de jeu
 */
class GameOfLifeGrid {
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

    get grid() { return this.#grid; }

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
        // Calcul des voisins de toutes les cellules
        this.#computeAllNeighBours();
        // Si l'état initial n'est pas fourni, on remplit la grille de manière aléatoire
        if (initialState == null) {
            for (let rowNumber = 0; rowNumber < this.#nbRows; rowNumber++) {
                for (let colNumber = 0; colNumber < this.#nbCols; colNumber++) {
                    // Initialisation aléatoire de l'état de la cellule
                    let myCell = this.#grid[rowNumber][colNumber];
                    // Les cellules étant mortes initialement, on les fait naître aléatoirement
                    if (Math.floor(Math.random() * 2) == 1) {
                        myCell.born();
                        this.#listOfAliveCells.push(myCell);
                        this.#initDeadNeighbours(myCell);
                    }
                }
            }
        } else {
            // Dans le cas contraire, on initialise la grille avec l'état fourni en centrant le schéma initial dans la grille
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
        for (let cell of dyingCells) {
            let indexOfDeadCell = this.#listOfAliveCells.indexOf(cell);
            if (indexOfDeadCell != -1) {
                this.#listOfAliveCells.splice(indexOfDeadCell, 1);
            }
        }
        for (let cell of borningCells) {
            this.#listOfAliveCells.push(cell);
            for (let neighbour of cell.neighbours) {
                if (!neighbour.isAlive && this.#lisOfDeadNeighbours.indexOf(neighbour) == -1) {
                    this.#lisOfDeadNeighbours.push(neighbour);
                }
            }
        }
        this.#lisOfDeadNeighbours = this.#lisOfDeadNeighbours.filter((deadCell) => !deadCell.isAlive);
        return generationChanges;
    }
}

/**
 * Classe d'affichage du jeu de la vie
 */
class GameOfLifeRenderer {
    static get #defaultNbRows() { return 100; }
    static get #defaultNbCols() { return 100; }
    #grid;
    #containerID;

    constructor(containerID = "gameContainer", nbRows = null, nbCols = null) {
        if (nbRows == null || nbCols == null) {
            this.#grid = new GameOfLifeGrid(GameOfLifeRenderer.#defaultNbRows, GameOfLifeRenderer.#defaultNbCols);
        } else {
            this.#grid = new GameOfLifeGrid(nbRows, nbCols);
        }
        this.#containerID = containerID;
        this.#initialRender(this.#containerID);
    }

    get grid() { return this.#grid; }
    set grid(value) {
        this.#grid = value;
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
                let tableCell = tableRow.insertCell();
                tableCell.className = this.#grid.grid[rowNumber][colNumber].isAlive?"estvivante":"";
                tableCell.dataset.row = rowNumber;
                tableCell.dataset.col = colNumber;
                this.#grid.grid[rowNumber][colNumber].underlyingCell = tableCell;
            }
        }
        // On vide le conteneur avant de le remplir
        container.innerHTML = "";
        container.appendChild(gridTable);
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
            cell.underlyingCell.className = "estvivante";
        });
        dyingCells.forEach((cell) => {
            cell.underlyingCell.className = "";
        });
        ts2 = performance.now();
        console.log("MAJ DOM : " + (ts2 - ts1) + "ms");
        return borningCells.length + dyingCells.length;
    }
}

/**
 * Classe de gestion du jeu de la vie
 */
class GameOfLifeRunner {
    #renderer;
    #initialState;
    #speed;
    #generation;
    #timerId;

    /**
     * 
     * @param {int} nbRows 
     * @param {int} nbCols 
     * @param {string} containerId
     * @param {array} initialState
     * @param {int} speed 
     * @param {GameOfLifeRenderer} renderer 
     */
    constructor(nbRows, nbCols, containerId, initialState = null, speed = 200, renderer = null) {
        this.#renderer = renderer==null?new GameOfLifeRenderer(containerId, nbRows, nbCols):renderer;
        this.#initialState = initialState;
        this.#speed = speed;
        this.#generation = 0;
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

    toggleCellStatus(row, col, isAlive) {
        let myCell = this.#renderer.grid.grid[row][col];
        if (myCell.isAlive != isAlive) {
            if (myCell.isAlive) {
                myCell.die();
            } else {
                myCell.born();
            }
        }
    }

    play(runner) {
        let numberOfChanges = runner.#renderer.renderNextGeneration();
        // Incrémentation du compteur de génération
        runner.#generation++;
        // Si aucun changement, on arrête le jeu
        if (numberOfChanges == 0) {
            runner.pause();
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
        this.#renderer.grid = new GameOfLifeGrid(this.#renderer.grid.nbRows, this.#renderer.grid.nbCols, this.#initialState);
        // Et les compteurs !
        this.#generation = 0;
    }
}
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
        let nbRow = parseInt(document.getElementById("nblignes").value, 10);
        let nbCol = parseInt(document.getElementById("nbcolonnes").value, 10);
        gameRuner = new GameOfLifeRunner(nbRow, nbCol);
        btnStart.disabled = false;
        btnStepByStep.disabled = false;
        btnPause.disabled = true;
        btnVitesseRapide.disabled = false;
        btnVitesseTresRapide.disabled = false;
    });

    chkDisplayGrid.addEventListener("click", (e) => {
        document.getElementById("gameContainer").classList.toggle("visually-hidden");
    });

    document.getElementById("gameContainer").addEventListener("click", (e) => {
        // On ne prend que les click sur les cellules
        let noeudClique = e.target;
        if (noeudClique.nodeName == "TD") {
            noeudClique.classList.toggle("estvivante");
            // Les cellules vivantes ont changées. Il faut effectuer un recalcul à la prochaine itération...
            gameRuner.toggleCellStatus(noeudClique.dataset.row, noeudClique.dataset.col, noeudClique.classList.contains("estvivante"));
        }
    });

    btnRestart.dispatchEvent(new Event("click"));
}, false);

// Path: main.js
