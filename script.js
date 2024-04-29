// холст
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
// размер квадратика
const grid = 32;
// массив старт - пустой
var tetrominoSequence = [];

// клетки массива
// поле 10х20
var playfield = [];

// пустые значения
for (let row = -2; row < 20; row++) {
  playfield[row] = [];

  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
}

// Получаем кнопки управления
const leftBtn = document.getElementById('left-btn');
const rotateBtn = document.getElementById('rotate-btn');
const rightBtn = document.getElementById('right-btn');
const downBtn = document.getElementById('down-btn');

// Обработчики событий для кнопок
leftBtn.addEventListener('click', () => {
    moveLeft();
});

rotateBtn.addEventListener('click', () => {
    rotateTetromino();
});

rightBtn.addEventListener('click', () => {
    moveRight();
});

downBtn.addEventListener('click', () => {
    moveDown();
});

function moveLeft() {
  const col = tetromino.col - 1;
  if (isValidMove(tetromino.matrix, tetromino.row, col)) {
      tetromino.col = col;
  }
}

function moveRight() {
  const col = tetromino.col + 1;
  if (isValidMove(tetromino.matrix, tetromino.row, col)) {
      tetromino.col = col;
  }
}

function rotateTetromino() {
  const matrix = rotate(tetromino.matrix);
  if (isValidMove(matrix, tetromino.row, tetromino.col)) {
      tetromino.matrix = matrix;
  }
}

function moveDown() {
  const row = tetromino.row + 1;
  if (isValidMove(tetromino.matrix, row, tetromino.col)) {
      tetromino.row = row;
  } else {
      placeTetromino();
  }
}


// формы для фигур
const tetrominos = {
  'I': [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  'J': [
    [1,0,0],
    [1,1,1],
    [0,0,0],
  ],
  'L': [
    [0,0,1],
    [1,1,1],
    [0,0,0],
  ],
  'O': [
    [1,1],
    [1,1],
  ],
  'S': [
    [0,1,1],
    [1,1,0],
    [0,0,0],
  ],
  'Z': [
    [1,1,0],
    [0,1,1],
    [0,0,0],
  ],
  'T': [
    [0,1,0],
    [1,1,1],
    [0,0,0],
  ]
};

// цвета фигурок
const colors = {
  'I': 'cyan',
  'O': 'yellow',
  'T': 'purple',
  'S': 'green',
  'Z': 'red',
  'J': 'blue',
  'L': 'orange'
};

// счётчик
let count = 0;
// текущая фигура в игре
let tetromino = getNextTetromino();
// кадры анимации
let rAF = null;  
// флаг конца игры
let gameOver = false;

// Функция возвращает случайное число в заданном диапазоне (взял с интернета)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
  
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // последовательность
function generateSequence() {
    // сами фигурки
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  
    while (sequence.length) {
      // рандом на любую фигуру
      const rand = getRandomInt(0, sequence.length - 1);
      const name = sequence.splice(rand, 1)[0];
      // фигуру в массив
      tetrominoSequence.push(name);
    }
  }

  // след. фигура
function getNextTetromino() {
    // если нет фигуры, создаём
    if (tetrominoSequence.length === 0) {
      generateSequence();
    }
    // первая фигура из массива
    const name = tetrominoSequence.pop();
    // матрица, где отрисовка фигуры
    const matrix = tetrominos[name];
  
    // I и O стартуют с середины,, остальные левее из-за размеров
    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  
    const row = name === 'I' ? -1 : -2;
  
    return {
      name: name,      // название фигуры
      matrix: matrix,  // матрица с фигурой
      row: row,        // текущая строка
      col: col         // текущий столбец
    };
  }

  // поворачиваем матрицу на 90 градусов (с интернета)
function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
      row.map((val, j) => matrix[N - j][i])
    );
    // на входе матрица, и на выходе тоже отдаём матрицу
    return result;
  }

  // проверяем после появления или вращения, может ли матрица быть в этом месте поля или она вылезет за его границы
function isValidMove(matrix, cellRow, cellCol) {
    // проверяем все строки и столбцы
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] && (
            // если выходит за границы
            cellCol + col < 0 ||
            cellCol + col >= playfield[0].length ||
            cellRow + row >= playfield.length ||
            // пересекается с другими фигурами
            playfield[cellRow + row][cellCol + col])
          ) {
          return false;
        }
      }
    }
    return true;
  }

// Добавляем счетчик очков
let score = 0;

// Функция для обновления отображения счета
function updateScore() {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = 'Score: ' + score;
}

