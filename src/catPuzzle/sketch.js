const imageSize = 320;
const size = 80;
let img;
const shapes = [];

const direction = {
  UP: 1,
  RIGHT: 2,
  DOWN: 3,
  LEFT: 4
};

class Shape {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.xBeforeMovement = x;
    this.yBeforeMovement = y;
    this.isMoving = false;

    this.move.bind(this);
    this.isHovered.bind(this);
    this.drawOutline.bind(this);
    this.draw.bind(this);
  }

  move(x, y) {
    this.x = x;
    this.y = y;
    this.xBeforeMovement = x;
    this.yBeforeMovement = y;
  }

  isHovered() {
    return false;
  }

  drawOutline() {
  }

  draw() {
  }

  drawOverlay(alpha) {
  }
}

class Rectangle extends Shape {
  constructor(x, y, width, height) {
    super(x, y);
    this.width = width;
    this.height = height;
  }

  isHovered() {
    const x = this.x + (this.isMoving ? mouseX : 0);
    const y = this.y + (this.isMoving ? mouseY : 0);
    const xCorrect = mouseX >= x && mouseX < x + this.width;
    const yCorrect = mouseY >= y && mouseY < y + this.height;
    return xCorrect && yCorrect;
  }

  drawOutline() {
    stroke(255);
    strokeWeight(4);
    fill(0, 0, 0, 0);

    const x = this.x + (this.isMoving ? mouseX : 0);
    const y = this.y + (this.isMoving ? mouseY : 0);

    rect(x - 3, y - 3, this.width + 6, this.height + 6);
  }

  draw() {
    strokeWeight(2);
    stroke(80);
    fill(150);

    const x = this.x + (this.isMoving ? mouseX : 0);
    const y = this.y + (this.isMoving ? mouseY : 0);

    rect(x, y, this.width, this.height);
  }

  drawOverlay(alpha) {
    const x = this.x + (this.isMoving ? mouseX : 0);
    const y = this.y + (this.isMoving ? mouseY : 0);

    noStroke();
    fill(255, 255, 255, alpha);
    rect(x, y, this.width, this.height);
  }
}

class Circle extends Shape {
  constructor(x, y, diameter) {
    super(x, y);
    this.diameter = diameter;
  }

  isHovered() {
    const x = this.x + (this.isMoving ? mouseX : 0) + this.diameter / 2;
    const y = this.y + (this.isMoving ? mouseY : 0) + this.diameter / 2;
    const vector = createVector(mouseX - x, mouseY - y);
    return vector.mag() <= this.diameter / 2;
  }

  drawOutline() {
    stroke(255);
    strokeWeight(4);
    fill(0, 0, 0, 0);

    const x = this.x + (this.isMoving ? mouseX : 0) + this.diameter / 2;
    const y = this.y + (this.isMoving ? mouseY : 0) + this.diameter / 2;

    circle(x, y, this.diameter + 4);
  }

  draw() {
    strokeWeight(2);
    stroke(80);
    fill(255);

    const x = this.x + (this.isMoving ? mouseX : 0);
    const y = this.y + (this.isMoving ? mouseY : 0);

    circle(x + this.diameter / 2, y + this.diameter / 2, this.diameter);
  }

  drawOverlay(alpha) {
    const x = this.x + (this.isMoving ? mouseX : 0);
    const y = this.y + (this.isMoving ? mouseY : 0);

    noStroke();
    fill(255, 255, 255, alpha);
    circle(x + this.diameter / 2, y + this.diameter / 2, this.diameter);
  }
}

class ImageRectangle extends Rectangle {
  constructor(x, y, width, height, sourceX, sourceY) {
    super(x, y, width, height);
    this.sourceX = sourceX;
    this.sourceY = sourceY;

    this.isNeighbourOf.bind(this);
    this.isSourceNeighbourOf.bind(this);
  }

  isNeighbourOf(other) {
    if (other.x - this.x === size && other.y - this.y === 0) {
      return direction.RIGHT;
    } else if (this.x - other.x === size && this.y - other.y === 0) {
      return direction.LEFT;
    } else if (other.y - this.y === size && other.x - this.x === 0) {
      return direction.DOWN;
    } else if (this.y - other.y === size && this.x - other.x === 0) {
      return direction.UP;
    }
  }

  isSourceNeighbourOf(other) {
    if (other.sourceX - this.sourceX === size && other.sourceY - this.sourceY === 0) {
      return direction.RIGHT;
    } else if (this.sourceX - other.sourceX === size && this.sourceY - other.sourceY === 0) {
      return direction.LEFT;
    } else if (other.sourceY - this.sourceY === size && other.sourceX - this.sourceX === 0) {
      return direction.DOWN;
    } else if (this.sourceY - other.sourceY === size && this.sourceX - other.sourceX === 0) {
      return direction.UP;
    }
  }

