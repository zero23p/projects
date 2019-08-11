const FPS = 10; //frames per second
const paddleWidth = 30; //width of paddle in px
const paddleHeight = 100; //height of paddle in px
const border = 20; //border from the right and left in px for the paddles
const movePaddle = 20; //distnace moved of paddle in px
const ballSize = 40; //size of ball
const scoreA_div = document.getElementsByClassName('scoreA');//score of player A
const scoreB_div = document.getElementsByClassName('scoreB');//score of player B
const soundOn = false; //activates or desactivates sound
const textSize = 30; //size of text
const textFadeTime = 2; //time of apparition of text in seconds
const powerSize = 80; //size of the power
const dx = 9; //dist travelled for x axis of ball
const dy = 9; //dist travelled  for y axis of ball

var scoreA = 0;//score of player A
var scoreB = 0;//score of player B
var fxbounce = new Sound("bounce.m4a", 5, 0.7); //the sound of bounding

var text, textAlpha;

//canvas
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

//paddles and ball
var paddleA = createPaddle(border, canvas.height / 2 - paddleHeight / 2);
var paddleB = createPaddle(canvas.width - border - paddleWidth, canvas.height / 2 - paddleHeight / 2);
var balls = [createBall()];
var power = createPower();

//loop
setInterval(update, 1000/FPS);

//set up event handlers
document.addEventListener("keydown", keyDown);

//create paddle
function createPaddle(x, y) {
  return {
    x: x,
    y: y,
    width: paddleWidth,
    height: paddleHeight,
    dy: movePaddle,
    activated: false,
    powerNum: 0,
    powerDur: 0,
    powerTime: (Math.random() * 20 + 10) * FPS,

  }
}

//create the ball
function createBall() {
  return {
    x: canvas.width / 2 - ballSize / 2,
    y: canvas.height / 2 - ballSize / 2,
    dx: dx,
    dy: dy,
    ballSize: ballSize,
    erratic: false,
    erraticDur: 0,
  }
}

//creates the power
function createPower() {
  return {
    x: (canvas.width * 0.25) + (Math.random() * canvas.width * 0.5),
    y: (canvas.height * 0.25) + (Math.random() * canvas.height * 0.5),
    draws: false,
    powerActivated: false,
    powerNum: 0,
    powerDur: 0,
    powerTime: Math.ceil(Math.random() * 20) + 10,
  }
}

//activates when key is down
function keyDown(/** @type {KeyboardEvent} */ ev) {
  switch(ev.keyCode){
    case 69://E key (up for paddle A)
      movePiece(paddleA, -paddleA.dy);
      break;
    case 68://d key (down for paddle A)
      movePiece(paddleA, paddleA.dy);
      break;
    case 38://up arrow paddle B
      movePiece(paddleB, -paddleB.dy);
      break;
    case 40://down arrow paddle B
      movePiece(paddleB, paddleB.dy);
      break;
  }
}

//moves the paddle
function movePiece(paddle, dist) {
  paddle.y += dist;

  if(paddle.y < 0){
    paddle.y -= dist;
  } else if (paddle.y > canvas.height - paddle.height) {
    paddle.y -= dist;
  }
}

//function that puts the sound
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

//checks who is the winner and returns a winner if there is one
function checkWin() {
  if(scoreA >= 3){
    scoreA = 0;
    scoreB = 0;
    text = "player A wins!"
    textAlpha = 1.0;
  }else if (scoreB >= 3) {
    scoreA = 0;
    scoreB = 0;
    text = "player B wins!";
    textAlpha = 1.0;
  }
}

//administrates the power
function powerAdmin(){
  //power of ball
  power.powerTime--;
  //checks if it's time to activate power
  if(power.powerTime <= 0){
    power.draws = true;
    power.powerTime = 10000000000000;
  }

  for(var i = 0; i < balls.length; i++){
    //draws and checks the power collision
    if(power.draws){
      //draws
      ctx.fillStyle = "white";
      ctx.fillRect(power.x, power.y, powerSize, powerSize);

      //collision
      if(balls[i].x < power.x + powerSize && balls[i].x + balls[i].ballSize > power.x && balls[i].y < power.y + powerSize && balls[i].y + balls[i].ballSize > power.y){
        power.powerNum = Math.ceil(Math.random() * 5);
        power.powerActivated = true;
        power.draws = false;
        power.powerDur = 10 * FPS;
      }
    }

    //uses power for every ball
    powersBall(balls[i]);
  }

  //power of paddle
  paddlePowers();
}

