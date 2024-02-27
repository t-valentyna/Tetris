// Поставити const rowTetro = -2; прописати код, щоб працювало коректно
// Звурстати поле для розрахунку балів
// Прописати логіку і код розрахунку балів гри (1 ряд = 10; 2 ряди = 30; 3 ряди = 50; 4 = 100)
// Реалізувати самостійний рух донизу
const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;
const TETROMINO_NAMES = ["O", "J", "L", "N", "FN", "T", "I"];

const TETROMINOES = {
  O: [
    [1, 1],
    [1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  N: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  FN: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
  I: [
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
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
    .fill()
    .map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
  // console.table(playField);
}

function generateTetromino() {
  const nameIndex = Math.floor(Math.random() * TETROMINO_NAMES.length);

  const name = TETROMINO_NAMES[nameIndex];
  const matrix = TETROMINOES[name];
  const column = 5 - Math.ceil(matrix[0].length / 2);
  const rowTetro = -2;
  // console.log(matrix);
  tetromino = {
    name,
    matrix,
    row: rowTetro,
    column,
  };
}

function placeTetromino() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (tetromino.matrix[row][column] == 0) continue;
      playField[tetromino.row + row][tetromino.column + column] =
        tetromino.name;
    }
  }

  generateTetromino();
}

generatePlayField();
generateTetromino();
const cells = document.querySelectorAll(".grid div");

function drawPlayField() {
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      if (playField[row][column] == 0) continue;
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
      if (!tetromino.matrix[row][column]) continue;
      const cellIndex = convertPositionToIndex(
        tetromino.row + row,
        tetromino.column + column
      );
      // console.log(cellIndex);
      if (cellIndex >= 0) cells[cellIndex].classList.add(name);
    }
  }
}

// drawTetromino();
// drawPlayField();

function draw() {
  cells.forEach((cell) => cell.removeAttribute("class"));
  drawPlayField();
  drawTetromino();
}
draw();

document.addEventListener("keydown", onKeyDown);
function onKeyDown(e) {
  switch (e.key) {
    case "ArrowUp":
      rotateTetromino();
      break;
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

function rotateTetromino() {
  const oldMatrix = tetromino.matrix;
  const rotatedMatrix = rotateMatrix(tetromino.matrix);
  tetromino.matrix = rotatedMatrix;
  if (!isValid()) {
    tetromino.matrix = oldMatrix;
  }
}

function rotateMatrix(matrixTetromino) {
  const N = matrixTetromino.length;
  const rotatedMatrix = [];
  for (let i = 0; i < N; i++) {
    rotatedMatrix[i] = [];
    for (let j = 0; j < N; j++) {
      rotatedMatrix[i][j] = matrixTetromino[N - j - 1][i];
    }
  }
  return rotatedMatrix;
}

function moveTetrominoDown() {
  tetromino.row++;
  if (!isValid()) {
    tetromino.row--;
    placeTetromino();
  }
}

function moveTetrominoLeft() {
  tetromino.column--;
  if (!isValid()) {
    tetromino.column++;
  }
}

function moveTetrominoRight() {
  tetromino.column++;
  if (!isValid()) {
    tetromino.column--;
  }
}

function isValid() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (tetromino.matrix[row][column] == 0) continue;
      if (isOutsideOfGameboard(row, column)) {
        return false;
      }
      if (hasCollisions(row, column)) {
        return false;
      }
    }
  }
  return true;
}

function isOutsideOfGameboard(row, column) {
  return (
    tetromino.column + column < 0 ||
    tetromino.column + column >= PLAYFIELD_COLUMNS ||
    tetromino.row + row >= PLAYFIELD_ROWS
  );
}

function hasCollisions(row, column) {
  return playField?.[tetromino.row + row]?.[tetromino.column + column] || false;
}

let score = 0;
function addPointsToScore(numberOfRows) {
  switch (numberOfRows) {
    case 1:
      score += 10;
      break;
    case 2:
      score += 30;
      break;
    case 3:
      score += 50;
      break;
    case 4:
      score += 100;
      break;
  }
  document.querySelector(".score h2").innerHTML = score;
}

setInterval(() => {
  moveTetrominoDown();
  draw();
}, 1000);
