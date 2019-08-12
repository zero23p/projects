//canvas
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

//constants
const FPS = 10; //frames per second
const gameBorder = 2; //pixels of the red border
const rows = 20; //number of rows
const cols = 10;//number of columns
const size = 25; //size of little cubes
const levelTimeSec = 1; //time needed to have been passed to became faster
const saveKeyScore = "highScoreTetris";//save key for the score
const maxScore_div = document.getElementsByClassName('maxScore');
const score_div = document.getElementsByClassName('score');

//symbols
S = [['.....',
      '.....',
      '..00.',
      '.00..',
      '.....'],
     ['.....',
      '..0..',
      '..00.',
      '...0.',
      '.....']]

Z = [['.....',
      '.....',
      '.00..',
      '..00.',
      '.....'],
     ['.....',
      '..0..',
      '.00..',
      '.0...',
      '.....']]

I = [['..0..',
      '..0..',
      '..0..',
      '..0..',
      '.....'],
     ['.....',
      '0000.',
      '.....',
      '.....',
      '.....']]

O = [['.....',
      '.....',
      '.00..',
      '.00..',
      '.....']]

J = [['.....',
      '.0...',
      '.000.',
      '.....',
      '.....'],
     ['.....',
      '..00.',
      '..0..',
      '..0..',
      '.....'],
     ['.....',
      '.....',
      '.000.',
      '...0.',
      '.....'],
     ['.....',
      '..0..',
      '..0..',
      '.00..',
      '.....']]

L = [['.....',
      '...0.',
      '.000.',
      '.....',
      '.....'],
     ['.....',
      '..0..',
      '..0..',
      '..00.',
      '.....'],
     ['.....',
      '.....',
      '.000.',
      '.0...',
      '.....'],
     ['.....',
      '.00..',
      '..0..',
      '..0..',
      '.....']]

T = [['.....',
      '..0..',
      '.000.',
      '.....',
      '.....'],
     ['.....',
      '..0..',
      '..00.',
      '..0..',
      '.....'],
     ['.....',
      '.....',
      '.000.',
      '..0..',
      '.....'],
     ['.....',
      '..0..',
      '.00..',
      '..0..',
      '.....']]

//pieces
var shapes = [S, Z, I, O, J, L, T];
var colors = ["red", "green", "orange", "purple", "magenta", "cyan", "blue"];

//variables
var game = newGame();
var shapePos, bestScore;

//loop
setInterval(update, 1000/FPS);

