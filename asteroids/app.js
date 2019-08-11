const FPS = 30;
const shipSize = 30;
const turnSpeed = 360; //turn speed in degrees per second
const shipThrust = 5; //acceleration of the ship in pixels per second^2
const friction = 0.7; //friction coeff of space (0 = none 1 = lots of friction)

const roidsNum = 3; //starting number of asteroids
const roidsSpd = 50; //max starting spped in pixel per seconds
const roidsSize = 100;
const roidsVert = 10; //average number of vertices
const roidsJag = 0.5; //jaggedness of the asteroids
const roidPtsLge = 20 //points for a large asteroid
const roidPtsMed = 50 //points for a medium asteroid
const roidPtsSml = 100 //points for a small asteroid

const showCentreDot = false; //show or hide ship's centre
const showBounding = false; //show or hide collision bounding

const shipExplodeDur = 0.3; //duration of the ships explosion
const shipInvDur = 3; //duration of invesibility in seconds
const shipBlinkDur = 0.1; //duration of the ship blink during invensibility in seconds

const laserMax =  10; //max number of laser at screen at once
const laserSpeed = 500; //speed of laser in pixels per second
const laserDist = 0.6; //max dist laser can travel of fraction of screen width
const laserExplodeDur = 0.1; //duration of the laser explosion in seconds

const textFadeTime = 2.5; //text fade time in seconds
const textSize = 40; //text font height in pixels

const gameLives = 3; //starting number of lives

const saveKeyScore = "highscore"; //save key for local storage of high score
const soundOn = true; // activates and desactivates all sound
const musicOn = true; //activates and desactivates music

//set up for the powers and timer
var stopPower = 10 * FPS; //after 10 sec stops the power
var specialDur = Math.random() * 30 + 5; // random time of the special obj appartion in seconds
var specialObj = [{x: 0, y: 0, exist: false, r: shipSize / 3}]; //special object

var time = 0;

//canvas
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext("2d");

//set up sound effects
var fxLaser = new Sound("sounds/laser.m4a", 5, 0.4);
var fxExplode = new Sound("sounds/explode.m4a");
var fxhit = new Sound("sounds/hit.m4a", 5);
var fxthrust = new Sound("sounds/thrust.m4a", 1, 0.4);

//set up the music
var music = new Music("sounds/music-low.m4a", "sounds/music-high.m4a");
var roidsLeft, roidsTotal;


//set up of the game parameters
var level, roids, ship, text, textAlpha, lives, score, scoreHigh;
newGame();

//game loop
setInterval(update, 1000/FPS);

//set up event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function keyDown(/** @type {KeyboardEvent} */ ev) {
  if(ship.dead){
    return;
  }

  switch(ev.keyCode){
    case 37://left arrow
      ship.rot = turnSpeed/180 * Math.PI / FPS;
      break;
    case 38://up arrow
      ship.thrusting = true;
      break;
    case 39://right arrow
      ship.rot = -turnSpeed/180 * Math.PI / FPS;
      break;
    case 32://laser space bar
      shootLaser();
      break;
  }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {
  if(ship.dead){
    return;
  }

  switch(ev.keyCode){
    case 37://left arrow stop rotating
      ship.rot = 0;
      break;
    case 38://up arrow stop
      ship.thrusting = false;
      break;
    case 39://right arrow stop
      ship.rot = 0;
      break;
    case 32://allow shoting
      ship.canShoot = true;
      break;
  }
}

//creates the asteroid belt
function createAsteroidBelt(){
  roids = [];
  roidsTotal = (roidsNum + level) * 7;
  roidsLeft = roidsTotal;
  var x, y;
  for(var i = 0; i < roidsNum + level; i++){
    do {
      x = Math.floor(Math.random() * canvas.width);
      y = Math.floor(Math.random() * canvas.height);
    } while (distBetweenPoints(ship.x, ship.y, x, y) < roidsSize * 2 + ship.r);
    roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 2)));
  }
}

