const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext("2d");
const score_p = document.getElementById('Score');
const bestScore_p = document.getElementById('bestScore');
const saveKeyScore = "highScoreSnakeObject";

const FPS = 8; //frames per second
const cols = 20; //number of colomns
const rows = 20; //niumber of rows
const cubeSizeX = Math.round(canvas.width / cols); //wide of a cube
const cubeSizeY = Math.round(canvas.height / rows); //height of a cube

const loseDur = 0.5; //lose dur in second

const NORTH = { x: 0, y:-1 }; //directions
const SOUTH = { x: 0, y: 1 }; //directions
const EAST  = { x: 1, y: 0 }; //directions
const WEST  = { x:-1, y: 0 }; //directions

const pointEq = p1 => p2 => p1.x == p2.x && p1.y == p2.y; // check if two pos are in the same point

var score, scoreHigh, scoreStr;

//game loop
setInterval(update, 1000/FPS);

//initial snake
snake = newSnake();

//creates a new snake
function newSnake() {
  return {
    body: [{x: 2, y: 2, way: EAST}],
    apple: [{x: 18, y: 2}],
    turns: [],
    lose: false,
    loseDur: 0
  }
}

//set up event handlers
document.addEventListener("keydown", keyDown);

//function used when a key is pressed
function keyDown(/** @type {KeyboardEvent} */ ev) {
  switch(ev.keyCode){
    case 37://left arrow
      if(validMove(WEST)){
        snake.turns.push({x: snake.body[0].x, y: snake.body[0].y, way: WEST});
      }
      break;
    case 38://up arrow
      if(validMove(NORTH)){
        snake.turns.push({x: snake.body[0].x, y: snake.body[0].y, way: NORTH});
      }
      break;
    case 39://right arrow
      if(validMove(EAST)){
        snake.turns.push({x: snake.body[0].x, y: snake.body[0].y, way: EAST});
      }
      break;
    case 40://down Arrow
      if(validMove(SOUTH)){
        snake.turns.push({x: snake.body[0].x, y: snake.body[0].y, way: SOUTH});
      }
      break;
  }
}

//moves the entire snake
function moveSnake() {
  //each cube
  for(var i = 0; i < snake.body.length; i++){
    if(snake.turns.length > 0){//do if turns has a move
      for(var j = 0; j < snake.turns.length; j++){//check for every move
        changeWay(snake.body[i], snake.turns[j], i, j);
      }
    }

    moveCube(snake.body[i]);
  }
}

//moves each cube
function moveCube(cube) {
  cube.x += cube.way.x;
  cube.y += cube.way.y;

  if(cube.x < 0){
    cube.x = cols - 1;
  } else if(cube.x >= cols){
    cube.x = 0;
  }

  if(cube.y < 0){
    cube.y = rows - 1;
  }else if(cube.y >= rows){
    cube.y = 0;
  }
}

//changes the way of the cube if is on the rifht pos
function changeWay(cube, turn, cubeIdx, turnIdx) {
  if(pointEq(cube)(turn)){
    cube.way = turn.way;

    if(cubeIdx == snake.body.length - 1){
      snake.turns.splice(turnIdx, 1);
    }
  }
}

//checks if the move is valid
function validMove(move) {
  return snake.body[0].way.x + move.x != 0 || snake.body[0].way.y + move.y != 0;
}

//draws every thing on the screen
function drawSnake() {
  // clear
  ctx.fillStyle = '#232323';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw snake
  snake.body.map((p, index) => {
    ctx.fillStyle = 'rgb(0,200,50)';
    ctx.fillRect(cubeSizeX * p.x, cubeSizeY*p.y, cubeSizeX, cubeSizeY);

    if(index == 0){
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(cubeSizeX * p.x + cubeSizeX / 3, cubeSizeY * p.y + cubeSizeY / 3, 3, 0, Math.PI * 2, false);
      ctx.arc(cubeSizeX * p.x + cubeSizeX * 2 / 3, cubeSizeY * p.y + cubeSizeY / 3, 3, 0, Math.PI * 2, false);
      ctx.fill();
    }
  });

  // draw apples
  ctx.fillStyle = 'rgb(255,50,0)';
  ctx.fillRect(cubeSizeX * snake.apple[0].x, cubeSizeY*snake.apple[0].y, cubeSizeX, cubeSizeY);
}

//checks if snake is eating
function eating() {
  if(pointEq(snake.body[0])(snake.apple[0])){
    if(snake.body[snake.body.length - 1].way == EAST){
      snake.body.push({x: snake.body[snake.body.length - 1].x - 1 , y: snake.body[snake.body.length - 1].y, way: snake.body[snake.body.length - 1].way});
    } else if(snake.body[snake.body.length - 1].way == WEST){
      snake.body.push({x: snake.body[snake.body.length - 1].x + 1, y: snake.body[snake.body.length - 1].y, way: snake.body[snake.body.length - 1].way});
    } else if(snake.body[snake.body.length - 1].way == NORTH){
      snake.body.push({x: snake.body[snake.body.length - 1].x , y: snake.body[snake.body.length - 1].y + 1, way: snake.body[snake.body.length - 1].way});
    } else if(snake.body[snake.body.length - 1].way == SOUTH){
      snake.body.push({x: snake.body[snake.body.length - 1].x , y: snake.body[snake.body.length - 1].y - 1, way: snake.body[snake.body.length - 1].way});
    }

    snake.apple.splice(0, 1);
    snake.apple.push({x: Math.ceil(Math.random() * (cols - 1)), y: Math.ceil(Math.random() * (rows - 1))});

    document.getElementsByClassName("scoreBoard")[0].classList.add('green-glow');
    setTimeout( () => document.getElementsByClassName("scoreBoard")[0].classList.remove('green-glow'), 300);
  }
}

//checks score
function checkScore() {
  //checks the high score
  score = snake.body.length;
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

//checks if losing
function checkLose() {
  for(var i = 1; i < snake.body.length; i++){
    if(snake.body[0].x == snake.body[i].x && snake.body[0].y == snake.body[i].y){
      snake.lose = true;
      snake.loseDur = FPS * loseDur;
    }
  }
}







//uppdate the window
function update() {
  //move the snake
  moveSnake();

  //check if lose
  checkLose();

  //if losing draws the red screen during some time
  if(snake.lose){
    ctx.fillStyle = 'rgb(255,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.loseDur--;

    if(snake.loseDur == 0){
      snake = newSnake();
    }
  }

  //verify if eating apple and if eating then add cube
  eating();

  //draws the snake
  if(!snake.lose){
    drawSnake();
  }

  //writes score and best score and checks
  checkScore();
}
