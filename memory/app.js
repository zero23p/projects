const cards = document.querySelectorAll('.memory-card');
const score1_span = document.getElementById('player1Score');
const score2_span = document.getElementById('player2Score');
const playerTurn_p = document.getElementById('turn');

let turn = 0;
let score1 = 0;
let score2 = 0;
let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;

function flipCard() {
  if(lockBoard) return;
  if(this === firstCard) return;

  this.classList.add('flip');

  if(!hasFlippedCard) {
    //first click
    hasFlippedCard = true;
    firstCard = this;
    return;
  }
  //second click
  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
  isMatch ? disableCards() : unflipCards();

  printPlayerTurn();
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  printScore();
  resetBoard();
}

function unflipCards() {
  lockBoard = true;

  setTimeout( () => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');

    resetBoard();
  }, 1500);

  turn++;
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

(function shuffle() {
  cards.forEach(card => {
    let randomPos = Math.floor(Math.random()*12);
    card.style.order = randomPos;
  });
})();

function printScore(){
  if(turn%2 === 0){
    score1 ++;
    score1_span.innerHTML = score1;
  } else {
    score2++;
    score2_span.innerHTML = score2;
  }

  turn++;
}

function printPlayerTurn() {
  if(turn%2 == 0){
    playerTurn_p.innerHTML = 'turn of player1';
  }else{
    playerTurn_p.innerHTML = 'turn of player2';
  }
}

cards.forEach(card => card.addEventListener('click', flipCard));
