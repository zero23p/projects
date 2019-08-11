//canvas
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

//constants
const FPS = 10; //frames per second
const rows = 5; //num of rows of invaders
const cols = 10; //num of cols of invaders

const textSize = 40; //size of text
const textFadeTime = 2.5; //time that text is on screen in sec

const invadersRadius = 15; //size of invaders in pixels
const showBounding = false; //shows or not the hit box

const moveSide = 1; //time needed to move to side in sec
const moveDown = 3.5; //time needed to move down in sec

const shipSize = 20; //width of ship in pixels
const shipSpeed = 10; //pixels per tab

const shootSize = 5; //size of shoot in pixels
const laserSpeed = 10; //pixels per tick
const laserMax = 7; //max number of lasers at the same time
const reload = 0.5; //time needed to wait for next shoot in sec

const saveKeyScore = "bestScoreInvadersBonito"; //save key for the best score
const invaderPts = 50; //number of points per invader destroyed
const bossPoints = 2500;//points of boss
const newlevelPts = 2500; //points for level

const specialLaser = 10; //time needed to pass to charge pwr
const chargeHeight = 25; //epaisseur de la charge bar
const chargeY = canvas.width - chargeHeight; //y pos of charge bar
//interval
setInterval(update, 1000/FPS);

//activates when key is touched
document.addEventListener("keydown", keyDown);

