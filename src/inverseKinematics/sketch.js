let snake;

let screenCenter;

let playerPos;
let playerDir;
let playerSpeed;

let keyCodes;
let directions;

let applePos;

const updateApplePos = () => {
  applePos = createVector(random(width), random(height));
}

function setup() {
  createCanvas(600, 600);
  screenCenter = createVector(width * 0.5, height * 0.5);

  playerPos = screenCenter.copy();
  playerDir = createVector(1, 0);
  playerSpeed = 2;

  keyCodes = {
    W: 87,
    A: 65,
    S: 83,
    D: 68
  };

  directions = {
    UP: createVector(0, -1),
    LEFT: createVector(-1, 0),
    DOWN: createVector(0, 1),
    RIGHT: createVector(1, 0)
  };

  updateApplePos();

  snake = new Snake(1000, playerPos, 0, 4);
}

function draw() {
  background('grey');

  if (playerPos.dist(applePos) <= 12) {
    updateApplePos();
    snake.append();
  }


  if (keyIsDown(keyCodes.W)) {
    playerDir.add(directions.UP).normalize();
  }

  if (keyIsDown(keyCodes.A)) {
    playerDir.add(directions.LEFT).normalize();
  }

  if (keyIsDown(keyCodes.S)) {
    playerDir.add(directions.DOWN).normalize();
  }

  if (keyIsDown(keyCodes.D)) {
    playerDir.add(directions.RIGHT).normalize();
  }

  playerPos.add(playerDir.copy().mult(playerSpeed));

  snake.follow(playerPos.x, playerPos.y);
  snake.draw();

  noStroke();
  fill('red');
  ellipseMode(RADIUS);
  circle(applePos.x, applePos.y, 8);

  stroke('white');
  strokeWeight(1);
  fill('white');
  text('Score: ' + snake.sticks.length, 10, 20);
}