//destroy the asteroid
function destroyAsteroid(index) {
  var x = roids[index].x;
  var y = roids[index].y;
  var r = roids[index].r;

  //split the asteroid in 2 if necessary
  if(r == Math.ceil(roidsSize / 2)){
    roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 4)));
    roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 4)));
    score += roidPtsLge;
  }else if(r == Math.ceil(roidsSize / 4)){
    roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 8)));
    roids.push(newAsteroid(x, y, Math.ceil(roidsSize / 8)));
    score += roidPtsMed;
  } else {
    score += roidPtsSml;
  }

  //check high score
  if(score > scoreHigh){
    scoreHigh = score;
    localStorage.setItem(saveKeyScore, scoreHigh);
  }

  //destroy the asteroid
  roids.splice(index, 1);
  fxhit.play();

  //calculate the ratio of asteroids to determine music tempo
  roidsLeft--;
  music.setAsteroidRatio(roidsLeft == 0 ? 1 : roidsLeft / roidsTotal);

  //new level when there are no more asteroid
  if(roids.length == 0){
    level++;
    newLevel();
  }
}

//checks the dist between two points pythagore
function distBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2-y1,2));
}

//add an asteroid to the belt
function newAsteroid(x, y, r) {
  var lvlMult = 1 + 0.1 * level;
  var roid = {
    x: x,
    y: y,
    xv: Math.random() * roidsSpd * lvlMult / FPS * (Math.random() < 0.5 ? 1:-1),
    yv: Math.random() * roidsSpd * lvlMult / FPS * (Math.random() < 0.5 ? 1:-1),
    r: r,
    a: Math.random() * Math.PI * 2,
    vert: Math.floor(Math.random() * (roidsVert + 1) + roidsVert / 2),
    offs: []
  };

  //create the offset array
  for(var i = 0; i < roid.vert; i++){
    roid.offs.push(Math.random() * roidsJag * 2 + 1 - roidsJag);
  }

  return roid;
}

//explodes the ship
function explodeShip() {
  ship.explodeTime = Math.ceil(shipExplodeDur * FPS);
  fxExplode.play();
}

//new ship method
function newShip() {
  return {
    x: canvas.width/2,
    y: canvas.height/2,
    r: shipSize/2,
    a: 90/180 * Math.PI,
    rot: 0,
    thrusting: false,
    thrust: {
      x:0,
      y:0
    },
    explodeTime: 0,
    blinkTime: Math.ceil(shipBlinkDur * FPS),
    blinkNum: Math.ceil(shipInvDur / shipBlinkDur),
    canShoot: true,
    lasers: [],
    dead: false,
    specialObj: false,
    objDur: specialDur * FPS,
    power: 0,
  };
}

//shoots the laser
function shootLaser() {
  //create the laser object
  if( ship.canShoot && ship.lasers.length < laserMax){
    ship.lasers.push({//from the nose of the ship
      x: ship.x + 4/3 * ship.r * Math.cos(ship.a),
      y: ship.y - 4/3 * ship.r * Math.sin(ship.a),
      xv: laserSpeed * Math.cos(ship.a) / FPS,
      yv: -laserSpeed * Math.sin(ship.a) / FPS,
      dist: 0,
      explodeTime: 0
    });
    fxLaser.play();
  }

  if(ship.power == 1){
    ship.lasers.push({//from the nose of the ship
      x: ship.x + 4/3 * ship.r * Math.cos(ship.a),
      y: ship.y - 4/3 * ship.r * Math.sin(ship.a),
      xv: (laserSpeed + 70) * Math.cos(ship.a) / FPS,
      yv: (-laserSpeed + 70) * Math.sin(ship.a) / FPS,
      dist: 0,
      explodeTime: 0
    });
    fxLaser.play();
  }

  //prevent further shooting
  ship.canShoot = false;
}

//creates the new game
function newGame() {
  level = 0;
  lives = gameLives;
  score = 0;
  ship = newShip();

  //get the high score from local storage
  var scoreStr = localStorage.getItem(saveKeyScore);
  if(scoreStr == null){
    scoreHigh = 0;
  }else{
    scoreHigh = parseInt(scoreStr);
  }

  newLevel();
}

