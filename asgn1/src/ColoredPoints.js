// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 20.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const ERASER = 3;
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedShape = POINT;
let g_selectedSegments = 10;
let g_BGColor = [0.0, 0.0, 0.0, 1.0];
var g_shapesList = [] // The array for the color, scale, and position of a mouse press


function main() {
  
  // Set up canvas and gl var
  setupWebGL();
  // Set up GLSL shader programs and connect to GLSL var
  connectVariableToGLSL();
  // Set up actions for HTML and UI
  addActionsForHtmlUI();
 
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {
    if (ev.buttons == 1) {
      click(ev);
    }
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

/** ------------------------------------------------------------------------ */

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

}

function connectVariableToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }
  
    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }
  
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
      console.log('Failed to get the storage location of u_Size');
      return;
    }
}

function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  if (g_selectedShape === ERASER) {
    // Remove shapes that are near the click point
    const threshold = 0.05;
    g_shapesList = g_shapesList.filter(shape => {
      const dx = shape.position[0] - x;
      const dy = shape.position[1] - y;
      return Math.sqrt(dx*dx + dy*dy) > threshold;
    });
    renderAllShapes();
    return;
  }

  // Create and store the new point
  let point;
  if (g_selectedShape == POINT) {
    point = new Point();
  } else if (g_selectedShape == TRIANGLE) {
    point = new Triangle();
  } else if (g_selectedShape == CIRCLE) {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position= [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();

}

/** Extract the event click and return it in WebGL coordinates. */
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return ([x,y]);
}

/** Draw every shape that is supposed to be in the canvas. */
function renderAllShapes() {
  
  // Check how long it takes to draw
  var startTime = performance.now();
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw each shape
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
  // Check the time of the end drawing
  var duration = performance.now() - startTime;
  sendTextToHtml("numdot: " + len + " ms: " + Math.floor(duration) + " fps: "+ Math.floor(10000/duration));
  
}

