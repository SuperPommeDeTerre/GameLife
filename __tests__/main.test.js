import { Cell, GameOfLifeGrid, GameOfLifeRenderer, GameOfLifeRunner } from '../src/main';

describe('Cell', () => {
    test('should create a cell with the given row and column numbers', () => {
        const cell = new Cell(1, 2);
        expect(cell.row).toBe(1);
        expect(cell.col).toBe(2);
    });

    test('should set the cell as alive or dead', () => {
        const cell = new Cell(1, 2);
        cell.isAlive = true;
        expect(cell.isAlive).toBe(true);
        cell.isAlive = false;
        expect(cell.isAlive).toBe(false);
    });

    test('should set the neighbours of the cell', () => {
        const cell = new Cell(1, 2);
        const neighbours = [new Cell(0, 1), new Cell(0, 2), new Cell(0, 3)];
        cell.neighbours = neighbours;
        expect(cell.neighbours).toEqual(neighbours);
    });

    test('should set the underlying DOM cell', () => {
        const cell = new Cell(1, 2);
        const underlyingCell = document.createElement('div');
        cell.underlyingCell = underlyingCell;
        expect(cell.underlyingCell).toBe(underlyingCell);
    });

    test('should calculate the next state of the cell', () => {
        const cell = new Cell(1, 2);
        cell.isAlive = true;
        cell.neighbours = [new Cell(0, 1), new Cell(0, 2), new Cell(0, 3)];
        cell.isAliveNext = cell.born();
        expect(cell.isAliveNext).toBe(true);
        cell.isAliveNext = cell.die();
        expect(cell.isAliveNext).toBe(false);
    });
});

describe('GameOfLifeGrid', () => {
    test('should create a grid with the given number of rows and columns', () => {
        const grid = new GameOfLifeGrid(3, 3);
        expect(grid.nbRows).toBe(3);
        expect(grid.nbCols).toBe(3);
    });

    test('should initialize the grid with the given initial state', () => {
        const initialState = [
            [true, false, true],
            [false, true, false],
            [true, false, true]
        ];
        const grid = new GameOfLifeGrid(3, 3, initialState);
        expect(grid.borningCells.length).toBe(4);
        expect(grid.dyingCells.length).toBe(4);
    });

    test('should resize the grid to the given number of rows and columns', () => {
        const grid = new GameOfLifeGrid(3, 3);
        grid.resize(4, 4);
        expect(grid.nbRows).toBe(4);
        expect(grid.nbCols).toBe(4);
    });
});

describe('GameOfLifeRenderer', () => {
    test('should render the initial generation of cells', () => {
        const grid = new GameOfLifeGrid(3, 3);
        const renderer = new GameOfLifeRenderer(grid);
        const containerID = 'game-container';
        renderer.renderNextGeneration(grid.borningCells, grid.dyingCells);
        expect(document.getElementById(containerID).children.length).toBe(9);
    });
});

describe('GameOfLifeRunner', () => {
    test('should start and pause the game', () => {
        const grid = new GameOfLifeGrid(3, 3);
        const renderer = new GameOfLifeRenderer(grid);
        const runner = new GameOfLifeRunner(3, 3, renderer);
        runner.start();
        expect(runner.speed).toBe(400);
        runner.pause();
        expect(runner.speed).toBe(null);
    });
});