//creates the new level (asteroid belt)
function newLevel() {
  text = "level " + (level + 1);
  textAlpha = 1.0;
  createAsteroidBelt();
}

//function draws the ship
function drawShip(x, y, a,colour = "white") {
  ctx.strokeStyle = colour;
  ctx.lineWidth = shipSize / 20;
  ctx.beginPath();
  ctx.moveTo(//nose
    x + 4/3 * ship.r * Math.cos(a),
    y - 4/3 * ship.r * Math.sin(a)
  );
  ctx.lineTo(//left side
    x - ship.r * (2/3 * Math.cos(a) + Math.sin(a)),
    y + ship.r * (2/3 * Math.sin(a) - Math.cos(a))
  );
  ctx.lineTo(//right side
    x - ship.r * (2/3 * Math.cos(a) - Math.sin(a)),
    y + ship.r * (2/3 * Math.sin(a) + Math.cos(a))
  );
  ctx.closePath();
  ctx.stroke();
}

//ends the game
function gameOver() {
  ship.dead = true;
  text = "Game Over";
  textAlpha = 1.0;
}

//function that manages the sound
function Sound(src, maxStreams = 1, vol = 1.0) {
  this.streamNum = 0;
  this.streams = [];
  for(var i = 0; i < maxStreams; i++){
    this.streams.push(new Audio(src));
    this.streams[i].volume = vol;
  }

  this.play = function() {
    if(soundOn){
      this.streamNum = (this.streamNum + 1) % maxStreams;
      this.streams[this.streamNum].play();
    }
  }

  this.stop = function() {
    this.streams[this.streamNum].pause();
    this.streams[this.streamNum].currentTime = 0;
  }
}

//creates the music of the game
function Music(srcLow, srcHigh) {
  this.soundLow = new Sound(srcLow);
  this.soundHigh = new Sound(srcHigh);
  this.low = true;
  this.tempo = 1.0; //seconds per beat
  this.beatTime = 0; //frames left until next beat

  this.play = function() {
    if(musicOn) {
      if(this.low){
        this.soundLow.play();
      } else {
        this.soundHigh.play();
      }
      this.low = !this.low;
    }
  }

  this.tic = function() {
    if(this.beatTime == 0){
      this.play();
      this.beatTime = Math.ceil(this.tempo * FPS);
    } else {
      this.beatTime--;
    }
  }

  this.setAsteroidRatio = function(ratio) {
    this.tempo = 1.0 - 0.75 * (1.0 - ratio);
  }
}















