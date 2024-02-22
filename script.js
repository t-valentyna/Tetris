// Додати нові фігури
// Стилізувати фігури
// Додати функцію рандому, яка буде повертати випадкову фігуру
// Центрувати фігуру залежно від ширини при генерації

const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;
const TETROMINO_NAMES = [
    "O",
    "J",
    "L",
    "N",
    "FN",
    "T",
    "I"
];

const TETROMINOES = {
    "O": [
        [1,1],
        [1,1]
    ],
    "J": [
        [1,0,0],
        [1,1,1],
        [0,0,0]
    ],
    "L": [
        [0,0,1],
        [1,1,1],
        [0,0,0]
    ],
    "N": [
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ],
    "FN": [
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ],
    "T": [
        [1,1,1],
        [0,1,0],
        [0,0,0]
    ],
    "I": [
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
    ]
};

function convertPositionToIndex(row, column) {
    return row * PLAYFIELD_COLUMNS + column;
}

let playField;
let tetromino;

function generatePlayField() {
    for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
        const div = document.createElement("div");
        document.querySelector(".grid").append(div);
    }

    playField = new Array(PLAYFIELD_ROWS)
        .fill(new Array(PLAYFIELD_COLUMNS).fill(0));
    // console.table(playField);
}

function generateTetromino() {
    const nameIndex = Math.floor(Math.random()*TETROMINO_NAMES.length);

    const name = TETROMINO_NAMES[nameIndex];
    const matrix = TETROMINOES[name];
    // console.log(matrix);
    tetromino = {
        name,
        matrix,
        row: 2,
        column: 5 - Math.ceil(matrix[0].length / 2)
    };
}

generatePlayField();
generateTetromino();
const cells = document.querySelectorAll(".grid div");

function drawPlayField() {
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if(playField[row][column] == 0) continue;
            const name = playField[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            // console.log(cellIndex);
            cells[cellIndex].classList.add(name);
        }
    }
}

function drawTetromino() {
    const name = tetromino.name;
    const tetrominoMatrixSize = tetromino.matrix.length;

    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if(!tetromino.matrix[row][column]) continue;
            const cellIndex = convertPositionToIndex(
                tetromino.row + row,
                tetromino.column + column
            );
            // console.log(cellIndex);
            cells[cellIndex].classList.add(name);
        }
    }
}

// drawTetromino();
// drawPlayField();

function draw() {
    cells.forEach(cell => cell.removeAttribute("class"));
    drawTetromino();
    drawPlayField();
}
draw();

document.addEventListener("keydown", onKeyDown);
function onKeyDown(e) {
    switch(e.key) {
        case "ArrowDown":
            moveTetrominoDown();
            break;
        case "ArrowLeft":
            moveTetrominoLeft();
            break;
        case "ArrowRight":
            moveTetrominoRight();
            break;
    }
    draw();
}

function moveTetrominoDown() {
    tetromino.row++;
}

function moveTetrominoLeft() {
    tetromino.column--;
}

function moveTetrominoRight() {
    tetromino.column++;
}