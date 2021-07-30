let size;
let iterations;
let threshold;
let zoom;
let offsetX;
let offsetY;

// f(z) = z² + c

function setup() {
  size = 640;
  iterations = 50;
  threshold = 16;
  zoom = 4 * Math.pow(0.1, 2);
  offsetX = 0.06088055692451929;
  offsetY = -0.6330788500462561;

  createCanvas(size, size);
  noSmooth();
  noStroke();
  pixelDensity(1);
  noLoop();
}

function getColor(c) {
  const norm = map(c.n, 0, iterations, 0, 1);
  let bright = map(sqrt(norm), 0, 1, 0, 255);
  if (c.n === iterations) {
    bright = 0;
  }

  return [bright, bright, bright];
}

function getValue(cOriginal, c, iterationsLeft) {

  if (iterationsLeft <= 0 || dist(c.x, c.y, 0, 0) > threshold) {
    return {
      x: c.x,
      y: c.y,
      n: iterations - iterationsLeft
    };
  }

  const r = c.x * c.x - c.y * c.y + cOriginal.x;
  const i = 2 * c.x * c.y + cOriginal.y;
  const newC = createVector(r, i);

  return getValue(cOriginal, newC, iterationsLeft - 1);
}

function draw() {
  background(220);

  loadPixels();
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const cA = map(i, 0, width, -zoom, zoom) + offsetX;
      const cB = map(j, 0, height, -zoom, zoom) + offsetY;

      // Now we test, as we iterate z = z^2 + cm does z tend towards infinity?
      let a = cA;
      let b = cB;
      let n = 0;
      while (n < iterations) {
        const aa = a * a;
        const bb = b * b;
        const twoab = 2.0 * a * b;
        a = aa - bb + cA;
        b = twoab + cB;
        // Infinty in our finite world is simple, let's just consider it 16
        if (dist(aa, bb, 0, 0) > threshold) {
          break;  // Bail
        }
        n++;
      }

      // We color each pixel based on how long it takes to get to infinity
      // If we never got there, let's pick the color black
      const pix = (i + j * width) * 4;
      const norm = map(n, 0, iterations, 0, 1);
      let bright = map(sqrt(norm), 0, 1, 0, 255);
      if (n === iterations) {
        bright = 0;
      }
      // Gosh, we could make fancy colors here if we wanted
      pixels[pix + 0] = bright;
      pixels[pix + 1] = bright;
      pixels[pix + 2] = bright;
      pixels[pix + 3] = 255;

    }
  }
  updatePixels();
}