//draw the screen
function draw(grid) {
  //puts everything in black
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //draw the cubes of color
  for(var y = 0; y < rows; y++){//iterates y
    for(var x = 0; x < cols; x++){//iterates x
      ctx.fillStyle = grid[y][x];
      ctx.fillRect( ((canvas.width - (size * cols)) / 2) + x * size, (canvas.height - (size * rows)) + y * size, size, size);
    }
  }

  //draw grey lines
  ctx.strokeStyle = "grey";
  ctx.lineWidth = 0.5;
  for(var i = 0; i < rows; i++){//horizontal lines
    ctx.beginPath();
    ctx.moveTo((canvas.width - (cols * size)) / 2, canvas.height - (rows * size) + i * size);
    ctx.lineTo(((canvas.width - (cols * size)) / 2) + (cols * size) , canvas.height - (rows * size) + i * size);
    ctx.closePath();
    ctx.stroke();
  }
  for(var i = 0; i < cols; i++){//vertical lines
    ctx.beginPath();
    ctx.moveTo( ((canvas.width - (cols * size)) / 2) + i * size, canvas.height - (rows * size));
    ctx.lineTo( ((canvas.width - (cols * size)) / 2) + i * size, canvas.height - gameBorder);
    ctx.closePath();
    ctx.stroke();
  }

  //draws red border
  ctx.strokeStyle = "red";
  ctx.lineWidth = gameBorder;
  ctx.beginPath();
  ctx.moveTo((canvas.width - (cols * size)) / 2, canvas.height - (rows * size));
  ctx.lineTo(((canvas.width - (cols * size)) / 2) + (cols * size), canvas.height - (rows * size));
  ctx.lineTo(((canvas.width - (cols * size)) / 2) + (cols * size), canvas.height - gameBorder);
  ctx.lineTo((canvas.width - (cols * size)) / 2, canvas.height - gameBorder);
  ctx.closePath();
  ctx.stroke();

  //draws the score
  maxScore_div[0].innerHTML = "Best Score: " + bestScore;
  score_div[0].innerHTML = "Score: " + game.score;

  //draws the next piece
  var sx = canvas.width / 12;
  var sy = canvas.height / 3;
  var format = game.nextPiece.shape[game.nextPiece.rotation % game.nextPiece.shape.length];

  ctx.fillStyle = game.nextPiece.color;
  for(var y = 0; y < format.length; y++){//iterates y
    var row = Array.from(format[y]);
    for(var x = 0; x < row.length; x++){//iterates x
      var col = row[x];
      if(col == "0"){
        ctx.fillRect(sx + x * size, sy + y * size, size, size)
      }
    }
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white";
  ctx.font = "small-caps " + 25 + "px dejavu sans mono";
  ctx.fillText("next piece:", sx + size * 2, sy - size * 1.5);
}

//get a piece function
function getPiece(x, y, ind) {
  return {
    shape: shapes[ind],
    x: x,
    y: y,
    color: colors[ind],
    rotation: 0,
  }
}

//creates the grid
function create_grid(lock) {
  var grid = [];

  for(var y = 0; y < rows; y++){
    grid.push([]);
    for(var x = 0; x < cols; x++){
      grid[y].push("black");
    }
  }

  lock.forEach(function(element){
    if(element.y >= 0){
      grid[element.y][element.x] = element.color;
    }
  });
  return grid;
}

//activates when key is pressed
document.addEventListener("keydown", keyDown);

function keyDown(/** @type {KeyboardEvent} */ ev) {
  switch (ev.keyCode) {
    case 37://left arrow
      game.currentPiece.x--;
      if(!validSpace(game.currentPiece)){game.currentPiece.x++;};
      break;
    case 38://up arrow
      game.currentPiece.rotation++;
      if(!validSpace(game.currentPiece)){game.currentPiece.rotation--;};
      break;
    case 39://right arrow
      game.currentPiece.x++;
      if(!validSpace(game.currentPiece)){game.currentPiece.x--;};
      break;
    case 40: //down Arrow
      game.currentPiece.y++;
      if(!validSpace(game.currentPiece)){game.currentPiece.y--;};
      break;
  }
}

//check if it's a valid space
function validSpace(piece) {
  var positions = convertShapeFormat(piece);
  var count = 0;
  var grid = create_grid(game.lockedPositions);
  var acceptedPos = [];

  for(var y = 0;y < rows; y++){
    acceptedPos.push([]);
    for(var x = 0; x < cols; x++){
      if(grid[y][x] == "black"){
        acceptedPos[y].push(true);
      } else {
        acceptedPos[y].push(false);
      }
    }
  }

  for(var i = 0; i < positions.length; i++){
    if(positions[i].x >= 0 && positions[i].y >= 0 && positions[i].x < cols && positions[i].y < rows){
      if(acceptedPos[positions[i].y][positions[i].x]){
        count++;
      }
    }else if (positions[i].y < 0 && positions[i].x >= 0 && positions[i].x < cols) {
      count++;
    }
  }

  if(count == positions.length){
    return true
  } else {
    return false;
  }
}

//return a list with the pos of piece in an array
function convertShapeFormat(piece) {
  var positions = [];
  var format = piece.shape[piece.rotation % piece.shape.length];

  for(var y = 0; y < format.length; y++){//iterates y
    var row = Array.from(format[y]);
    for(var x = 0; x < row.length; x++){//iterates x
      var col = row[x];
      if(col == "0"){
        positions.push({x: piece.x + x, y: piece.y + y})
      }
    }
  }

  for(var i = 0; i < positions.length; i++){
    positions[i].x -= 2;
    positions[i].y -= 4;
  }

  return positions;
}

//clear the rows and returns a score
function clearRows() {
  var inc = 0;
  var indexes = [];
  var ind;
  var grid = create_grid(game.lockedPositions);

  for(var y = rows - 1; y >= 0; y--){//gets the index if there is a row to delete
    var count = 0;
    for(var x = 0; x < cols; x++){

      if(!(grid[y][x] == "black")){//el color negro no esta en una row
        count++;
      }

      if(count == cols){//color negro no esta en toda la row
        inc++;
        ind = y;
        for(var i = 0; i < game.lockedPositions.length; i++){
          if(game.lockedPositions[i].y == y){
            indexes.push(i);
          }
        }
      }

    }
  }

  for(var i = indexes.length - 1; i >= 0; i--){//deletes the cubes of the locked positions
    game.lockedPositions.splice(indexes[i], 1);
  }

  if(inc > 0){//changes the y of the elements in locked if there was something deleted
    game.lockedPositions.forEach(function(cube){
      if(cube.y < ind){
        cube.y += inc;
      }
    });
  }

  return inc;
}

//new game
function newGame() {
  var bestScoreStr = localStorage.getItem(saveKeyScore);
  if(bestScoreStr == null){
    bestScore = 0;
  } else {
    bestScore = parseInt(bestScoreStr);
  }

  return {
    grid: [],
    score: 0,
    currentPiece: getPiece(5, 0, 3),
    nextPiece: getPiece(5, 0, Math.round(Math.random() * 6)),
    lockedPositions: [],
    changePiece: false,
    fallTimeSec: 0.27,
    fallTime: Math.ceil(0.27 * FPS),
    levelTime: Math.ceil(levelTimeSec * FPS),
  }
}

//checks if you lose
function checkLose() {
  for(var i = 0; i < game.lockedPositions.length; i++){
    if(game.lockedPositions[i].y < 1){
      return true;
    }
  }

  return false;
}

//updates the score if neccessary
function updateScore(score) {
  if(score > bestScore){
    bestScore = score;
    localStorage.setItem(saveKeyScore, bestScore);
  }
}













//main function
function update() {
  //moves the piece down
  game.fallTime--;
  if(game.fallTime == 0){
    game.fallTime = Math.ceil(game.fallTimeSec * FPS);

    game.currentPiece.y++;
    if(!validSpace(game.currentPiece)){//changes piece if necessary
      game.currentPiece.y--;
      game.changePiece = true;
    }
  }

  //pieces moves down faster after some time
  game.levelTime--;
  if(game.levelTime == 0){
    game.levelTime = Math.ceil(levelTimeSec * FPS);

    if(game.fallTimeSec > 0.12){
      game.fallTimeSec -= 0.005
    }
  }

  //creates the new grid every time
  game.grid = create_grid(game.lockedPositions);

  //array with the pos of the current piece
  shapePos = convertShapeFormat(game.currentPiece)

  //puts the piece on the grid
  for(var i = 0; i < shapePos.length; i++){
    if(shapePos[i].y > -1){
      game.grid[shapePos[i].y][shapePos[i].x] = game.currentPiece.color;
    }
  }

  //changes piece and put it in the locked if necessary
  if(game.changePiece){
    shapePos.forEach(function(element){//adds piece to locked pos
      game.lockedPositions.push({x: element.x, y: element.y, color: game.currentPiece.color});
    });

    game.currentPiece = game.nextPiece;
    game.nextPiece = getPiece(5, 0, Math.round(Math.random() * 6));
    game.changePiece = false;
    game.score += clearRows() * 10;

    updateScore(game.score);
  }

  //draws the game screen
  draw(game.grid);

  //checks if lose
  if(checkLose()){
    game = newGame();
  }
}