function keyDown(/** @type {KeyboardEvent} */ ev) {
  switch (ev.keyCode) {
    case 37://left arrow
      ship.x -= shipSpeed;
      if(ship.x - ship.r < 0){
        ship.x += shipSpeed;
      }
      break;
    case 39: //right arrow
      ship.x += shipSpeed;
      if(ship.x + ship.r > canvas.width){
        ship.x -= shipSpeed;
      }
      break;
    case 32: //space bar laser
      if(ship.reloaded && ship.laserNum < laserMax && !ship.specialLaser){
        ship.shoots.push({x: ship.x, y: ship.y - ship.r, r: shootSize, dy: laserSpeed, power: 1});
        ship.reloaded = false;
        ship.laserNum++;
      }
      if(ship.reloaded && ship.laserNum < laserMax && ship.specialLaser){
        ship.shoots.push({x: ship.x, y: ship.y - ship.r, r: shootSize, dy: laserSpeed, power: 3});
        ship.reloaded = false;
        ship.laserNum++;
        ship.specialLaser = false;
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

  invaders = getInvaders();
  ship = getShip();

  //get high score from local storage
  var scoreStr = localStorage.getItem(saveKeyScore);
  if(scoreStr == null){
    bestScore = 0;
  }else{
    bestScore = parseInt(scoreStr);
  }

  //game object
  return {
    moveSide: moveSide * FPS,
    moveDown: moveDown * FPS,
    lose: false,
  }
}

//gets the intial list of invaders
function getInvaders() {
  var invaders = [];

  if(level != 4 && level != 9){//normal invaders
    for(var x = 0; x < cols; x++){
      for(var y = 0; y < rows; y++){
        var xc = (canvas.width - cols * (invadersRadius*3)) / 2;
        var yc = invadersRadius * 4;
        invaders.push({x: xc  + invadersRadius + x * (invadersRadius*3), y: yc + invadersRadius + y * invadersRadius * 3, r: invadersRadius, dx: invadersRadius, dy: invadersRadius, lives: 1, boss: false});
      }
    }
  }

  if(level == 4 || level == 9){//boss of level 5
    invaders.push({x: canvas.width / 3, y: canvas.height / 3,r: invadersRadius * 5, dx: invadersRadius * 11, dy: invadersRadius * 3,lives: 20, boss: true,});
  }

  return invaders;
}

//initial state of the ship
function getShip() {
  return ship = {
    x: canvas.width / 2,
    y: canvas.height * 0.90,
    r: 1.5 * shipSize,
    shoots: [],
    reloaded: true,
    laserNum: 0,
    reloadedTime: reload * FPS,
    laserBig: specialLaser * FPS,
    specialPx: 0,
    specialLaser: false,
  };
}

//draws everything on the screen
function draw() {
  //makes the screen black
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //draws the invaders
  ctx.fillStyle = "red";
  invaders.forEach(function(invader){
    ctx.beginPath();
    ctx.arc(invader.x, invader.y, invader.r / 2, Math.PI, Math.PI * 2, false);
    ctx.fill();

    ctx.fillRect(invader.x - invader.r, invader.y, invader.r * 2, invader.r - 5);

    if(showBounding){
      ctx.strokeStyle = "lime";
      ctx.beginPath();
      ctx.arc(invader.x, invader.y, invader.r, 0, Math.PI * 2, false);
      ctx.stroke();
    }
  });

  //draws the ship
  ctx.fillStyle = "white";
  ctx.fillRect(ship.x - shipSize / 2, ship.y - shipSize, shipSize, shipSize * 2);
  ctx.fillRect(ship.x - 0.7 * shipSize, ship.y + 0.125 * shipSize, 0.2 * shipSize, shipSize * 1.25);
  ctx.fillRect(ship.x + 0.5 * shipSize, ship.y + 0.125 * shipSize, 0.2 * shipSize, shipSize * 1.25);

  ctx.beginPath();
  ctx.moveTo(ship.x - shipSize / 2, ship.y - shipSize);
  ctx.lineTo(ship.x, ship.y - 1.5 * shipSize);
  ctx.lineTo(ship.x + shipSize / 2, ship.y - shipSize);
  ctx.closePath();
  ctx.fill();

  if(showBounding){
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  //draws the lasers
  ship.shoots.forEach(function(laser){
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(laser.x, laser.y, laser.r, 0, Math.PI * 2, false);
    ctx.fill();
  });
}

//moves the invaders
function moveInvaders() {
  game.moveSide--;
  if(game.moveSide <= 0){
    invaders.forEach(function(invader){
      invader.x += invader.dx;
      invader.dx *= -1
    });

    game.moveSide = moveSide * FPS;
  }

  game.moveDown--;
  if(game.moveDown <= 0){
    invaders.forEach(function(invader){
      invader.y += invader.dy;
    });

    game.moveDown = moveDown * FPS;
  }
}

//admin everything about lasers
function adminLasers() {
  //moves the laser if necessary
  if(ship.shoots.length > 0){
    ship.shoots.forEach(function(laser){
      laser.y -= laser.dy;
    });
  }

  //makes the interval of time between each shoot
  if(!ship.reloaded){
    ship.reloadedTime--;

    if(ship.reloadedTime <= 0){
      ship.reloaded = true;
      ship.reloadedTime = reload * FPS;
    }
  }

  //delates the laser after gets out of screen
  ship.shoots.forEach(function(laser){
    if(laser.y < laser.r){
      ship.shoots.splice(0, 1);
      ship.laserNum--;
    }
  });

  //delete laser if touched invader and also deletes invader
  var laserLength = ship.shoots.length;
  for(var l = laserLength - 1; l >= 0; l--){
    var invaderLength = invaders.length;
    for(var i = invaderLength - 1; i >= 0; i--){
      if(pytha(ship.shoots[l].x, ship.shoots[l].y, invaders[i].x, invaders[i].y) < invaders[i].r + ship.shoots[l].r){
        //laser toca invader
        invaders[i].lives--;//quita vida a invader
        ship.shoots[l].power--;//quita 1 de power

        if(ship.shoots[l].power <= 0){//destruye laser si power <= 0
          ship.shoots.splice(l, 1);
          ship.laserNum--;
        }

        if(invaders[i].lives <= 0){//si laser toca invader y tiene 0 vida: borra invader y pone puntos
          invaders[i].boss ? score += bossPoints : score += invaderPts;
          invaders.splice(i, 1);
          break;
        }
      }
    }
  }
}

//check if you lose
function checkLose(){
  for(var i = 0; i < invaders.length; i++){
    if(pytha(invaders[i].x, invaders[i].y, ship.x, ship.y) < ship.r + invaders[i].r){
      return true;
    }
  }

  return false;
}

//pythagore
function pytha(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2-y1,2))
}

//gets each new level
function newLevel() {
  level++;
  textAlpha = 1;
  text = "Level " + (level + 1);
  score += newlevelPts;

  invaders = getInvaders();
  if(game.moveSide > 0.2 * FPS){
    game.moveSide -= 0.1 * FPS;
  }
  if(game.moveDown > 1 * FPS){
    game.moveDown -= 0.2 * FPS;
  }
}

//update the score
function updateScore() {
  if(score > bestScore){
    bestScore = score;
    localStorage.setItem(saveKeyScore, bestScore);
  }

  //draw the score
  document.querySelector(".score").innerText = 'Score: ' + score;

  //draw the high score
  document.querySelector(".bestScore").innerText = 'Best Score: ' + bestScore;
}















var invaders, ship, game, level, score, bestScore, text, textAlpha;
game = newGame();

//main function
function update() {
  //moves the invaders
  moveInvaders();

  //admin the lasers
  adminLasers();

  //update score
  updateScore();

  //check level
  if(invaders.length == 0){
    newLevel();
  }

  //draws the screen
  draw();

  //draws charge bar
  if(!ship.specialLaser){
    var e = (canvas.width * 0.75) / ship.laserBig;
    ship.specialPx += e;
    ctx.fillStyle = "blue";
    ctx.fillRect(canvas.width * 0.25, chargeY, ship.specialPx, chargeHeight);

    if(ship.specialPx >= canvas.width * 0.5){
      ship.specialPx = 0;
      ship.specialLaser = true;
    }
  }

  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.25, chargeY);
  ctx.lineTo(canvas.width * 0.75, chargeY);
  ctx.lineTo(canvas.width * 0.75, chargeY + chargeHeight);
  ctx.lineTo(canvas.width * 0.25, chargeY + chargeHeight);
  ctx.closePath();
  ctx.stroke();

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
