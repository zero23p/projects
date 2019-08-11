//constants
let origBoard;
let huPlayer ='O';
let aiPlayer = 'X';
let huScore = 0;
let aiScore = 0;

const huScore_sp = document.getElementById('player1Score');
const aiScore_sp = document.getElementById('player2Score');

const winCombos =[
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 4, 8],
  [6, 4, 2],
  [2, 5, 8],
  [1, 4, 7],
  [0, 3, 6]
];

const cells = document.querySelectorAll('.cell');
startGame();

//func which tells you to chose x or o and put event listeners to the rows
function selectSym(sym){
  huPlayer = sym;
  aiPlayer = sym==='O' ? 'X' :'O';
  origBoard = Array.from(Array(9).keys());
  for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener('click', turnClick, false);
  };
  if (aiPlayer === 'X') {
    turn(bestSpot(),aiPlayer);
  };
  document.querySelector('.selectSym').style.display = "none";
}

//starts the game and restart the game
function startGame() {
  document.querySelector('.endgame').style.display = "none";
  document.querySelector('.endgame .text').innerText ="";
  document.querySelector('.selectSym').style.display = "block";
  for (let i = 0; i < cells.length; i++) {
    cells[i].innerText = '';
    cells[i].style.removeProperty('background-color');
  }
}

//activates when the player chose where to put his mark
function turnClick(square) {
  if (typeof origBoard[square.target.id] ==='number') {
    turn(square.target.id, huPlayer);
    if (!checkWin(origBoard, huPlayer) && !checkTie()){
      turn(bestSpot(), aiPlayer);
    };
  };
}

//puts the piece on the page and on the array of board
function turn(squareId, player) {
  origBoard[squareId] = player;
  document.getElementById(squareId).innerHTML = player;
  let gameWon = checkWin(origBoard, player);
  if (gameWon) {gameOver(gameWon);};
  checkTie();
}

//checks if the player or ai won the game
function checkWin(board, player) {
  let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
  let gameWon = null;
  for (let [index, win] of winCombos.entries()) {
    if (win.every(elem => plays.indexOf(elem) > -1)) {
      gameWon = {index: index, player: player};
      break;
    }
  }
  return gameWon;
}

//if player or ai won puts color on the cells
function gameOver(gameWon){
  for (let index of winCombos[gameWon.index]) {
    document.getElementById(index).style.backgroundColor =
      gameWon.player === huPlayer ? "green" : "red";
  };

  for (let i=0; i < cells.length; i++) {
    cells[i].removeEventListener('click', turnClick, false);
  };

  (gameWon.player === huPlayer) ? huScore++ : aiScore++;
  declareWinner(gameWon.player === huPlayer ? "You win!" : "You lose");
}

//declares the result of the game
function declareWinner(who) {
  document.querySelector(".endgame").style.display = "block";
  document.querySelector(".endgame .text").innerText = who;
  huScore_sp.innerHTML = huScore;
  aiScore_sp.innerHTML = aiScore;
}

//returns an array with all the empty squares
function emptySquares() {
  return origBoard.filter((elm, i) => i===elm);
}

//checks if is a tie
function checkTie() {
  if (emptySquares().length === 0){
    for (cell of cells) {
      cell.style.backgroundColor = "green";
      cell.removeEventListener('click',turnClick, false);
    };
    declareWinner("Tie game");
    return true;
  }
  return false;
}

//gets the best move for the ai
function bestSpot(){
  return minimax(origBoard, aiPlayer).index;
}

//minimax ai
function minimax(newBoard, player) {
  var availSpots = emptySquares(newBoard);

  if (checkWin(newBoard, huPlayer)) {
    return {score: -10};
  } else if (checkWin(newBoard, aiPlayer)) {
    return {score: 10};
  } else if (availSpots.length === 0) {
    return {score: 0};
  }

  var moves = [];
  for (let i = 0; i < availSpots.length; i ++) {
    var move = {};
    move.index = newBoard[availSpots[i]];
    newBoard[availSpots[i]] = player;

    if (player === aiPlayer)
      move.score = minimax(newBoard, huPlayer).score;
    else
       move.score =  minimax(newBoard, aiPlayer).score;

    newBoard[availSpots[i]] = move.index;
    if ((player === aiPlayer && move.score === 10) || (player === huPlayer && move.score === -10))
      return move;
    else
      moves.push(move);
  };

  let bestMove, bestScore;
  if (player === aiPlayer) {
    bestScore = -1000;
    for(let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
      bestScore = 1000;
      for(let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}
