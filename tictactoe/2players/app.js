//constants
let origBoard;
let player1 ='O';
let player2 = 'X';
let turn = 0;
let player1Score = 0;
let player2Score = 0;
let winner;

const turnOf_h1 = document.getElementById('turnOf');
const player1Sc_sp = document.getElementById('player1Score');
const player2Sc_sp = document.getElementById('player2Score');

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

//starts or restarts the game
function startGame() {
  turn = 0;
  turnOf_h1.innerHTML = 'turn of X';
  document.querySelector('.endgame').style.display = "none";
  document.querySelector('.endgame .text').innerText ="";
  document.querySelector('.selectSym').style.display = "block";
  for(let i =0; i<cells.length; i++){
    cells[i].innerHTML = "";
    cells[i].style.removeProperty('background-color');
  };
}

//chose the symbol of player 1 and creates the new board
function selectSym(sym){
  player1 = sym;
  player2 = sym==='O'? 'X' : 'O';
  origBoard = Array.from(Array(9).keys());
  for(let i=0; i < cells.length; i++){
    cells[i].addEventListener('click', turnClick,false);
  };
  document.querySelector('.selectSym').style.display = "none";
}

//activates when touching a cell
function turnClick(square) {
  if(typeof origBoard[square.target.id]==='number'){
    turn ++;
    (turn%2) ? turnOf_h1.innerHTML = 'turn of O' : turnOf_h1.innerHTML = 'turn of X';
    (turn%2) ? turnPut(square.target.id, 'X') : turnPut(square.target.id, 'O');
  }
}

//puts the symbol on the page and on the board
function turnPut(squareId, sym) {
  origBoard[squareId]=sym;
  document.getElementById(squareId).innerHTML = sym;

  if(checkTie()){
    declareWinner('tie')
  }

  let gameWon = checkWin(sym);
  if(gameWon){
    gameOver(gameWon);
  };
}

//check if there is a winner
function checkWin(sym) {
  let plays = origBoard.reduce((a,e,i) => (e === sym) ? a.concat(i) : a, []);
  let gameWon = null;
  for(let [index, win] of winCombos.entries()){
    if(win.every(elem => plays.indexOf(elem)>-1)){
      gameWon = {index: index, player: sym};
      break;
    };
  };
  return gameWon;
}

//if game is over puts the color on the cells of the winner
function gameOver(gameWon){
  for(let i =0; i < cells.length; i++){
    cells[i].style.removeProperty('background-color');
  };

  for(let index of winCombos[gameWon.index]){
    document.getElementById(index).style.backgroundColor = "green";
  };

  for (let i = 0; i < origBoard.length; i++){
    cells[i].removeEventListener('click', turnClick, false);
  };

  declareWinner(gameWon.player);
  updateScore(gameWon.player);
}

//declares the winner
function declareWinner(who){
  (player1 === who) ?  winner = 'player1' : winner = 'player2';
  (who === 'tie') ? winner = 'no one won' : winner;

  document.querySelector(".endgame").style.display = "block";

  if(winner === 'player1' || winner === 'player2'){
    document.querySelector(".endgame .text").innerText = 'the winner is ' + winner;
  } else {
    document.querySelector(".endgame .text").innerText = winner;
  };
}

//updates the score on the board
function updateScore(winner){
  (winner === player1) ? player1Score++ : player2Score ++;
  player1Sc_sp.innerHTML = player1Score;
  player2Sc_sp.innerHTML = player2Score;
}

//check if it's a tie
function checkTie() {
  if(emptySquares().length === 0){
    for (cell of cells){
      cell.style.backgroundColor = "green";
      cell.removeEventListener('click',turnClick, false);
    }
    return true;
  }
  return false;
}

//checks if there are empty squares
function emptySquares() {
  return origBoard.filter((elm, i) => i===elm);
}
