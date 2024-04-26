class GameOfLifeRendererCanvas {
    #grid;
    #container;
    #canvas;

    constructor(containerID = "gameContainer", nbRows = null, nbCols = null) {
        this.#grid = new GameOfLifeGrid(nbRows, nbCols);
        this.#container = document.getElementById(containerID);
        this.#initialRender();
    }

    #initialRender() {
        this.#container.innerHTML = "";
        this.#canvas = document.createElement("canvas");
        this.#container.appendChild(this.#canvas);
        this.#canvas.width = this.#grid.nbCols * 10;
        this.#canvas.height = this.#grid.nbRows * 10;
        let ctx = this.#canvas.getContext("2d");
    }

    #renderGrid() {
    }

    #renderNextGeneration() {
    }
}