//powers of the paddles
function paddlePowers() {
  //power time left until activated
  paddleA.powerTime--;
  paddleB.powerTime--;

  //check if act power
  if(paddleA.powerTime <=0){
    paddleA.powerTime = 10000000000000;
    paddleA.activated = true;
    paddleA.powerNum = Math.ceil(Math.random() * 4);
    paddleA.powerDur = 10 * FPS;
  }

  if(paddleB.powerTime <=0){
    paddleB.powerTime = 10000000000000;
    paddleB.activated = true;
    paddleB.powerNum = Math.ceil(Math.random() * 4);
    paddleB.powerDur = 10 * FPS;
  }

  //activates power
  if(paddleA.activated){//check for paddle A
    if(paddleA.powerNum == 1){//big paddle
      paddleA.width *= 2;
      paddleA.height *= 2;
    }

    if(paddleA.powerNum == 2){//small paddle
      paddleA.width /= 2;
      paddleA.height /= 2;
    }

    if(paddleA.powerNum == 3){//fast paddle
      paddleA.dy *= 2;
    }

    if(paddleA.powerNum == 4){//slow paddle
      paddleA.dy /= 2;
    }

    paddleA.activated = false;
  }

  if(paddleB.activated){//check for paddle B
    if(paddleB.powerNum == 1){//big paddle
      paddleB.x -= paddleB.width;
      paddleB.width *= 2;
      paddleB.height *= 2;
    }

    if(paddleB.powerNum == 2){//small paddle
      paddleB.width /= 2;
      paddleB.height /= 2;
      paddleB.x += paddleB.width;
    }

    if(paddleB.powerNum == 3){//fast paddle
      paddleB.dy *= 2;
    }

    if(paddleB.powerNum == 4){//slow paddle
      paddleB.dy /= 2;
    }

    paddleB.activated = false;
  }

  //desactivates power
  if(paddleA.powerDur > 0){//stops for paddle A
    paddleA.powerDur--;

    if(paddleA.powerDur == 0){
      if(paddleA.powerNum == 1){//removes big
        paddleA.width /= 2;
        paddleA.height /= 2;
      }

      if(paddleA.powerNum == 2){//removes small
        paddleA.width *= 2;
        paddleA.height *= 2;
      }

      if(paddleA.powerNum == 3){//removes fast
        paddleA.dy /= 2;
      }

      if(paddleA.powerNum == 4){//removes slow
        paddleA.dy *= 2;
      }

      paddleA.powerTime = (Math.random() * 20 + 10) * FPS;
    }
  }

  if(paddleB.powerDur > 0){//stops for paddle B
    paddleB.powerDur--;

    if(paddleB.powerDur == 0){
      if(paddleB.powerNum == 1){//removes big
        paddleB.width /= 2;
        paddleB.height /= 2;
        paddleB.x += paddleB.width;
      }

      if(paddleB.powerNum == 2){//removes small
        paddleB.x -= paddleB.width;
        paddleB.width *= 2;
        paddleB.height *= 2;
      }

      if(paddleB.powerNum == 3){//removes fast
        paddleB.dy /= 2;
      }

      if(paddleB.powerNum == 4){//removes slow
        paddleB.dy *= 2;
      }

      paddleB.powerTime = (Math.random() * 20 + 10) * FPS;
    }
  }
}

//all the powers of balls
function powersBall(ball) {
  //power activation
  if(power.powerActivated){//power is activatted
    if(power.powerNum == 1){//little ball
      ball.ballSize /= 2;
    }

    if(power.powerNum == 2){//big ball
      ball.ballSize *= 2;
    }

    if(power.powerNum == 3){//rapid ball
      ball.dx *= 2;
      ball.dy *= 2;
    }

    if(power.powerNum == 4){//creates extra balls
      var ballNum = Math.ceil(Math.random()*3);
      for(var i = 0; i < ballNum; i++){
        balls.push(createBall());
        if(i % 2 == 0){
          balls[i].dx *= -1;
        }
      }
      power.powerDur *= balls.length;
    }

    if(power.powerNum == 5){//activates erratic mouvement
      power.erratic = true;
      power.erraticDur = 0.5 * FPS;
    }

    power.powerActivated = false;
  }

  //checks to stop the power
  if(power.powerDur > 0) {
    power.powerDur--;

    if(power.powerDur == 0){
      if(power.powerNum == 1){//little ball becomes normal
        ball.ballSize *= 2;
      }

      if(power.powerNum == 2){//big ball becomes normal
        ball.ballSize /= 2;
      }

      if(power.powerNum == 3){//rapid ball becomes normal
        ball.dx /= 2;
        ball.dy /= 2;
      }

      if(power.powerNum == 4){//removes extra balls
        var ballsNum = balls.length;
        for(var i = ballsNum - 1; i > 0; i--){
          balls.splice(i, 1);
        }
      }

      if(power.powerNum == 5){//removes the erratic
        power.erratic = false;
      }

      power.powerTime = (Math.random() * 20 + 10) * FPS;
      power.x = (canvas.width * 0.25) + (Math.random() * canvas.width * 0.5);
      power.y = (canvas.height * 0.25) + (Math.random() * canvas.height * 0.5);
    }
  }
}

