//help functions
const mod       = x => y => ((y % x) + x) % x;
const prop      = k => o => o[k];
const spec      = o => x => Object.keys(o)
.map(k => ({[k]: o[k](x)}))
.reduce((acc, c) => Object.assign(acc, c));

// directions
const NORTH = { x: 0, y:-1 };
const SOUTH = { x: 0, y: 1 };
const EAST  = { x: 1, y: 0 };
const WEST  = { x:-1, y: 0 };

//constants
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const score_p = document.getElementById('Score');
const bestScore_p = document.getElementById('bestScore');
const saveKeyScore = "highScoreSnakeBlock";

 //things needed for the score
var score, scoreHigh, scoreStr;

let state = {
  cols:  20,
  rows:  20,
  moves: [EAST],
  snake: [],
  apple: { x: 16, y: 3 },
};

const cubeSizex = Math.round(canvas.width / state.cols);
const cubeSizey = Math.round(canvas.height / state.rows);

// check if 2 pos are in same point
const pointEq = p1 => p2 => p1.x == p2.x && p1.y == p2.y;

// Booleans
const willEat   = state => pointEq(nextHead(state))(state.apple);
const willCrash = state => state.snake.find(pointEq(nextHead(state)));
const validMove = move => state => state.moves[0].x + move.x != 0 || state.moves[0].y + move.y != 0;

// Next values based on state
const nextMoves = state => state.moves.length > 1 ? state.moves.slice(1) : state.moves;
const nextApple = state => willEat(state) ? rndPos(state) : state.apple;
const nextHead  = state => state.snake.length == 0 ? { x: 10, y: 10 } : {
    x: mod(state.cols)(state.snake[0].x + state.moves[0].x),
    y: mod(state.rows)(state.snake[0].y + state.moves[0].y),
  };
const nextSnake = state => willCrash(state) ?
  [] : (willEat(state) ?
    [nextHead(state)].concat(state.snake) : [nextHead(state)].concat(state.snake.slice(0,state.snake.length -1)));

// get coord of random apple
const rndPos = table => ({
  x: Math.floor(Math.random()*(table.rows-1)),
  y: Math.floor(Math.random()*(table.cols-1)),
})

//gets the next state
const next = spec({
  rows:  prop('rows'),
  cols:  prop('cols'),
  moves: nextMoves,
  snake: nextSnake,
  apple: nextApple
})

// Game loop draw
const draw = () => {
  // clear
  ctx.fillStyle = '#232323';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw snake
  ctx.fillStyle = 'rgb(0,200,50)';
  state.snake.map(p => ctx.fillRect(cubeSizex * p.x, cubeSizey*p.y, cubeSizex, cubeSizey));

  // draw apples
  ctx.fillStyle = 'rgb(255,50,0)';
  ctx.fillRect(cubeSizex * state.apple.x, cubeSizey*state.apple.y, cubeSizex, cubeSizey);

  // add crash
  if (state.snake.length == 0) {
    ctx.fillStyle = 'rgb(255,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
}

//checks score
function checkScore() {
  //checks the high score
  score = state.snake.length;
  scoreStr = localStorage.getItem(saveKeyScore);

  if(scoreStr == null){
    scoreHigh = 1;
  } else {
    scoreHigh = parseInt(scoreStr);
  }

  if(score > scoreHigh){
    scoreHigh = score;
    localStorage.setItem(saveKeyScore, scoreHigh);
  }

  //writes the score and best score
  score_p.innerHTML = "score: " + score;
  bestScore_p.innerHTML = "best Score: " + scoreHigh;
}

// Game loop update
const step = t1 => t2 => {
  if (t2 - t1 > 100) {
    state = next(state);
    draw();
    checkScore();
    window.requestAnimationFrame(step(t2));
  } else {
    window.requestAnimationFrame(step(t1));
  };
}

// Key events
window.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp':
      state = enqueue(state, NORTH);
      break;
    case 'ArrowLeft':
      state = enqueue(state, WEST);
      break;
    case 'ArrowDown':
      state = enqueue(state, SOUTH);
      break;
    case 'ArrowRight':
      state = enqueue(state, EAST);
      break;
  }
});

//adds a mvmt of the snake
const enqueue = (state, move) => validMove(move)(state) ?
  Object.assign({},state,{moves: state.moves.concat([move])}) : state;


// Main
draw();
window.requestAnimationFrame(step(0));
