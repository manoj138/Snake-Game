// ---------------- SELECT ELEMENTS ----------------
let boardElement = document.querySelector(".board");
let timeElement = document.querySelector(".time");
let scoreElement = document.querySelector(".score");
let highScoreElement = document.querySelector(".highscore");
let overlay = document.getElementById("overlay");
let startBtn = document.getElementById("startBtn");
let gameOverOverlay = document.getElementById("gameOverOverlay");
let gameOverText = document.getElementById("gameOverText");
let restartBtn = document.getElementById("restartBtn");

// AUDIO
let audioElement = new Audio("./assets/game-music.mp3");
let eatElement = new Audio("./assets/food-eat.mp3");
let wrongElement = new Audio("./assets/error.mp3");

// ---------------- GAME SETTINGS ----------------
let blockSize = 28; 
let rows, cols, blocks;

let snake = [{ x: 4, y: 4 }];
let direction = "left";
let score = 0;
let time = 59;

let food;
let timer;
let timerSlot;

let highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreElement.textContent = `High Score : ${highScore}`;
scoreElement.textContent = `Score : ${score}`;

// ---------------- BUILD BOARD ----------------
function buildBoard() {
  boardElement.innerHTML = "";
  blocks = [];

  rows = Math.floor(boardElement.clientHeight / blockSize);
  cols = Math.floor(boardElement.clientWidth / blockSize);

  boardElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  boardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let block = document.createElement("div");
      block.classList.add("block");
      boardElement.appendChild(block);
      blocks[`${i}-${j}`] = block;
    }
  }
}

// ---------------- PLACE FOOD ----------------
function placeFood() {
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };

  if (snake.some(s => s.x === food.x && s.y === food.y)) {
    placeFood();
  }
}

// ---------------- GAME OVER ----------------
function gameOver(reason) {
  clearInterval(timerSlot);
  clearInterval(timer);

  if (score > highScore) {
    localStorage.setItem("snakeHighScore", score);
    highScore = score;
  }

  gameOverText.innerHTML = `
    <div>Game Over: ${reason}</div>
    <div>Your Score: ${score}</div>
    <div>High Score: ${highScore}</div>
  `;

  gameOverOverlay.style.display = "flex";
  wrongElement.play();
}

// ---------------- SHOW SNAKE ----------------
function showSnake() {
  let head;

  if (direction === "left") head = { x: snake[0].x, y: snake[0].y - 1 };
  if (direction === "right") head = { x: snake[0].x, y: snake[0].y + 1 };
  if (direction === "top") head = { x: snake[0].x - 1, y: snake[0].y };
  if (direction === "down") head = { x: snake[0].x + 1, y: snake[0].y };

  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    return gameOver("Hit the Wall");
  }

  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    return gameOver("Snake hit itself");
  }

  snake.forEach(p => blocks[`${p.x}-${p.y}`]?.classList.remove("snake"));
  blocks[`${food.x}-${food.y}`]?.classList.remove("food");

  snake.unshift(head);

  if (food.x === head.x && food.y === head.y) {
    eatElement.play();
    score++;
    scoreElement.textContent = `Score : ${score}`;
    placeFood();
  } else {
    snake.pop();
  }

  snake.forEach(p => blocks[`${p.x}-${p.y}`]?.classList.add("snake"));
  blocks[`${food.x}-${food.y}`]?.classList.add("food");
}

// ---------------- CONTROLS ----------------
addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" && direction !== "right") direction = "left";
  if (e.key === "ArrowRight" && direction !== "left") direction = "right";
  if (e.key === "ArrowUp" && direction !== "down") direction = "top";
  if (e.key === "ArrowDown" && direction !== "top") direction = "down";
});

// MOBILE BUTTONS
document.getElementById("up").addEventListener("click", () => direction = direction !== "down" ? "top" : direction);
document.getElementById("down").addEventListener("click", () => direction = direction !== "top" ? "down" : direction);
document.getElementById("left").addEventListener("click", () => direction = direction !== "right" ? "left" : direction);
document.getElementById("right").addEventListener("click", () => direction = direction !== "left" ? "right" : direction);

// ---------------- START GAME ----------------
function startGame() {
  overlay.style.display = "none";
  gameOverOverlay.style.display = "none";

  buildBoard();
  placeFood();

  snake = [{ x: 2, y: 2 }];
  direction = "right";
  score = 0;
  time = 59;
  scoreElement.textContent = `Score : ${score}`;
  timeElement.textContent = `Time : ${time}s`;

  timer = setInterval(() => {
    time--;
    timeElement.textContent = `Time : ${time}s`;
    if (time <= 0) gameOver("Time over");
  }, 1000);

  timerSlot = setInterval(showSnake, 170);

  audioElement.play().catch(() => {});
}

// START BUTTON
startBtn.addEventListener("click", startGame);

// RESTART BUTTON
restartBtn.addEventListener("click", () => {
  startGame();
});

// RESIZE BOARD
window.addEventListener("resize", () => {
  buildBoard();
});
