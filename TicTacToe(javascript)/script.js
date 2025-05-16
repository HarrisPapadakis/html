const btnRef = document.querySelectorAll(".box");
const statusText = document.getElementById("status");
let currentPlayer = "X";
let gameActive = true;

const winningPattern = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

btnRef.forEach((button, index) => {
  button.addEventListener("click", () => {
    if (button.innerText === "" && gameActive) {
      button.innerText = currentPlayer;
      winChecker();
      currentPlayer = currentPlayer === "X" ? "O" : "X";
    }
  });
});

const winFunction = (winner) => {
  statusText.innerText = `${winner} κερδίζει! 🎉`;
  gameActive = false;
};

const winChecker = () => {
  for (let i of winningPattern) {
    let [a, b, c] = [
      btnRef[i[0]].innerText,
      btnRef[i[1]].innerText,
      btnRef[i[2]].innerText,
    ];

    if (a !== "" && a === b && b === c) {
      winFunction(a);
      return;
    }
  }

  if ([...btnRef].every(btn => btn.innerText !== "") && gameActive) {
    statusText.innerText = "Ισοπαλία!";
    gameActive = false;
  }
};

const resetGame = () => {
  btnRef.forEach(btn => (btn.innerText = ""));
  currentPlayer = "X";
  statusText.innerText = "";
  gameActive = true;
};
// JavaScript Document