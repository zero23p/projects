//canvas
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

//constants
const FPS = 10; //frames per second
const invadersSize = 30; //size of invaders in pixels
const rows = 5; //num of rows of invaders
const cols = 10; //num of cols of invaders
const move = 10; //pixels that ship moves

const shipSizeY = 20; //height of the ship in pixels
const shipSizeX = 60; //widht of the ship in pixels
const shipY = canvas.height - invadersSize - shipSizeY; //position of the y that will never change

const laserSizeY = 15; //height of laser in pixels
const laserSizeX = 5;//width of laser in pixels
const laserSpeed = 10; //pixels per tick that the laser moves
const reloadedTime = 0.5; //time of reloaded in sec
const laserMax = 7; //max of lasers on screen

var moveSide = 1; //time needed to move to side in sec
var moveDown = 3.5; //time needed to move down in sec
const moveInvaders = invadersSize / 2; //dist moved by the invaders

const textSize = 40; //size of text in px
const textFadeTime = 2.5; //time that text is on screen in sec

const saveKeyScore = "bestScoreInvaders"; //save key for the best score
const invaderPts = 50; //number of points per invader destroyed
const newlevelPts = 2500; //points for level

//interval
setInterval(update, 1000/FPS);

//activates when key is touched
document.addEventListener("keydown", keyDown);

function keyDown(/** @type {KeyboardEvent} */ ev) {
  switch (ev.keyCode) {
    case 37://left arrow
      game.ship[0] -= move;
      if(game.ship[0] < 0){
        game.ship[0] += move;
      }
      break;
    case 39: //right arrow
      game.ship[0] += move;
      if(game.ship[0] + shipSizeX > canvas.width){
        game.ship[0] -= move;
      }
      break;
    case 32: //space bar laser
      if(game.reloaded && game.laserNum < laserMax){
        game.shoots.push({x: game.ship[0] + shipSizeX / 2, y: game.ship[1] - laserSizeY});
        game.reloaded = false;
        game.laserNum++;
      }
      break;
  }
}

//invaders
function newGame() {
  //initial variables
  level = 0;
  textAlpha = 1;
  text = "Level " + (level + 1);
  score = 0;

  //get high score from local storage
  var scoreStr = localStorage.getItem(saveKeyScore);
  if(scoreStr == null){
    bestScore = 0;
  }else{
    bestScore = parseInt(scoreStr);
  }


  //game object
  return {
    invaders: getInvaders(),
    shoots: [],
    ship: [canvas.width / 2 - shipSizeY / 2, shipY],
    moveSide: moveSide * FPS,
    moveDown: moveDown * FPS,
    dxInvaders: moveInvaders,
    reloaded: true,
    reloadedTime: reloadedTime * FPS,
    dyLaser: laserSpeed,
    laserNum: 0,
    laserSizeX: laserSizeX,
    laserSizeY: laserSizeY,
    lose: false,
  };
}

//gets the intial list of invaders
function getInvaders() {
  var invaders = [];

  for(var x = 0; x < cols; x++){
    for(var y = 0; y < rows; y++){
      var xc = (canvas.width - cols * (invadersSize + invadersSize /2)) / 2;
      var yc = invadersSize * 2;
      invaders.push([xc + x * (invadersSize + invadersSize / 2), yc + y * (invadersSize + invadersSize / 2)]);
    }
  }

  return invaders;
}

//draws everything
function draw() {
  //makes the screen black
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //draws the invaders
  ctx.fillStyle = "red";
  game.invaders.forEach(function(invader){
    ctx.fillRect(invader[0], invader[1], invadersSize, invadersSize);
  });

  //draws the ship
  ctx.fillStyle = "white";
  ctx.fillRect(game.ship[0], game.ship[1], shipSizeX, shipSizeY);

  //draws the lasers
  ctx.fillStyle = "white";
  game.shoots.forEach(function(laser){
    ctx.fillRect(laser.x, laser.y, game.laserSizeX, game.laserSizeY);
  });
}

//administrates everything of the lasers
function laserAdmin() {
  //moves the laser if necessary
  if(game.shoots.length > 0){
    game.shoots.forEach(function(laser){
      laser.y -= game.dyLaser;
    });
  }

  //makes the interval of time between each shoot
  if(!game.reloaded){
    game.reloadedTime--;

    if(game.reloadedTime <= 0){
      game.reloaded = true;
      game.reloadedTime = reloadedTime * FPS;
    }
  }

  //delates the laser after gets out of screen
  game.shoots.forEach(function(laser){
    if(laser.y < -game.laserSizeY){
      game.shoots.splice(0, 1);
      game.laserNum--;
    }
  });

  //checks if invaders needed to be destroyed
  destroyInvader();
}

//check if you win or lose
function checkLose() {
  for(var i = 0; i < game.invaders.length; i++){
    if(game.invaders[i][1] > game.ship[1]){
      return true;
    }
  }

  return false;
}

//gets each new level
function newLevel() {
  game.invaders = getInvaders();
  if(moveSide > 0.2){
    moveSide -= 0.1;
  }
  if(moveDown > 1){
    moveDown -= 0.2;
  }

  level++;
  textAlpha = 1;
  text = "Level " + (level + 1);
  score += newlevelPts;
}

//destroys the invader and laser and check for points
function destroyInvader() {
  var laserLength = game.shoots.length;
  for(var l = laserLength - 1; l >= 0; l--){
    var invaderLength = game.invaders.length;
    for(var i = invaderLength - 1; i >= 0; i--){
      if(game.shoots[l].x + game.laserSizeX > game.invaders[i][0] && game.shoots[l].x < game.invaders[i][0] + invadersSize && game.shoots[l].y + game.laserSizeY > game.invaders[i][1] && game.shoots[l].y < game.invaders[i][1] + invadersSize ){
        //si laser toca invader borra laser invader y pone puntos
        game.invaders.splice(i, 1);
        game.shoots.splice(l, 1);
        game.laserNum--;
        score += invaderPts;
        break;
      }
    }
  }
}



















var game = newGame();
var textAlpha, text, level, score, bestScore;

//main fun
function update() {
  //moves invaders to side or down
  game.moveSide--;
  if(game.moveSide <= 0){//moves to the side
    game.invaders.forEach(function(invader){
      invader[0] += game.dxInvaders;
    });

    game.dxInvaders *= -1;
    game.moveSide = moveSide * FPS;
  }

  game.moveDown--;
  if(game.moveDown <= 0){//moves down
    game.invaders.forEach(function(invader){
      invader[1] += moveInvaders;
    });

    game.moveDown = moveDown * FPS;
  }

  //checks everything about the lasers
  laserAdmin();

  //update score
  if(score > bestScore){
    bestScore = score;
    localStorage.setItem(saveKeyScore, bestScore);
  }

  //draw the score
  document.querySelector(".score").innerText = 'Score: ' + score;

  //draw the high score
  document.querySelector(".bestScore").innerText = 'Best Score: ' + bestScore;

  //draws the screen
  draw();

  //check level
  if(game.invaders.length == 0){
    newLevel();
  }

  //check if you win or lose
  if(checkLose() && !game.lose){
    textAlpha = 1;
    text = "You Lose"
    game.lose = true;
  }

  //writes the text on screen for lose and level
  if(textAlpha >= 0){
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 255, 255," + textAlpha + ")";
    ctx.font = "small-caps " + textSize + "px dejavu sans mono";
    ctx.fillText(text, canvas.width / 2, canvas.height * 0.5);
    textAlpha -= 1.0 / (textFadeTime * FPS);
  }else if (game.lose) {
    game = newGame();
  }
}
