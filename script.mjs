import PIECES from "./modules/pieces.mjs";

const ROWS = 15,
  COLS = 10;
const BEEP = new Audio("./beep.mp3");
const STARTINDEX = [0, 5];

const PIECES_TYPE = ["s", "o", "i", "l", "j", "z", "t"];
const COLORS = {
  s: "#42B642",
  o: "#F7D308",
  i: "#31C7EF",
  l: "#FF9030",
  j: "#5A65AD",
  z: "#EF2029",
  t: "#AD4D9C",
};

class Tile {
  constructor(div, x, y) {
    this.x = x;
    this.y = y;
    this.div = div;
    this.div.id = "" + x + ":" + y;
    this.div.className = "tile";
    this.div.style.backgroundColor = "black";
  }

  setBackground(color) {
    this.div.style.backgroundColor = color;
  }

  getBackground() {
    return this.div.style.backgroundColor;
  }
}

class Piece {
  constructor() {
    this.type = PIECES_TYPE[Math.floor(Math.random() * PIECES_TYPE.length)];
    this.rotation = 0;
    this.piece = PIECES[this.type][0];
    this.color = COLORS[this.type];
  }

  setPieceRotation() {
    this.rotation = this.rotation + 1 > 3 ? 0 : this.rotation + 1;
    this.piece = PIECES[this.type][this.rotation];
  }

  unsetPieceRotation() {
    this.rotation = this.rotation - 1 < 0 ? 3 : this.rotation - 1;
    this.piece = PIECES[this.type][this.rotation];
  }
}

class Tetris {
  constructor(container, rows, cols) {
    this.offset = STARTINDEX;
    this.score = 0;
    this.items = Array(rows)
      .fill()
      .map(() => Array(cols).fill());
    this.container = container;
    this.container.className = "tetris-app";
    this.state = "render"; // render - generate a new pice next game tick, moving - move piece down next tick, over -geme over stop the game next tick
    this.startButton = document.createElement("button");
    this.startButton.innerText = "START";
    this.container.append(this.startButton);

    this.scoreLabel = document.createElement("label");
    this.scoreLabel.innerText = "SCORE: " + this.score;
    this.container.append(this.scoreLabel);

    this.startButton.addEventListener("click", () => {
      this.startGame();
    });

    window.addEventListener("keydown", (event) => {
      this.handleKeyPress(event);
      console.log(event.keyCode);
    });

    for (let [i, el] of this.items.entries()) {
      let row_div = document.createElement("div");
      row_div.className = "tetris-row";
      this.container.append(row_div);
      for (let [j, v] of el.entries()) {
        let tile_div = document.createElement("div");
        row_div.append(tile_div);
        let tile = new Tile(tile_div, i, j);
        this.items[i][j] = tile;
      }
    }
  }
  handleKeyPress(event) {
    switch (event.keyCode) {
      case 37:
        if (this.state === "moving") this.movePiece("left");
        break;
      case 38:
        if (this.state === "moving") this.rotatePiece();
        break;
      case 39:
        if (this.state === "moving") this.movePiece("right");
        break;
      case 40:
        if (this.state === "moving") this.movePiece("down");
        break;
    }
  }

  rotatePiece() {
    this.unrenderPiece();
    this.piece.setPieceRotation();
    if (!this.checkRenderPiece(this.offset)) this.piece.unsetPieceRotation();
    this.renderPiece();
  }

  movePiece(direction) {
    let offset;
    switch (direction) {
      case "down":
        offset = [this.offset[0] + 1, this.offset[1]];

        break;
      case "right":
        offset = [this.offset[0], this.offset[1] + 1];
        break;
      case "left":
        offset = [this.offset[0], this.offset[1] - 1];
        break;
    }

    this.unrenderPiece();
    if (this.checkRenderPiece(offset)) {
      this.offset = offset;
      this.renderPiece();
      if (direction === "down") {
      } //BEEP.play();}
    } else {
      this.renderPiece();
      if (direction === "down") this.state = "render";
    }
  }

  unrenderPiece() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.piece.piece[i][j] === 1)
          this.items[i + this.offset[0]][j + this.offset[1]].setBackground(
            "black"
          );
      }
    }
  }
  renderPiece() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.piece.piece[i][j] === 1)
          this.items[i + this.offset[0]][j + this.offset[1]].setBackground(
            this.piece.color
          );
      }
    }
  }

  checkRenderPiece(offset) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.piece.piece[i][j] === 1)
          if (
            0 > i + offset[0] ||
            ROWS <= i + offset[0] ||
            0 > j + offset[1] ||
            COLS <= j + offset[1] ||
            this.items[i + offset[0]][j + offset[1]].getBackground() !== "black"
          )
            return false;
      }
    }
    return true;
  }

  gameTick() {
    if (this.state === "render") {
      this.checkTetris();
      this.state = "moving";
      this.piece = new Piece();
      this.offset = STARTINDEX;
      if (this.checkRenderPiece(this.offset)) {
        this.renderPiece();
      } else {
        clearInterval(this.interval);
        alert("game over");
      }
    } else if (this.state === "moving") {
      this.movePiece("down");
    }
  }

  startGame() {
    this.interval = setInterval(() => {
      this.gameTick();
    }, 400);
  }

  checkTetris() {
    let i = 0;
    for (i = 1; i < ROWS; i++) {
      let del = true;
      for (let j = 0; j < COLS; j++) {
        if (this.items[i][j].getBackground() === "black") {
          del = false;
        }
      }
      if (del) {
        console.log("tetris..........", i);
        this.score += 100;
        this.scoreLabel.innerText = "SCORE:" + this.score;
        for (let k = i; k > 0; k--) {
          for (let j = 0; j < COLS; j++) {
            console.log("tertis", k, j);
            this.items[k][j].setBackground(
              this.items[k - 1][j].getBackground()
            );
          }
        }
      }
    }
  }
}

let div = document.createElement("div");
let tile = new Tetris(div, ROWS, COLS);
document.body.append(div);
