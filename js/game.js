function maze(x, y) {
  var n = x * y - 1;
  if (n < 0) {
    alert("illegal maze dimensions");
    return;
  }
  var horiz = [];
  for (var j = 0; j < x + 1; j++) horiz[j] = [];
  var verti = [];
  for (var j = 0; j < y + 1; j++) verti[j] = [];
  var here = [Math.floor(Math.random() * x), Math.floor(Math.random() * y)];
  var path = [here];
  var unvisited = [];
  for (var j = 0; j < x + 2; j++) {
    unvisited[j] = [];
    for (var k = 0; k < y + 1; k++)
      unvisited[j].push(
        j > 0 && j < x + 1 && k > 0 && (j != here[0] + 1 || k != here[1] + 1)
      );
  }
  while (0 < n) {
    var potential = [
      [here[0] + 1, here[1]],
      [here[0], here[1] + 1],
      [here[0] - 1, here[1]],
      [here[0], here[1] - 1],
    ];
    var neighbors = [];
    for (var j = 0; j < 4; j++)
      if (unvisited[potential[j][0] + 1][potential[j][1] + 1])
        neighbors.push(potential[j]);
    if (neighbors.length) {
      n = n - 1;
      next = neighbors[Math.floor(Math.random() * neighbors.length)];
      unvisited[next[0] + 1][next[1] + 1] = false;
      if (next[0] == here[0])
        horiz[next[0]][(next[1] + here[1] - 1) / 2] = true;
      else verti[(next[0] + here[0] - 1) / 2][next[1]] = true;
      path.push((here = next));
    } else here = path.pop();
  }
  return { x: x, y: y, horiz: horiz, verti: verti };
}

function returnMaze(m) {
  var text = [];
  for (var j = 0; j < m.x * 2 + 1; j++) {
    var line = [];
    if (0 == j % 2)
      for (var k = 0; k < m.y * 4 + 1; k++)
        if (0 == k % 4) line[k] = 1;
        else if (j > 0 && m.verti[j / 2 - 1][Math.floor(k / 4)]) line[k] = 0;
        else line[k] = 1;
    else
      for (var k = 0; k < m.y * 4 + 1; k++)
        if (0 == k % 4)
          if (k > 0 && m.horiz[(j - 1) / 2][k / 4 - 1]) line[k] = 0;
          else line[k] = 1;
        else line[k] = 0;
    if (0 == j) line[1] = line[2] = line[3] = 0;
    if (m.x * 2 - 1 == j) line[4 * m.y] = 0;
    // text.push(line.join('')+'\r\n');
    text.push(line);
  }
  return text;
}

//The above 2 methods are adapted from http://rosettacode.org/wiki/Maze_generation to generate the maze with minor modifications for 0 and 1s

