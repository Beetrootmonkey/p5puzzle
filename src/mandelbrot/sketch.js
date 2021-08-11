let size;
let iterations;
let threshold;
let zoomValue;
let offsetX;
let offsetY;
let theShader;
let zoomSlider;
let baseZoom;
let offsetXPlusButton;
let offsetXMinusButton;
let offsetYPlusButton;
let offsetYMinusButton;
let baseOffsetPerClick = 0.1;
const zoomStep = 0.2;
const autoZoomStep = 0.0;
let moving = false;
let lastMouseX;
let lastMouseY;
let shaderGraphics;
let frameCount = 0;
let fps = 0;
const showCrosshair = false;

window.setInterval(() => {
  fps = frameCount;
  frameCount = 0;
}, 1000);

function preload() {
  theShader = loadShader('assets/shader.vert', 'assets/shader_double.frag');
}

// f(z) = z² + c

function setup() {
  frameRate(30);
  baseZoom = 4;
  size = 900;
  iterations = 256;
  threshold = 4;
  
  //offsetX = 0.3322456703602321;
  offsetX = -0.554166980996254;
  //offsetX = 0.339453419597841;
  
  //offsetY = -0.38901050632211825;
  offsetY = 0.5558668701818453;
  //offsetY = -0.5553343136397788;
  
  //zoomValue = 6.169561282447572;
  zoomValue = 6;
  //zoomValue = 0.000005206479263399148;
  
  window.setX = (x) => {
	  offsetX = x;
  };
  window.moveX = (x) => {
	offsetX += x;
  };
  window.setY = (y) => {
	  offsetY = y;
  }; 
  window.moveY = (y) => {
	offsetY += y;
  };
  window.setZoom = (z) => {
	  zoomValue = z;
  }; 

  createCanvas(size, size);
  noSmooth();
  stroke('white');
  pixelDensity(1);

  fill('white');
  strokeWeight(1);

  // shaders require WEBGL mode to work
  shaderGraphics = createGraphics(size, size, WEBGL);
  shaderGraphics.noStroke();
}

function mousePressed() {
  moving = true;
}

function mouseReleased() {
  moving = false;
}

function mouseWheel(event) {
  const add = Math.sign(event.deltaY) * zoomStep;
  zoomValue *= 1 + add;
  console.log(zoomValue, offsetX, offsetY);
}

function draw() {
  background(220);
  frameCount++;

  const mouseOffsetX = moving ? (mouseX - lastMouseX) / size * zoomValue * 2 * -1 : 0;
  const mouseOffsetY = moving ? (mouseY - lastMouseY) / size * zoomValue * 2 : 0;

  offsetX = offsetX + mouseOffsetX;
  offsetY = offsetY + mouseOffsetY;

  // console.log('offset', offsetX, offsetY);
  // console.log('mouseOffset', mouseOffsetX, mouseOffsetY);
  shaderGraphics.shader(theShader);

  theShader.setUniform('u_time', frameCount * 0.01);
  theShader.setUniform('u_iterations', iterations);
  theShader.setUniform('u_threshold', threshold);
  theShader.setUniform('u_zoom', zoomValue);
  theShader.setUniform('u_offset', [offsetX, offsetY + mouseOffsetY]);

  shaderGraphics.rect(0, 0, width, height);
  image(shaderGraphics, 0, 0, width, height);

  if (showCrosshair) {
    const l = 8;
    stroke('black');
    strokeWeight(5);
    line(size / 2, size / 2 - l, size / 2, size / 2 + l);
    line(size / 2 - l, size / 2, size / 2 + l, size / 2);
    stroke('white');
    strokeWeight(1);
    line(size / 2, size / 2 - l, size / 2, size / 2 + l);
    line(size / 2 - l, size / 2, size / 2 + l, size / 2);
  }

  stroke('black');
  strokeWeight(4);
  text('FPS: ' + fps, 5, 15);

  lastMouseX = mouseX;
  lastMouseY = mouseY;
  zoomValue *= 1 - autoZoomStep;
}