function addActionsForHtmlUI() {
  // Mode Switching 
  document.getElementById('squa').onclick = function() {
    g_selectedShape = POINT;
    console.log('POINT Mode!');
  }
  document.getElementById('tri').onclick = function() {
    g_selectedShape = TRIANGLE;
    console.log('TRIANGLE Mode!');
  }
  document.getElementById('cir').onclick = function() {
    g_selectedShape = CIRCLE;
    console.log('CIRCLE Mode!');
  }

  // Color buttons
  document.getElementById('green').onclick = function() {
    g_selectedColor=[0.0,1.0,0.0,1.0];
    console.log('green', g_selectedColor);
  };
  document.getElementById('red').onclick = function() {
    g_selectedColor=[1.0,0.0,0.0,1.0];
    console.log('red', g_selectedColor);
  };

  // Clear Button
  document.getElementById('clear').onclick = function() {
    g_shapesList = [];
    renderAllShapes();
  }

  // Art Button
  document.getElementById('artWork').onclick = function() {
    g_shapesList = [];
    renderAllShapes();
    drawMyArt();
  }

  // Color Sliders
  document.getElementById('redSlide').addEventListener( 'mouseup', function() {
    g_selectedColor[0] = this.value/100;
    console.log('rgb', g_selectedColor);
  });
  document.getElementById('greenSlide').addEventListener('mouseup', function() {
    g_selectedColor[1] = this.value/100;
    console.log('rgb', g_selectedColor);
  });
  document.getElementById('blueSlide').addEventListener('mouseup', function() {
    g_selectedColor[2] = this.value/100;
    console.log('rgb', g_selectedColor);
  });

  // Size Sliders
  document.getElementById('sizeSlide').addEventListener('mouseup', function() {
    g_selectedSize = this.value;
    console.log('scale', g_selectedSize);
  });
  document.getElementById('segmentSlide').addEventListener('mouseup', function() {
    g_selectedSegments = this.value;
    console.log('circle segment', g_selectedSegments);
  });
  
  // Set random BG
  document.getElementById('randomBG').onclick = function() {
    const r = Math.random();
    const g = Math.random();
    const b = Math.random();
    g_BGColor = [r,g,b,1];
    gl.clearColor(r, g, b, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    renderAllShapes();
    console.log(`New BG: ${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)}`);
  };  
  
  // Eraser
  document.getElementById('eraser').onclick = function() {
    g_selectedShape = ERASER;
    g_selectedColor = g_BGColor.slice();
  };

  //Undo
  document.getElementById('undo').onclick = function() {
    g_shapesList.pop();
    renderAllShapes();
  };
}

function sendTextToHtml(text, htmlID) {
  var htmlElm = document.getElementById('numdot');
  if (!htmlElm) {
    console.log('Failed to get ' + htmlID);
    return;
  }
  htmlElm.innerHTML = text;
}

function drawMyArt() {

  //mountain
  gl.uniform4f(u_FragColor, 0.1, 0.4, 0.1, 1.0);
  drawTriangle([-1, -1.0,   1, -1.0,   0.0, 0.5]); 
  gl.uniform4f(u_FragColor, 0.36, 0.25, 0.20, 1);
  drawTriangle([-1, -1.0,   0, -1.0,   -0.5, 0.25]);
  drawTriangle([0, -1.0,   1, -1.0,   0.5, 0.25]); 
  gl.uniform4f(u_FragColor, 0.50, 0.35, 0.25, 1.0);
  drawTriangle([-0.5, -1.0,   0.5, -1.0,   0, 0.15]); 


  // building
  gl.uniform4f(u_FragColor, 0.51, 0.26, 0.45, 0.99);
  drawTriangle([-0.6, 0.2,  -0.2, 0.2,  -0.4, 0.7]); 
  drawTriangle([-0.5, 0.4,  -0.3, 0.4,  -0.4, 0.8]);
  gl.uniform4f(u_FragColor, 0.41, 0.26, 0.0, 0.39);
  drawTriangle([-0.6, -1.0,  -0.2, -1.0,  -0.2, 0.2]);
  drawTriangle([-0.6, -1.0,  -0.6, 0.2,  -0.2, 0.2]);


  //more mountain
  gl.uniform4f(u_FragColor, 0.65, 0.45, 0.30, 1);
  drawTriangle([-0.75, -1.0,   0.5, -1.0,   -0.5, -0.5]);
  drawTriangle([-0.5, -1.0,   0.75, -1.0,   0.5, -0.5]);

  // flower window (12 triangles)
  drawFlowerWindow();
  drawFlowerWindowouter();
  drawFlowerWindowInner();

}

function drawFlowerWindow() {
  gl.uniform4f(u_FragColor, 0.663, 0.529, 0.286, 1);
  let centerX = -0.4;  
  let centerY = -0.07; 
  let radius = 0.17;
  let numTriangles = 12; 
  for (let i = 0; i < numTriangles; i++) {
    let angle = (i * 2 * Math.PI) / numTriangles;
    let nextAngle = ((i + 1) * 2 * Math.PI) / numTriangles;
    let tip = [centerX, centerY];
    let base1 = [
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius
    ];
    let base2 = [
      centerX + Math.cos(nextAngle) * radius,
      centerY + Math.sin(nextAngle) * radius
    ];
    drawTriangle([tip[0], tip[1], base1[0], base1[1], base2[0], base2[1]]);
  }
}

function drawFlowerWindowouter() {
  gl.uniform4f(u_FragColor, 0, 0, 0, 1); 
  let centerX = -0.4;  
  let centerY = -0.07; 
  let radius = 0.15;
  let numTriangles = 12; 
  let gap = 0.8;

  for (let i = 0; i < numTriangles; i++) {
    let angle = (i * 2 * Math.PI) / numTriangles; 
    let nextAngle = ((i + 1) * 2 * Math.PI) / numTriangles;
    let midAngle = (angle + nextAngle) / 2;
    let base1 = [
      centerX + Math.cos(angle + (midAngle - angle) * (1 - gap)) * radius,
      centerY + Math.sin(angle + (midAngle - angle) * (1 - gap)) * radius
    ];
    let base2 = [
      centerX + Math.cos(nextAngle - (nextAngle - midAngle) * (1 - gap)) * radius,
      centerY + Math.sin(nextAngle - (nextAngle - midAngle) * (1 - gap)) * radius
    ];
    let tip = [centerX, centerY];
    gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0); 
    drawTriangle([tip[0], tip[1], base1[0], base1[1], base2[0], base2[1]]);
  }
}

function drawFlowerWindowInner() {
  gl.uniform4f(u_FragColor, 0.996, 0.894, 0.565, 1.0); 
  let centerX = -0.4;  
  let centerY = -0.07; 
  let radius = 0.12;
  let numTriangles = 16; 
  let gap = 0.5;

  for (let i = 0; i < numTriangles; i++) {
    let angle = (i * 2 * Math.PI) / numTriangles; 
    let nextAngle = ((i + 1) * 2 * Math.PI) / numTriangles;
    let midAngle = (angle + nextAngle) / 2;
    let base1 = [
      centerX + Math.cos(angle + (midAngle - angle) * (1 - gap)) * radius,
      centerY + Math.sin(angle + (midAngle - angle) * (1 - gap)) * radius
    ];
    let base2 = [
      centerX + Math.cos(nextAngle - (nextAngle - midAngle) * (1 - gap)) * radius,
      centerY + Math.sin(nextAngle - (nextAngle - midAngle) * (1 - gap)) * radius
    ];
    let tip = [centerX, centerY];
    drawTriangle([tip[0], tip[1], base1[0], base1[1], base2[0], base2[1]]);
  }
}