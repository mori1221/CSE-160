// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let g_selectedColor = [0,0,0,1.0];
let g_selectedSize = 5;
let g_selectedShape = POINT;
let g_selectedSegments = 10;
let g_BGColor = [0, 0, 0, 1.0];
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_ears = 0;
let g_Animation = false;
let g_magentaAnimation = false;
let g_isWalking = false;
let g_walkAnim = 0;
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_tailAnimation = false;
let g_tailAngle = 0;
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
  canvas.onmousedown = function(ev) {
    if (ev.shiftKey) {
        g_isWalking = true;  // The cat "pokes" into action and starts running!
        console.log("Poke! Cat is now running.");


        setTimeout(function() {
          g_isWalking = false;
        }, 3000);
    }
};

  canvas.onmousemove = function(ev) {
    if (ev.buttons == 1) {
      g_globalAngleX += ev.movementX; 
      g_globalAngleY += ev.movementY;
      renderScene();
      click(ev);
    }
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.3, 0, 0.9, 0.5);

  requestAnimationFrame(tick);

}

/** ------------------------------------------------------------------------ */
var g_startTime=performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;

  // Update Animation Angles
  updateAnimationAngles();

  // Draw
  renderScene();
  requestAnimationFrame(tick);
}


function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);

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

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if(!u_ModelMatrix) {
      console.log('Failed to get the storage location of u_ModelMatrix');
      return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if(!u_GlobalRotateMatrix) {
      console.log('Failed to get the storage location of u_GlobalRotateMatrix');
      return;
    }

    // Set an initial value for this matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
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
    //renderAllShapes();
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
  // renderAllShapes();

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

/** Update AnimationAngles */
function updateAnimationAngles() {
  // add shake rapidly at ramdom interval

  // walking mode
  if (g_isWalking) {
    g_walkAnim = Math.sin(g_seconds * 10) * 30;
  }

  if(g_Animation) {
    g_yellowAngle = (2*Math.sin(g_seconds));
    if (Math.floor(g_seconds) % 4 === 0 && (g_seconds % 1) < 0.2) {
      g_ears = Math.sin(g_seconds * 60) * 15;
    } else {
      g_ears = 0;
    }
  }
  if(g_magentaAnimation) {
    g_magentaAngle = (15*Math.sin(0.33*g_seconds));
  }
  if (g_tailAnimation) {
    g_tailAngle = g_seconds;
  }
}

/** Draw every elements that is supposed to be formed a cat. */
function renderScene() {
  
  // Check how long it takes to draw
  var startTime = performance.now();
  
  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0,1,0);
  globalRotMat.rotate(g_globalAngleX, 0, 1, 0); 
  globalRotMat.rotate(g_globalAngleY, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the body cube
  var body = new Sphere();
  body.color = [0, 0, 0.0, 1];
  if(!g_isWalking) {
    body.matrix.translate(0, -0.55, 0.1);
    body.matrix.rotate(-10,1,0,0);
    body.matrix.scale(0.18, 0.45, 0.2);
  } else {
    body.matrix.translate(0, -0.19, 0.05);
    body.matrix.rotate(270, 1, 0, 0);
    body.matrix.scale(0.15, 0.45, 0.18);
  }
  body.render();
  
  // Draw Legs 
  function drawLeg(x, y, z, swing) {
    var leg = new Cube();
    leg.color = [0, 0, 0, 1];
    leg.matrix.translate(x, y, z);
    if(g_isWalking) {
      leg.matrix.translate(0.08, 0.8, 0, 1);
      leg.matrix.rotate(180, 0, 0, 1);
      leg.matrix.rotate(swing, 1, 0,0);
    }
    leg.matrix.scale(0.08, 0.45, 0.08);
    leg.render();
  
    // gold Stripes - 3 per leg
    for (var s = 0; s < 3; s++) {
      var lStripe = new Cube();
      lStripe.color = [1.0, 0.84, 0.0, 1.0];
      lStripe.matrix = new Matrix4(leg.matrix);
      lStripe.matrix.translate(-0.1, 0.15 + (s * 0.3), -0.1); 
      lStripe.matrix.scale(1.2, 0.08, 1.2); 
      lStripe.render();
    }
  }

  if(!g_isWalking) {
    // front-left
    drawLeg(-0.15, -0.99, -0.05, 0);
    // front -right
    drawLeg(0.07, -0.99, -0.05, 0);
    // back-left
    drawLeg(-0.1, -0.99, 0.15, 0); 
    // back-right 
    drawLeg(0.01, -0.99, 0.15, 0);
  } else {
    // front-left
    drawLeg(-0.15, -0.99, -0.3, g_walkAnim);
    // front -right
    drawLeg(0.07, -0.99, -0.3, -g_walkAnim);
    // back-left
    drawLeg(-0.1, -0.99, 0.4, -g_walkAnim); 
    // back-right 
    drawLeg(0.01, -0.99, 0.4, g_walkAnim);
  }

  // Draw a neck
  var neck = new Cube();
  neck.color = [0.996, 0.894, 0.565, 1.0];

  if(g_isWalking ) {
    neck.matrix.setTranslate(0, -0.55, -0.4);
  } else {
    neck.matrix.setTranslate(0, -0.5, 0.0);
  }
  neck.matrix.rotate(-5, 1, 0, 0);
  neck.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  var yellowCoordinatesMat = new Matrix4(neck.matrix);
  neck.matrix.scale(0.17, 0.1, 0.14);
  neck.matrix.translate(-0.5, 5, -0.4);
  neck.render();

  // necklace
  var sapphire = new Sphere();
  sapphire.color = [0,0,1,1];
  sapphire.matrix = new Matrix4(yellowCoordinatesMat);
  sapphire.matrix.translate(0, 0.5, -0.08);
  neck.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  sapphire.matrix.scale(0.025, 0.03, 0.02);
  sapphire.render();
  // rubby 1
  var rubby1 = new Sphere();
  rubby1.color = [1,0,0,1];
  rubby1.matrix = new Matrix4(yellowCoordinatesMat);
  rubby1.matrix.translate(0.09, 0.5, -0.06);
  neck.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  rubby1.matrix.scale(0.01, 0.01, 0.01);
  rubby1.render();
  // rubby 2
  var rubby2 = new Sphere();
  rubby2.color = [1,0,0,1];
  rubby2.matrix = new Matrix4(yellowCoordinatesMat);
  rubby2.matrix.translate(-0.09, 0.5, -0.06);
  neck.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  rubby2.matrix.scale(0.01, 0.01, 0.01);
  rubby2.render();

  // mid body
  var mid = new Sphere();
  mid.color = [0, 0, 0, 0.93]; 
  if(!g_isWalking) {
    mid.matrix.translate(0, -0.32, -0.025);
    mid.matrix.rotate(-g_yellowAngle, -0.5, 0, 1);
    mid.matrix.scale(0.125, 0.4, 0.125);
  } else {
    g_Animation = false;
    mid.matrix.translate(0, -0.15, -0.3);
    mid.matrix.rotate(-40, 1, 0, 0); 
    mid.matrix.rotate(-g_yellowAngle, 0, 1, 0);
    mid.matrix.scale(0.125, 0.2, 0.125); 
  }
  mid.render();

  // Cat head
  var head = new Sphere();
  head.color = [0, 0, 0, 1]; 
  head.matrix = yellowCoordinatesMat;
  head.matrix.translate(0, 0.65, 0);
  head.matrix.rotate(g_magentaAngle, 0, 0, 1);
  head.matrix.scale(0.125, 0.125, 0.125); 
  head.render();
  // snot and eyes
  var snout = new Sphere();
  snout.color = [0.1, 0.1, 0.1, 1];
  snout.matrix = new Matrix4(head.matrix);
  snout.matrix.translate(0, -0.2, -0.8); 
  snout.matrix.scale(0.3, 0.35, 0.4); 
  snout.render();

  // --- Nose ---
  var nose = new Cube();
  nose.color = [0.97, 0.76, 0.92, 1.0];
  nose.matrix = new Matrix4(snout.matrix);
  nose.matrix.translate(-0.2, 0.2, -1);
  nose.matrix.scale(0.4, 0.3, 0.3);
  nose.render();

  // Eyes
  function drawCatEye(side) {
    var eye = new Sphere();
    eye.color = [1.0, 0.84, 0.0, 1.0];
    eye.matrix = new Matrix4(head.matrix);
    eye.matrix.translate(side * 0.4, 0.2, -0.8); 
    eye.matrix.scale(0.3, 0.3, 0.2); 
    eye.render();

    // Pupil
    var pupil = new Cube();
    pupil.color = [0, 0, 0, 1];
    pupil.matrix = new Matrix4(eye.matrix);
    pupil.matrix.translate(-0.1, -0.5, -1);
    pupil.matrix.scale(0.4, 0.7, 0.1);
    pupil.render();
  }
  drawCatEye(-1);
  drawCatEye(1);

  // Ears
  var leftEar = new Cone();
  leftEar.color = [0.1, 0.1, 0.1, 1];
  leftEar.matrix = new Matrix4(head.matrix);
  leftEar.matrix.translate(-0.6, 0.5, 0);
  leftEar.matrix.rotate(20+g_ears, 0, 0, 1);
  leftEar.matrix.scale(0.8, 1.0, 0.5); 
  leftEar.render();

  var rightEar = new Cone();
  rightEar.color = [0.1, 0.1, 0.1, 1];
  rightEar.matrix = new Matrix4(head.matrix);
  rightEar.matrix.translate(0.6, 0.5, 0);
  rightEar.matrix.rotate(-20-g_ears, 0, 0, 1);
  rightEar.matrix.scale(0.8, 1.0, 0.5);
  rightEar.render();

  // Ears-inner
  var innerLeftEar = new Cone();
  innerLeftEar.color = [0.97, 0.76, 0.92, 1.0];
  innerLeftEar.matrix = new Matrix4(head.matrix);
  innerLeftEar.matrix.translate(-0.6, 0.5, -0.1);
  innerLeftEar.matrix.rotate(20+g_ears, 0, 0, 1);
  innerLeftEar.matrix.scale(0.6, 0.8, 0.5); 
  innerLeftEar.render();

  var innerRightrightEar = new Cone();
  innerRightrightEar.color = [0.97, 0.76, 0.92, 1.0];
  innerRightrightEar.matrix = new Matrix4(head.matrix);
  innerRightrightEar.matrix.translate(0.6, 0.5, -0.1);
  innerRightrightEar.matrix.rotate(-20-g_ears, 0, 0, 1);
  innerRightrightEar.matrix.scale(0.6, 0.8, 0.5);
  innerRightrightEar.render();
  
  // Tail
  var tailSegments = 8; 
  var baseTailMatrix = new Matrix4(body.matrix); 
  baseTailMatrix.translate(0.5, -0.7, 0.5);
  
  for (var i = 0; i < tailSegments; i++) {
    var segment = new Cube();
    segment.color = [0, 0, 0, 1.0];
    
    //big sweeping movement: 
    var angle = Math.sin(g_tailAngle  + (i * 0.5)) * 20; 
    
    //joint
    baseTailMatrix.rotate(angle, 0, 1, 0);
    baseTailMatrix.rotate(-15, 1, 0, 0);
    
    segment.matrix = new Matrix4(baseTailMatrix);
    var taper = 0.15 * (1 - (i / tailSegments) * 0.5);
    segment.matrix.scale(taper, taper, 0.3);
    segment.matrix.translate(-0.5, -0.5, 0);

    // add gold to the last segment!!!!!!!!
    if (i == tailSegments - 1) {
      segment.color = [1.0, 0.84, 0.0, 1.0];
    } else {
      segment.color = [0, 0, 0, 1.0];
    }
    
    segment.render();
    baseTailMatrix.translate(0, 0, 0.3); 
  }
  // var k = 20;
  // for (var i=0; i<k; i++){
  //   var c = new Cube();
  //   c.matrix.translate(-0.8, 1.9*i/k-1, 0);
  //   c.matrix.rotate(g_seconds*100, 1,1,1);
  //   c.matrix.scale(0.1,0.5/k, 1.0/k);
  //   c.render();
  // }

  // Check the time of the end drawing
  var duration = performance.now() - startTime;
  sendTextToHtml(" ms: " + Math.floor(duration) + " fps: "+ Math.floor(10000/duration));
  
}

function addActionsForHtmlUI() {
  // ON/OFF Buttons
  document.getElementById('on').onclick = function() {
    g_Animation=true;
    console.log('on',g_Animation);
  };
  document.getElementById('off').onclick = function() {
    g_Animation=false;
    console.log('off',g_Animation);
  };
  document.getElementById('mOn').onclick = function() {
    g_magentaAnimation=true;
    console.log('on',g_magentaAnimation);
  };
  document.getElementById('mOff').onclick = function() {
    g_magentaAnimation=false;
    console.log('off',g_magentaAnimation);
  };
  document.getElementById('tOn').onclick = function() {
    g_tailAnimation=true;
    console.log('on',g_tailAnimation);
  };
  document.getElementById('tOff').onclick = function() {
    g_tailAnimation=false;
    console.log('off',g_tailAnimation);
  };


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

  // Angle Slider
  document.getElementById('angleSlide').addEventListener('mousemove', function() {
    g_globalAngle = this.value;
    renderScene();
    console.log('angle', g_globalAngle);
  });

  // Yellow/Magenta Arm Slider
  document.getElementById('yellowSlide').addEventListener('mousemove', function() {
    g_yellowAngle = this.value;
    renderScene();
    console.log('yellow angle', g_yellowAngle);
  });
  document.getElementById('magentaSlide').addEventListener('mousemove', function() {
    g_magentaAngle = this.value;
    renderScene();
    console.log('magenta angle', g_magentaAngle);
  });
  document.getElementById('tailSlide').addEventListener('mousemove', function() {
    g_tailAngle = this.value;
    renderScene();
    console.log('tail angle', g_tailAngle);
  });
  
  // Set random BG
  document.getElementById('randomBG').onclick = function() {
    const r = Math.random();
    const g = Math.random();
    const b = Math.random();
    g_BGColor = [r,g,b,1];
    gl.clearColor(r, g, b, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    renderScene();
    console.log(`New BG: ${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)}`);
  };  
  
  // Eraser
  document.getElementById('eraser').onclick = function() {
    g_selectedShape = ERASER;
    g_selectedColor = g_BGColor.slice();
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

function addMouseControls(canvas) {
  canvas.onmousemove = function(ev) {
    if (ev.buttons == 1) { 
      g_globalAngleX = -ev.movementX / 4; 
      g_globalAngleY = -ev.movementY / 4;
      
      // Update
      renderScene();
    }
  };
}
