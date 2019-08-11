//values
let userScore = 0;
let compScore = 0;

const userScore_span = document.getElementById("user-score");
const computerScore_span = document.getElementById("computer-score");
const scoreBoard_div = document.querySelector(".score-board");
const result_p = document.querySelector(".result > p");

const rock_div = document.getElementById("r");
const paper_div = document.getElementById("p");
const scissors_div = document.getElementById("s");

//gets a choice of the computer
function getComputerChoice () {
  const choices = ['r', 'p', 's'];
  const randomNumber = Math.floor(Math.random()*3);
  return choices[randomNumber];
}

//converts letter to word
function converToWord(letter) {
  if (letter === "r") return "Rock";
  if (letter === "p") return "Paper";
  if (letter === "s") return "Scissors";
}

//checks win lose or draw
function win(userChoice, computerChoice) {
  userScore++;
  userScore_span.innerHTML = userScore;
  result_p.innerHTML = `${converToWord(userChoice)} beats ${converToWord(computerChoice)}. You win`;
  document.getElementById(userChoice).classList.add('green-glow');
  setTimeout( () => document.getElementById(userChoice).classList.remove('green-glow'), 300);
}
function lose (userChoice, computerChoice) {
  compScore++;
  computerScore_span.innerHTML = compScore;
  result_p.innerHTML = `${converToWord(userChoice)} loses to ${converToWord(computerChoice)}. You lose`;
  document.getElementById(userChoice).classList.add('red-glow');
  setTimeout( () => document.getElementById(userChoice).classList.remove('red-glow'), 300);
}
function draw (userChoice, computerChoice) {
  result_p.innerHTML = `${converToWord(userChoice)} is the same as ${converToWord(computerChoice)}. It's a draw`;
  document.getElementById(userChoice).classList.add('grey-glow');
  setTimeout( () => document.getElementById(userChoice).classList.remove('grey-glow'), 300);
}

//the game
function game(userChoice) {
  const computerChoice = getComputerChoice();
  switch(userChoice + computerChoice) {
    case "rs":
    case "pr":
    case "sp":
      win(userChoice, computerChoice);
      break;

    case "rp":
    case "ps":
    case "sr":
      lose(userChoice, computerChoice);
      break;

    case "rr":
    case "pp":
    case "ss":
      draw(userChoice, computerChoice);
      break;
  }
}

//main func
function main() {
  rock_div.addEventListener('click', () => game("r"));
  paper_div.addEventListener('click', () => game("p"))
  scissors_div.addEventListener('click', () => game("s"))
}

main();