//updates the screen
function update() {
  var blinkOn = ship.blinkNum % 2 == 0;
  var exploding = ship.explodeTime > 0;

  //tic the music
  music.tic();

  //draw space
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  //thrust the ship
  if(ship.thrusting && !ship.dead){
    ship.thrust.x += shipThrust * Math.cos(ship.a) / FPS;
    ship.thrust.y -= shipThrust * Math.sin(ship.a) / FPS;
    fxthrust.play();

    //draw the thruster
    if(!exploding && blinkOn){
      ctx.fillStyle = "red";
      ctx.strokeStyle ="yellow";
      ctx.lineWidth = shipSize / 10;
      ctx.beginPath();
      ctx.moveTo(//rear left
        ship.x - ship.r * (2/3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * (2/3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
      );
      ctx.lineTo(//rear center behind the ship
        ship.x - ship.r * 6/3 * Math.cos(ship.a),
        ship.y + ship.r * 6/3 * Math.sin(ship.a)
      );
      ctx.lineTo(//right side
        ship.x - ship.r * (2/3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * (2/3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }else{
    //aply friction
    ship.thrust.x -= friction * ship.thrust.x / FPS;
    ship.thrust.y -= friction * ship.thrust.y / FPS;
    fxthrust.stop();
  }

  //draw ship
  if(!exploding){
    if(blinkOn && !ship.dead){
      drawShip(ship.x, ship.y, ship.a);
    }

    // handle blinking
    if(ship.blinkNum > 0){
      //reduce blink time
      ship.blinkTime--;

      //reduce blink number
      if(ship.blinkTime == 0){
        ship.blinkTime = Math.ceil(shipBlinkDur * FPS);
        ship.blinkNum--;
      }
    }
  } else {
    //draw explosion
    ctx.fillStyle = "darkred";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
    ctx.fill();
  }

  if(!exploding){
    //rotate ship
    ship.a += ship.rot;

    //move ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    //check all the asteroids collision with the ship
    if(ship.blinkNum == 0 && !ship.dead){
      for(var i = 0; i < roids.length; i++){

        //check for asteroid collisions using pythagore
        if(distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y)  < ship.r + roids[i].r){
          explodeShip();
          destroyAsteroid(i);
          break;
        }
      }
    }
  } else {
    //reduce the explode time
    ship.explodeTime--;

    //reset the ship after explosion is finished
    if(ship.explodeTime == 0){
      lives--;

      if(lives == 0){
        gameOver();
      } else {
        ship = newShip();
      }
    }
  }

  //handle edge of screen
  if(ship.x < 0 - ship.r){
    ship.x = canvas.width + ship.r;
  }else if(ship.x > canvas.width + ship.r){
    ship.x = 0-ship.r;
  }
  if(ship.y < 0 - ship.r){
    ship.y = canvas.height + ship.r;
  }else if(ship.y > canvas.height + ship.r){
    ship.y = 0-ship.r;
  }

  //centre dot
  if(showCentreDot){
    ctx.fillStyle = "red";
    ctx.fillRect(ship.x - 1, ship.y -1, 2, 2);
  }

  //the bounding of ship
  if(showBounding){
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  //draw the lasers
  for(var i = 0; i < ship.lasers.length; i++){
    if(ship.lasers[i].explodeTime == 0){
      ctx.fillStyle = "salmon";
      ctx.beginPath();
      ctx.arc(ship.lasers[i].x, ship.lasers[i].y, shipSize / 15, 0, Math.PI * 2, false);
      ctx.fill();
    } else {
      //draw the explosion
      ctx.fillStyle = "orangered";
      ctx.beginPath();
      ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.fillStyle = "salmon";
      ctx.beginPath();
      ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.fillStyle = "pink";
      ctx.beginPath();
      ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
      ctx.fill();
    }
  }

  //detec laser hit asteroids
  var ax, ay, ar, lx, ly;
  for(var i = roids.length - 1; i >= 0; i--){
    //grab the asteroid prop
    ax = roids[i].x;
    ay = roids[i].y;
    ar = roids[i].r;

    //loop over the lasers
    for(var j = ship.lasers.length - 1; j >= 0; j--){
      //grab laser prop
      lx = ship.lasers[j].x;
      ly = ship.lasers[j].y;

      //detect hit
      if(ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar){
        //destroy the asteroid and activate the laser explosion
        ship.lasers[j].explodeTime = Math.ceil(laserExplodeDur * FPS);
        destroyAsteroid(i);

        break;
      }
    }
  }

  //move the lasers
  for(var i = ship.lasers.length - 1; i >= 0; i--){
    //check dist travelled
    if(ship.lasers[i].dist > laserDist * canvas.width){
      ship.lasers.splice(i, 1);
      continue;
    }

    //handle the explosion
    if(ship.lasers[i].explodeTime > 0){
      ship.lasers[i].explodeTime--;

      //destroy the laser after the dur is up
      if(ship.lasers[i].explodeTime == 0){
        ship.lasers.splice(i, 1);
        continue;
      }
    } else {
      //move the laser
      ship.lasers[i].x += ship.lasers[i].xv;
      ship.lasers[i].y += ship.lasers[i].yv;

      //calculate the dist traveled
      ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
    }

    //handle edge of screen
    if(ship.lasers[i].x < 0){
      ship.lasers[i].x = canvas.width;
    }else if(ship.lasers[i].x > canvas.width){
      ship.lasers[i].x = 0;
    }
    if(ship.lasers[i].y < 0){
      ship.lasers[i].y = canvas.height;
    }else if(ship.lasers[i].y > canvas.height){
      ship.lasers[i].y = 0;
    }
  }

  //draw the asteroids
  var x, y, r, a, vert, offs;
  for(var i = 0; i < roids.length; i++){
    ctx.strokeStyle = "slategrey";
    ctx.lineWidth = shipSize / 20;

    //get the asteroids prop
    x = roids[i].x;
    y = roids[i].y;
    r = roids[i].r;
    a = roids[i].a;
    vert = roids[i].vert;
    offs = roids[i].offs;

    //draw a path
    ctx.beginPath();
    ctx.moveTo(
      x + r * offs[0] * Math.cos(a),
      y + r * offs[0] * Math.sin(a)
    )

    //draw the polygon
    for(var j = 1; j < vert; j++){
      ctx.lineTo(
        x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
        y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
      );
    }
    ctx.closePath();
    ctx.stroke();

    //move the asteroid
    roids[i].x += roids[i].xv;
    roids[i].y += roids[i].yv;

    //handle edge of screen
    if(roids[i].x < 0 - roids[i].r){
      roids[i].x = canvas.width + roids[i].r;
    }else if(roids[i].x > canvas.width + roids[i].r){
      roids[i].x = 0 - roids[i].r
    }
    if(roids[i].y < 0 - roids[i].r){
      roids[i].y = canvas.height + roids[i].r;
    }else if(roids[i].y > canvas.height + roids[i].r){
      roids[i].y = 0 - roids[i].r
    }

    //asteroid bounding
    if(showBounding){
      ctx.strokeStyle = "lime";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, false);
      ctx.stroke();
    }
  }

  //draws the text
  if(textAlpha >= 0){
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 255, 255," + textAlpha + ")";
    ctx.font = "small-caps " + textSize + "px dejavu sans mono";
    ctx.fillText(text, canvas.width / 2, canvas.height * 0.75);
    textAlpha -= 1.0 / (textFadeTime * FPS);
  } else if(ship.dead){
    newGame();
  }

  //draw the lives
  for(var i = 0; i < lives; i++){
    var lifeColour;
    lifeColour = exploding && i == lives - 1 ? "red" : "white";
    drawShip(shipSize + i * shipSize * 1.2, shipSize, 0.5 * Math.PI, lifeColour);
  }

  //draw the score
  document.querySelector(".score").innerText = 'score: ' + score;


  //draw the high score
  document.querySelector(".maxScore").innerText = 'Best score: ' + scoreHigh;

  //special object
  ship.objDur--;
  if(ship.objDur <= 0){ //activates creation of the power after the dur is achivied
    ship.specialObj = true;
    ship.objDur = 10000000000000;
    stopPower = 10 * FPS;
  }

  if(ship.specialObj){ //creates the power to touch
    specialObj.splice(0, 1);
    specialObj.push({x: Math.random() * canvas.width, y: Math.random() * canvas.height, exist: true, r: shipSize / 3});
    ship.specialObj = false;
  }

  if(specialObj[0].exist){ //draws the power an check if touched
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(specialObj[0].x, specialObj[0].y, specialObj[0].r, 0, Math.PI * 2, false);
    ctx.fill();

    //check if touched and activates power
    if(distBetweenPoints(ship.x, ship.y, specialObj[0].x, specialObj[0].y) < ship.r + specialObj[0].r){
      specialObj.splice(0, 1);
      specialObj.push({x: 0, y: 0, exist: false, r: shipSize / 3});
      ship.power = Math.random() < 0.8 ? 1 : 2;
    }
  }

  //if its power 2 gives an extra live an then stops
  if(ship.power == 2){
    lives++;

    specialDur = Math.random() * 30 + 5;
    ship.specialObj = false;
    ship.objDur = specialDur * FPS;
    ship.power = 0;
  }

  //checks to stop power 1
  if(ship.power > 0){
    stopPower--;

    if(stopPower <= 0){
      specialDur = Math.random() * 30 + 5;
      ship.specialObj = false;
      ship.objDur = specialDur * FPS;
      ship.power = 0;
    }
  }

  //put time on screen
  time++;
  document.getElementById('time').innerHTML = "timer: " + Math.floor(time / FPS);
}
