/**
 * Classe représentant une cellule du jeu de la vie
 */
export default class GameOfLifeCell {
    #row;
    #col;
    #isAlive;
    #underlyingCell;
    #numberOfAliveNeighbours;
    #neighbours;
    #key;

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
        this.#key = GameOfLifeCell.getCellKey(this.#row, this.#col);
    }

    get row() { return this.#row; }

    get col() { return this.#col; }

    get key() { return this.#key; }

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

    static getCellKey(row, col) {
        return "r" + row + "c" + col;
    }
}