function paddleBallBorders() {
  for(var i = 0; i < balls.length; i++){
    //draws the balls
    ctx.fillRect(balls[i].x, balls[i].y, balls[i].ballSize, balls[i].ballSize);

    //move ball
    if(!power.erratic){
      balls[i].x += balls[i].dx;
      balls[i].y += balls[i].dy;
    } else {
      balls[i].x += balls[i].dx * (Math.random() > 0.5 ? -1 : 1);
      balls[i].y += balls[i].dy * (Math.random() > 0.5 ? -1 : 1);
    }


    //check borders of ball
    if(balls[i].x < 0){//one point for paddle B
      balls[i].x = canvas.width / 2 - balls[i].ballSize / 2;
      balls[i].y = canvas.height / 2 - balls[i].ballSize / 2;
      balls[i].dx *= -1;
      scoreB++;

      scoreB_div[0].classList.add('green-back');
      setTimeout( () => scoreB_div[0].classList.remove('green-back'), 300);
    }
    if(balls[i].x > canvas.width - balls[i].ballSize){//one point for paddle A
      balls[i].x = canvas.width / 2 - balls[i].ballSize / 2;
      balls[i].y = canvas.height / 2 - balls[i].ballSize / 2;
      balls[i].dx *= -1;
      scoreA++;

      scoreA_div[0].classList.add('green-back');
      setTimeout( () => scoreA_div[0].classList.remove('green-back'), 300);
    }

    if(balls[i].y < 0){//up border
      balls[i].dy *= -1;
      fxbounce.play();
    }
    if(balls[i].y > canvas.height - balls[i].ballSize){//down border
      balls[i].dy *= -1;
      fxbounce.play();
    }

    //paddle collisions with the ball
    if(balls[i].x < paddleA.x + paddleA.width && balls[i].x > paddleA.x + paddleA.width / 2 && balls[i].y < paddleA.y + paddleA.height && balls[i].y + balls[i].ballSize > paddleA.y){
      //ball touchs paddle A
      balls[i].x = paddleA.x + paddleA.width;
      balls[i].dx *= -1;
      fxbounce.play();
    }
    if(balls[i].x + balls[i].ballSize > paddleB.x && balls[i].x + balls[i].ballSize < paddleB.x + paddleB.width / 2 && balls[i].y < paddleB.y + paddleB.height && balls[i].y + balls[i].ballSize > paddleB.y){
      //ball touchs paddle B
      balls[i].x = paddleB.x - balls[i].ballSize;
      balls[i].dx *= -1;
      fxbounce.play();
    }

    //paddle bad collision with ball
    if(balls[i].x < paddleA.x + paddleA.width / 2 && balls[i].x + balls[i].ballSize > paddleA.x && balls[i].y < paddleA.y + paddleA.height && balls[i].y + balls[i].ballSize > paddleA.y){
      //ball touches paddle A but bad
      balls[i].dy *= -1;
      fxbounce.play();
    }
    if(balls[i].x + balls[i].ballSize > paddleB.x + paddleB.width / 2 && balls[i].x < paddleB.x + paddleB.width && balls[i].y < paddleB.y + paddleB.height && balls[i].y + balls[i].ballSize > paddleB.y){
      //ball touchs paddle B but bad
      balls[i].dy *= -1;
      fxbounce.play();
    }
  }
}
























//main function
function update() {
  //puts everything in black
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //draw the paddles
  ctx.fillStyle = "white";
  ctx.fillRect(paddleA.x, paddleA.y, paddleA.width, paddleA.height);
  ctx.fillRect(paddleB.x, paddleB.y, paddleB.width, paddleB.height);

  //iterates throught the balls and checks all the borders and draw the balls
  paddleBallBorders();

  //scores on screen
  scoreA_div[0].innerHTML = "player A: " + scoreA;
  scoreB_div[0].innerHTML = "player B: " + scoreB;

  //check winner and draws the text
  checkWin();

  if(textAlpha >= 0){
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 255, 255," + textAlpha + ")";
    ctx.font = "small-caps " + textSize + "px dejavu sans mono";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    textAlpha -= 1.0 / (textFadeTime * FPS);
  }

  //powers
  powerAdmin();
}