function placeTetromino() {
  // обрабатываем все строки и столбцы в игровом поле
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {

        // если край фигуры после установки вылезает за границы поля, то игра закончилась
        if (tetromino.row + row < 0) {
          return showGameOver();
        }
        // если всё в порядке, то записываем в массив игрового поля нашу фигуру
        playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
      }
    } 
  }

  // очситка
  let rowCount = 0; // Счётчик заполненных рядов

  for (let row = playfield.length - 1; row >= 0; ) {
    // заполненный ряд
    if (playfield[row].every(cell => !!cell)) {
      rowCount++; // Увеличиваем счётчик заполненных рядов

      // очищаем его и опускаем всё вниз на одну клетку
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r-1][c];
        }
      }
    }
    else {
      // след. ряд
      row--;
    }
  }
  
  // Если был заполнен хотя бы один ряд
  if (rowCount > 0) {
    // Добавляем очки
    score += rowCount * 10;
    // Обновляем отображение счета на экране
    updateScore();
  }

  // след. фигура
  tetromino = getNextTetromino();
}

  //  Game Over
function showGameOver() {
    // минус анимация
    cancelAnimationFrame(rAF);
    // ставим флаг окончания
    gameOver = true;
    // чёрный прямоугольник 
    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
    // надпись
    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
  }

  // нажатия на клаву
document.addEventListener('keydown', function(e) {
    // игра закончилась - выход
    if (gameOver) return;
  
    // стрелки влево и вправо
    if (e.which === 37 || e.which === 39) {
      const col = e.which === 37
        ? tetromino.col - 1
        : tetromino.col + 1;
  
      if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
      }
    }
  
    // стрелка вверх — поворот (интернет)
    if (e.which === 38) {
      // поворачиваем фигуру на 90 градусов
      const matrix = rotate(tetromino.matrix);
      if (isValidMove(matrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = matrix;
      }
    }
  
    // стрелка вниз — ускорить падение
    if(e.which === 40) {
      // смещаем фигуру на строку вниз
      const row = tetromino.row + 1;
      // если опускаться больше некуда — запоминаем новое положение
      if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
        tetromino.row = row - 1;
        // ставим на место и смотрим на заполненные ряды
        placeTetromino();
        return;
      }
      // запоминаем строку, куда стала фигура
      tetromino.row = row;
    }
  });

function loop() {
    // начинаем анимацию
    rAF = requestAnimationFrame(loop);
    // очищаем холст
    context.clearRect(0,0,canvas.width,canvas.height);
  
    // после с фигурами
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        if (playfield[row][col]) {
          const name = playfield[row][col];
          context.fillStyle = colors[name];
  
          // рисуем всё на один пиксель меньше
          context.fillRect(col * grid, row * grid, grid-1, grid-1);
        }
      }
    }
  
    // рисуем текущую фигуру
    if (tetromino) {
  
      // фигура сдвигается вниз каждые 35 кадров
      if (++count > 35) {
        tetromino.row++;
        count = 0;
  
        if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
          tetromino.row--;
          placeTetromino();
        }
      }
  
      context.fillStyle = colors[tetromino.name];
  
      for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
          if (tetromino.matrix[row][col]) {
  
            context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
          }
        }
      }
    }
  }

  // старт игры
rAF = requestAnimationFrame(loop);

// следим за нажатиями на клавиши
document.addEventListener('keydown', function(e) {
    // если игра закончилась и нажата клавиша пробел
    if (gameOver && e.which === 32) {
      // перезапускаем игру
      restartGame();
      return;
    }
  
    // если игра еще не началась и нажата клавиша пробел
    if (!tetromino && e.which === 32) {
      // начинаем игру
      startGame();
      return;
    }
  
    // остальные обработчики клавиш оставляем без изменений
    // ...
});

// функция запуска игры
function startGame() {
    // сброс игрового поля и последовательности фигур
    playfield = [];
    tetrominoSequence = [];
  
    // заполняем игровое поле пустыми клетками
    for (let row = -2; row < 20; row++) {
      playfield[row] = [];
  
      for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
      }
    }
  
    // сброс флага окончания игры
    gameOver = false;

        // Обнуляем счётчик очков
        score = 0;
        // Обновляем отображение счета на экране
        updateScore();
  
    // получаем первую фигуру
    tetromino = getNextTetromino();
  
    // начинаем игровой цикл
    rAF = requestAnimationFrame(loop);
}

// функция перезапуска игры
function restartGame() {
    // останавливаем анимацию игры
    cancelAnimationFrame(rAF);
    // начинаем игру заново
    startGame();
}
