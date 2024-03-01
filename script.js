const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;
const TETROMINO_NAMES = ["O", "J", "L", "N", "FN", "T", "I"];
const btnRestart = document.querySelector(".btn-restart");
const scoreElement = document.querySelector(".score h2");
const overlayPaused = document.querySelector(".paused");
const overlayGameOver = document.querySelector(".game-over");
const grid = document.querySelector(".grid");
const stats = document.getElementById("stats");
const timeElement = document.querySelector(".time h2");
const levelElement = document.querySelector(".level h2");
const btnReset = document.getElementById("reset");
const btnPause = document.getElementById("pause");
const btnArrowUp = document.getElementById("arrow-up");
const btnArrowLeft = document.getElementById("arrow-left");
const btnArrowDown = document.getElementById("arrow-down");
const btnArrowRight = document.getElementById("arrow-right");
const next = document.querySelector(".next-tetromino");
let playField;
let tetromino;
let score = 0;
let timeId;
let isGameOver = false;
let isPaused = false;
let cells;
let time = 0;
let timerId;
let numOfPlacedTetromino = 0;
let level = 1;
let speed = 1;
let nextNameIndex;
let nextTetraminoCells;

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

init();

function init() {
  isGameOver = false;
  score = 0;
  time = 0;
  level = 1;
  speed = 1;
  timeElement.innerHTML = getTimeFormated(time);
  scoreElement.innerHTML = score;
  levelElement.innerHTML = level;
  generatePlayField();
  nextNameIndex = getRandomIndex();
  createNextTetraminoField();
  nextTetraminoCells = document.querySelectorAll(".next-tetromino div");
  generateTetromino();
  cells = document.querySelectorAll(".grid div");
  requestAnimationFrame(autoMoveDown);
  requestAnimationFrame(timerOn);
}

function restart() {
  grid.innerHTML = "";
  next.innerHTML = "";
  overlayGameOver.style.display = "none";
  init();
}

btnRestart.addEventListener("click", restart);
btnReset.addEventListener("click", function () {
  clearTimeout(timeId);
  clearTimeout(timerId);
  restart();
});
btnPause.addEventListener("click", togglePauseGame);
btnArrowDown.addEventListener("click", function () {
  moveTetrominoDown();
  draw();
});
btnArrowUp.addEventListener("click", function () {
  rotateTetromino();
  draw();
});
btnArrowLeft.addEventListener("click", function () {
  moveTetrominoLeft();
  draw();
});
btnArrowRight.addEventListener("click", function () {
  moveTetrominoRight();
  draw();
});

function convertPositionToIndex(row, column) {
  return row * PLAYFIELD_COLUMNS + column;
}

function generatePlayField() {
  for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
    const div = document.createElement("div");
    grid.append(div);
  }

  playField = new Array(PLAYFIELD_ROWS)
    .fill()
    .map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
  // console.table(playField);
}

function getRandomIndex() {
  return Math.floor(Math.random() * TETROMINO_NAMES.length);
}

function generateTetromino() {
  const nameIndex = nextNameIndex;
  nextNameIndex = getRandomIndex();
  showNextTetramino();

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

function createNextTetraminoField() {
  for (let i = 0; i < 4 * 4; i++) {
    const div = document.createElement("div");
    next.append(div);
  }
}

function showNextTetramino() {
  nextTetraminoCells.forEach((cell) => cell.removeAttribute("class"));
  const name = TETROMINO_NAMES[nextNameIndex];
  const matrix = TETROMINOES[name];
  const tetrominoMatrixSize = matrix.length;

  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (!matrix[row][column]) continue;
      const cellIndex = row * 4 + column;
      // console.log(cellIndex);
      if (cellIndex >= 0) nextTetraminoCells[cellIndex].classList.add(name);
    }
  }
}


function placeTetromino() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (isOutsideOfTopboard(row)) {
        isGameOver = true;
        return;
      }
      if (tetromino.matrix[row][column] == 0) continue;
      playField[tetromino.row + row][tetromino.column + column] =
        tetromino.name;
    }
  }

  const filledRows = findFilledRows();
  removeFilledRows(filledRows);
  addPointsToScore(filledRows.length);
  generateTetromino();
  numOfPlacedTetromino++;
  if (numOfPlacedTetromino > 10) {
    numOfPlacedTetromino = 0;
    levelUp();
  }
}

function levelUp() {
  level++;
  levelElement.innerHTML = level;
  speed -= 0.1;
}

function removeFilledRows(filledRows) {
  for (let i = 0; i < filledRows.length; i++) {
    const row = filledRows[i];
    dropRowsAbove(row);
  }
}

function dropRowsAbove(rowDelete) {
  playField.splice(rowDelete, 1);
  playField.unshift(new Array(PLAYFIELD_COLUMNS).fill(0));
}

function findFilledRows() {
  const fillRows = [];
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    if (!playField[row].some((cell) => cell == 0)) fillRows.push(row);
  }
  return fillRows;
}

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
  if (e.key == "Escape") {
    togglePauseGame();
  }

  if (!isPaused) {
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
      case " ":
        dropTetrominoDown();
        break;
    }
  }
  draw();
}

function dropTetrominoDown() {
  while (tetromino.row > 0) {
    moveTetrominoDown();
  }
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

function isOutsideOfTopboard(row) {
  return tetromino.row + row < 0;
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
  scoreElement.innerHTML = score;
}

function autoMoveDown() {
  moveTetrominoDown();
  draw();
  timeId = setTimeout(() => requestAnimationFrame(autoMoveDown), 1000 * speed);
  if (isGameOver) {
    gameOver();
  }
}

function timerOn() {
  time++;
  timeElement.innerHTML = getTimeFormated(time);
  timerId = setTimeout(() => requestAnimationFrame(timerOn), 1000);
  if (isGameOver) {
    gameOver();
  }
}

function timerOff() {
  clearTimeout(timerId);
}

function stopGame() {
  clearTimeout(timeId);
}

function togglePauseGame() {
  if (isPaused === false) {
    stopGame();
    timerOff();
    overlayPaused.style.display = "flex";
  } else {
    autoMoveDown();
    timerOn();
    overlayPaused.style.display = "none";
  }
  isPaused = !isPaused;
}

function getTimeFormated(num) {
  const numToStr = (num) => num.toString().padStart(2, "0");
  return `${numToStr(Math.floor(num / 60))}:${numToStr(num % 60)}`;
}

function getBestResult() {
  if (!localStorage.bestResult || Number(localStorage.bestResult) < score) {
    localStorage.bestResult = score;
  }
  return localStorage.bestResult;
}

function gameOver() {
  stopGame();
  timerOff();
  stats.innerHTML = `Your score: ${score} <br/> Time spent: ${getTimeFormated(
    time
  )} <br/> Best personal result: ${getBestResult()}`;
  overlayGameOver.style.display = "flex";
}