  drawOutline() {
    stroke(255);
    strokeWeight(4);
    fill(0, 0, 0, 0);

    const x = this.x + (this.isMoving ? mouseX : 0);
    const y = this.y + (this.isMoving ? mouseY : 0);

    rect(x - 2, y - 2, this.width + 4, this.height + 4);
  }

  draw() {
    strokeWeight(2);
    stroke(80);
    fill(255);

    const x = this.x + (this.isMoving ? mouseX : 0);
    const y = this.y + (this.isMoving ? mouseY : 0);
    image(img, x, y, this.width, this.height, this.sourceX, this.sourceY, this.width, this.height);
  }

  drawOverlay(alpha) {
    const x = this.x + (this.isMoving ? mouseX : 0);
    const y = this.y + (this.isMoving ? mouseY : 0);

    noStroke();
    fill(255, 255, 255, alpha);
    rect(x, y, this.width, this.height);
  }
}

function createRectangle(x, y, width, height) {
  const shape = new Rectangle(x, y, width, height);
  shapes.push(shape);
  return shape;
}

function createCircle(x, y, diameter) {
  const shape = new Circle(x, y, diameter);
  shapes.push(shape);
  return shape;
}

function createImageRectangle(x, y, width, height, sourceX, sourceY) {
  const shape = new ImageRectangle(x, y, width, height, sourceX, sourceY);
  shapes.push(shape);
  return shape;
}

function preload() {
  img = loadImage('assets/catImage.png');
}

function shuffleShapes() {
  const first = random(shapes);
  const second = random(shapes.filter((s) => s !== first));
  const { x, y } = first;
  first.move(second.x, second.y);
  second.move(x, y);
}

function setup() {
  createCanvas(imageSize + 2 * size, imageSize + 2 * size);

  for (let j = 0; j < imageSize; j += size) {
    for (let i = 0; i < imageSize; i += size) {
      createImageRectangle(size + i, size + j, size, size, i, j);
    }
  }

  for (let i = 0; i < shapes.length * 2; i++) {
    shuffleShapes();
  }

  // createRectangle(10, 10, 40, 40);
  // createRectangle(10, 70, 40, 40);
  // createCircle(70, 10, 40);
  // createCircle(70, 70, 40);
}

function mousePressed() {
  const x = mouseX;
  const y = mouseY;
  const hoveredShapes = shapes.filter((r) => r.isHovered(x, y));
  const hovered = hoveredShapes[hoveredShapes.length - 1];
  if (hovered) {
    hovered.isMoving = true;
    hovered.x = hovered.x - x;
    hovered.y = hovered.y - y;
    shapes.splice(shapes.indexOf(hovered), 1);
    shapes.push(hovered);
  }
}

function mouseReleased() {
  const arr = shapes.filter((s) => s.isMoving);
  arr.forEach((s) => {
    s.isMoving = false;
    let x = s.x + mouseX;
    let y = s.y + mouseY;
    x = Math.round(x / size) * size;
    y = Math.round(y / size) * size;

    if (x < 0 || x >= width || y < 0 || y >= height) {
      s.move(s.xBeforeMovement, s.yBeforeMovement);
      return;
    }

    const other = shapes.find((e) => e.x === x && e.y === y);
    if (other) {
      other.move(s.xBeforeMovement, s.yBeforeMovement);
    }

    s.move(x, y);
  });
}

function draw() {
  background(220);

  const hoveredShapes = shapes.filter((s) => s.isHovered());
  const hovered = hoveredShapes[hoveredShapes.length - 1];
  const hoveredGroup = hovered ? [hovered] : [];

  let other;
  if (hovered && hovered.isMoving) {
    push();
    noStroke();
    fill(200, 200, 200);

    let x = hovered.x + mouseX;
    let y = hovered.y + mouseY;
    x = Math.round(x / size) * size;
    y = Math.round(y / size) * size;

    if (x < 0 || x >= width || y < 0 || y >= height) {
      x = hovered.xBeforeMovement
      y = hovered.yBeforeMovement;
    }

    other = shapes.find((e) => e.x === x && e.y === y);

    rectMode(CORNER)
    rect(x, y, size, size);
    pop();
  }

  shapes.forEach((s) => {
    s.draw();
  });

  if (hovered && hovered.isMoving && other) {
    other.drawOverlay(100);
    other.drawOutline();
    hovered.draw();
  }

  hoveredGroup.forEach((s) => {
    s.drawOutline();
    s.drawOverlay(50);
  });
}