function getCollectiblesCoordinates(maze) {
  const dimension = maze.length;
  let collectibles = [];

  for (let i = 0; i < dimension; i++) {
    let randomXCoordinate = randomIntFromInterval(0, dimension - 1);
    if (maze[i][randomXCoordinate] === 0) {
      collectibles.push({
        y: i,
        x: randomXCoordinate,
        collected: false,
      });
    }
  }
  return collectibles;
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getPlayerAndGoalInitialPositions(level) {
  return {
    initial: {
      x: 1,
      y: level,
    },
    final: {
      x: level,
      y: 1,
    },
  };
}

function Game(level) {
  this.el = document.getElementById("game-container-1");
  this.score = 0;
  this.interval = null;

  //   this.mapArray = createMapArray(level);
  this.mapArray = Maze.returnMaze(Maze.maze(level, level));
  this.positions = getPlayerAndGoalInitialPositions(level);
  console.log(this.positions);
}

Game.prototype.bootstrapMap = function () {
  this.el.className = "game-container";
  this.cellDimensionPixels = "20px";
  this.cellDimension = 20;
  this.collectibleArray = getCollectiblesCoordinates(this.mapArray);
  let parentCellElement = document.getElementById("cells");
  for (var y = 0; y < this.mapArray.length; ++y) {
    for (var x = 0; x < this.mapArray[y].length; ++x) {
      let isFloor = true;
      if (this.mapArray[y][x] === 1) {
        isFloor = false;
      }
      let cellType = isFloor ? "floor" : "wall";
      let cell = this.createCell(x, y, cellType);
      parentCellElement.appendChild(cell);
    }
  }
};

Game.prototype.createCell = function (x, y, cellType) {
  let cellElement = document.createElement("div");
  cellElement.className = cellType;

  cellElement.style.width = this.cellDimensionPixels;
  cellElement.style.height = this.cellDimensionPixels;
  cellElement.style.left = x * this.cellDimension + "px";

  cellElement.style.top = y * this.cellDimension + "px";

  return cellElement;
};

Game.prototype.createPoints = function (x, y, type) {
  let pointElement = document.createElement("div");
  pointElement.className = type;
  pointElement.id = type;
  pointElement.style.width = this.cellDimensionPixels;
  pointElement.style.height = this.cellDimensionPixels;
  pointElement.style.left = x * this.cellDimension + "px";
  pointElement.style.borderRadius = this.cellDimension + "px";

  pointElement.style.top = y * this.cellDimension + "px";

  return pointElement;
};

Game.prototype.createAndPlaceCollectibles = function () {
  let collectibleArray = this.collectibleArray;

  for (let i = 0; i < collectibleArray.length; i++) {
    let x = collectibleArray[i].x;
    let y = collectibleArray[i].y;
    let collectibleElement = document.createElement("div");
    collectibleElement.className = "collectible";
    collectibleElement.id = "collectible";
    collectibleElement.style.width = this.cellDimensionPixels;
    collectibleElement.style.height = this.cellDimensionPixels;
    collectibleElement.style.left = x * this.cellDimension + "px";
    collectibleElement.style.borderRadius = this.cellDimension + "px";

    collectibleElement.style.top = y * this.cellDimension + "px";

    let collectiblesParent = this.el.querySelector("#collectibles");
    collectiblesParent.appendChild(collectibleElement);
  }
};

Game.prototype.placePoint = function (type) {
  let x = this.positions[type].x;
  let y = this.positions[type].y;
  let point = this.createPoints(x, y, type);
  point.id = type;
  point.style.borderRadius = this.cellDimensionPixels;

  let pointsParent = this.el.querySelector("#points");
  pointsParent.appendChild(point);
  return point;
};

Game.prototype.moveInitialPoint = function (event) {
  event.preventDefault();

  if (event.keyCode < 37 || event.keyCode > 40) {
    return;
  }
  switch (event.keyCode) {
    case 37:
      this.moveLeft();
      break;

    case 38:
      this.moveUp();
      break;

    case 39:
      this.moveRight();
      break;

    case 40:
      this.moveDown();
      break;
  }
};

Game.prototype.sizeUp = function () {
  let map = this.el.querySelector("#game-map-1");

  map.style.height = this.mapArray.length * this.cellDimensionPixels;

  map.style.width = this.mapArray[0].length * this.cellDimensionPixels;
};

Game.prototype.checkInitialAndFinalPoints = function () {
  let body = document.querySelector("body");
  if (
    this.positions.initial.x == this.positions.final.x &&
    this.positions.initial.y == this.positions.final.y
  ) {
    body.className = "success";
    let display = document.querySelector("#time");
    display.textContent = 0;

    let buttonElement = document.getElementById("restart-button");
    buttonElement.style.display = "inline";
    alert("Completed");
  } else {
    body.className = "";
  }
};

Game.prototype.matchCollectible = function () {
  let collectibleArray = this.collectibleArray.map((a) => Object.assign({}, a));

  for (let i = 0; i < collectibleArray.length; i++) {
    if (
      this.positions.initial.x == collectibleArray[i].x &&
      this.positions.initial.y == collectibleArray[i].y &&
      !collectibleArray[i].collected
    ) {
      this.score += 1;
      document.getElementById("score").innerHTML = this.score.toString();

      collectibleArray[i].collected = true;
    }
  }
  this.collectibleArray = collectibleArray;
  console.log(this.score);
};

Game.prototype.keyboardListener = function () {
  document.addEventListener("keydown", (event) => {
    this.moveInitialPoint(event);
    this.checkInitialAndFinalPoints();
    this.matchCollectible();
  });
};

Game.prototype.moveLeft = function () {
  if (this.positions.initial.x == 0) {
    return;
  }

  let nextCell =
    this.mapArray[this.positions.initial.y][this.positions.initial.x - 1];
  if (nextCell == 1) {
    return;
  }

  this.positions.initial.x -= 1;
  let initialPoint = document.getElementById("initial");
  initialPoint.style.left =
    this.positions.initial.x * this.cellDimension + "px";
};

Game.prototype.moveUp = function () {
  if (this.positions.initial.y == 0) {
    return;
  }

  let nextCell =
    this.mapArray[this.positions.initial.y - 1][this.positions.initial.x];
  if (nextCell == 1) {
    return;
  }

  this.positions.initial.y -= 1;
  let initialPoint = document.getElementById("initial");
  initialPoint.style.top = this.positions.initial.y * this.cellDimension + "px";
};

Game.prototype.moveRight = function () {
  if (
    this.positions.initial.x ==
    this.mapArray[this.positions.initial.y].length - 1
  ) {
    return;
  }

  let nextCell =
    this.mapArray[this.positions.initial.y][this.positions.initial.x + 1];
  if (nextCell == 1) {
    return;
  }

  this.positions.initial.x += 1;
  let initialPoint = document.getElementById("initial");
  initialPoint.style.left =
    this.positions.initial.x * this.cellDimension + "px";
};

Game.prototype.moveDown = function () {
  if (this.positions.initial.y == this.mapArray.length - 1) {
    return;
  }

  let nextCell =
    this.mapArray[this.positions.initial.y + 1][this.positions.initial.x];
  if (nextCell == 1) {
    return;
  }

  this.positions.initial.y += 1;
  let initialPoint = document.getElementById("initial");
  initialPoint.style.top = this.positions.initial.y * this.cellDimension + "px";
};

function init(level) {
  let mazeGame = new Game(level);

  mazeGame.bootstrapMap();

  mazeGame.placePoint("final");
  mazeGame.createAndPlaceCollectibles();
  mazeGame.placePoint("initial");
  mazeGame.keyboardListener();
}

function startTimer(duration, display) {
  var timer = duration,
    minutes,
    seconds;
  var myInterval = setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.textContent = minutes + ":" + seconds;
    if (--timer < 0) {
      timer = duration;
      let body = document.querySelector("body");
      body.className = "failure";

      let buttonElement = document.getElementById("restart-button");
      let display = document.querySelector("#time");
      buttonElement.style.display = "inline";
      startTimer(0, display);
    }
  }, 1000);
  this.interval = myInterval;
}

window.onload = function () {
  let level = prompt("Enter the level", 1);
  init(level * 3);
  var fiveMinutes = 30,
    display = document.querySelector("#time");
  startTimer(fiveMinutes, display);
};
