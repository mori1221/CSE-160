// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;

  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  
  void main() {
    //gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor; //Use color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0,1.0); //Use UV debug color
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV); //Use texture0
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else {
      gl_FragColor = vec4(1, 0.2, 0.2, 1); //error
    }
  }`

// Global Variables
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const ERASER = 3;
let canvas;
let gl;
let a_Position;
let a_UV
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_whichTexture;
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
let g_tunaPos = null;     
let g_catPos = {x: 0, z: 0}; // Cat's current world position
let g_catSpeed = 0.02;

function main() {
  
  // Set up canvas and gl var
  setupWebGL();
  // Set up GLSL shader programs and connect to GLSL var
  connectVariableToGLSL();
  // Set up actions for HTML and UI
  addActionsForHtmlUI();

  document.onkeydown = keydown;

  initTextures();

  // Register function (event handler) to be called on a mouse press
  // canvas.onmousedown = click;
  // canvas.onmousedown = function(ev) {
  //   if (ev.shiftKey) {
  //       g_isWalking = true;  // The cat "pokes" into action and starts running!
  //       // console.log("Poke! Cat is now running.");


  //       setTimeout(function() {
  //         g_isWalking = false;
  //       }, 3000);
  //   }
  // };

  canvas.onmousemove = function(ev) {
    let sensitivity = 0.2;
    let deltaX = ev.movementX * sensitivity;
    g_camera.onMove(deltaX);
    renderScene();
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.3, 0, 0.9, 0.5);

  requestAnimationFrame(tick);

}

/** ------------------------------------------------------------------------ */
var g_startTime=performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function initTextures() {
  // Create an image object
  var image = new Image(); 
  if(!image) {
    console.log('Failed to create image');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendImageToTEXTTURE0(image); };
  // Tell the browser to load an image
  image.src = 'images/sky.png';


  // Floor texture
  var image1 = new Image();
  image1.onload = function(){ sendImageToTEXTTURE1(image1); };
  image1.src = 'images/wood-floor.png';

  // Wall texture
  var image2 = new Image();
  image2.onload = function(){ sendImageToTEXTTURE2(image2); };
  image2.src = 'images/wall.png';

  // Broken Wall texture
  var image3 = new Image();
  image3.onload = function(){ sendImageToTEXTTURE3(image3); };
  image3.src = 'images/broken-wall.png';

  return true;
}

function sendImageToTEXTTURE0(image){
  // Create a texture object
  var texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create texture');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable the texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  console.log('Finished loadTexture');
}

function sendImageToTEXTTURE1(image){
  // Create a texture object
  var texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create texture');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable the texture unit 0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 1);

  console.log('Finished loadTexture');
}

function sendImageToTEXTTURE2(image) {
   // Create a texture object
   var texture = gl.createTexture();
   if(!texture) {
     console.log('Failed to create texture');
     return false;
   }
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
   // Enable the texture unit 0
   gl.activeTexture(gl.TEXTURE2);
   // Bind the texture object to the target
   gl.bindTexture(gl.TEXTURE_2D, texture);
   // Set the texture parameters
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
   // Set the texture image
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
   // Set the texture unit 0 to the sampler
   gl.uniform1i(u_Sampler2, 2);
}

function sendImageToTEXTTURE3(image) {
  // Create a texture object
  var texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create texture');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable the texture unit 0
  gl.activeTexture(gl.TEXTURE3);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler3, 3);
}

function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;

  if (g_tunaPos !== null) {
    // target in world coordinates
    let targetX = g_tunaPos.x - 16;
    let targetZ = g_tunaPos.z - 16;

    // direction
    let dx = targetX - g_catPos.x;
    let dz = targetZ - g_catPos.z;
    let distance = Math.sqrt(dx*dx + dz*dz);

    if (distance > 0.1) {
        // Move toward tuna
        g_catPos.x += (dx / distance) * g_catSpeed;
        g_catPos.z += (dz / distance) * g_catSpeed;
        g_isWalking = true;
    } else {
        // Cat reached the tuna!
        g_tunaPos = null;
        g_isWalking = false;
        console.log("Eat Tuna!");
    }
  }

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
    // console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);

}

function connectVariableToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      // console.log('Failed to intialize shaders.');
      return;
    }
  
    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      // console.log('Failed to get the storage location of a_Position');
      return;
    }

    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
      console.log('Failed to get the storage location of a_UV');
      return;
    }
  
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      // console.log('Failed to get the storage location of u_FragColor');
      return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if(!u_ModelMatrix) {
      // console.log('Failed to get the storage location of u_ModelMatrix');
      return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if(!u_GlobalRotateMatrix) {
      // console.log('Failed to get the storage location of u_GlobalRotateMatrix');
      return;
    }

    // Get the storage location of u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if(!u_ViewMatrix) {
      // console.log('Failed to get the storage location of u_ViewMatrix');
      return;
    }

    // Get the storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if(!u_ProjectionMatrix) {
      // console.log('Failed to get the storage location of u_ProjectionMatrix');
      return;
    }

    // Get the storage location of the u_Sampler
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if(!u_Sampler0) {
      console.log('Failed to create storage location u_Sampler0');
      return false;
    }

    // Get the storage location of the u_Sampler
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');

    u_Sampler2 =  gl.getUniformLocation(gl.program, 'u_Sampler2');
    u_Sampler3 =  gl.getUniformLocation(gl.program, 'u_Sampler3');
  
  
    // Get the storage location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
      console.log('Failed to get the storage location of u_whichTexture');
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
      // console.log('ear',g_ears);
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

var g_eye = [0, 0, 3];
var g_at = [0, 0, -100];
var g_up = [0, 1, 0];

var g_camera = new Camera();

// var g_map=[
//   [1, 1, 1, 1, 1, 1, 1, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 1, 1, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 1, 1, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 0, 1],
// ];

var g_map = [];
for (let i = 0; i < 32; i++) {
  g_map[i] = new Array(32).fill(0);
}

function drawMap() {
  for (x=0; x<32; x++){
    for (y=0; y<32;y++) {
      if(x==0 || x==31 || y==0 || y==31){
        var body = new Cube();
        body.textureNum = 2;
        body.color = [0.8,1,1,1];
        body.matrix.translate(0, -0.85, 0);
        body.matrix.scale(0.3, 0.3, 0.3);
        body.matrix.translate(x-16, 0, y-16);
        body.renderfast();
      }
    }
  }
}

/** Draw every elements that is supposed to be formed a cat. */
function renderScene() {

  if (!u_whichTexture) {
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  }
  gl.uniform1i(u_whichTexture, 0);
  
  // Check how long it takes to draw
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(40, 1*canvas.width/canvas.height, 1,100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix 
  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2], 
    g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2], 
    g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]
  );
  // viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]);
  //viewMat.setLookAt(0,0,3, 0,0,-100, 0,1,0); // (eye, at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  
  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0,1,0);
  globalRotMat.rotate(g_globalAngleX, 0, 1, 0); 
  globalRotMat.rotate(g_globalAngleY, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw Map
  drawMap();

  // Draw the floor
  var body = new Cube();
  body.color = [1, 0, 0, 1];
  body.textureNum = 1;
  body.matrix.translate(0,-1, 0);
  body.matrix.scale(10,5,15);
  body.matrix.translate(-0.5, 0, -0.5);
  body.render();

  // Draw the floor
  var body = new Cube();
  body.color = [1, 0, 0, 1];
  body.textureNum = 1;
  body.matrix.translate(0,-1, 0);
  body.matrix.scale(10,0,10);
  body.matrix.translate(-0.5, 0, -0.5);
  body.render();

  // Room 
  var leftWall = new Cube();
  leftWall.color = [1, 1, 1, 1];
  leftWall.textureNum = 3;
  leftWall.matrix.translate(-5, -0.87, 0);
  leftWall.matrix.scale(0.1, 4, 10);       
  leftWall.matrix.translate(-0.5, 0, -0.5);
  leftWall.render();

  var rightWall = new Cube();
  rightWall.color = [1, 1, 1, 1];
  rightWall.textureNum = 3;
  rightWall.matrix.translate(5, -0.87, 0);  
  rightWall.matrix.scale(0.1, 4, 10);     
  rightWall.matrix.translate(-0.5, 0, -0.5); 
  rightWall.render();


  var frontWall = new Cube();
  frontWall.color = [1, 1, 1, 1];
  frontWall.textureNum = 3;
  frontWall.matrix.translate(0, -0.87, -5); 
  frontWall.matrix.scale(10, 4, 0.1);     
  frontWall.matrix.translate(-0.5, 0, -0.5); 
  frontWall.render();

  var door = new Cube();
  door.color = [0.4, 0.2, 0, 1];
  door.textureNum = -2; 
  door.matrix.translate(0, -0.87, -4.9); 
  door.matrix.scale(1.9, 3, 0.05); 
  door.matrix.translate(-0.5, 0, -0.5); 
  door.render();

  var knob = new Cube();
  knob.color = [1, 0.84, 0, 1]; 
  knob.textureNum = -2;     
  knob.matrix.translate(0.7, 0.5, -4.85); 
  knob.matrix.scale(0.1, 0.1, 0.1); 
  knob.matrix.translate(-0.5, 0, -0.5); 
  knob.render();

 
  var backWall = new Cube();
  backWall.color = [1, 1, 1, 1];
  backWall.textureNum = 3;
  backWall.matrix.translate(0, -0.87, 5);  
  backWall.matrix.scale(10, 4, 0.1);       
  backWall.matrix.translate(-0.5, 0, -0.5); 
  backWall.render()

  // Draw a sky
  var sky = new Cube();
  sky.color = [1,0,0, 1];
  sky.textureNum =0;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  // Draw Tuna
  if (g_tunaPos) {
    var tuna = new Cube();
    // tuna.textureNum = -5; // Or a specific tuna texture
    tuna.color = [1, 0.5, 0, 1];
    tuna.matrix.translate(g_tunaPos.x - 16, -0.8, g_tunaPos.z - 16);
    tuna.matrix.scale(0.2, 0.1, 0.2);
    tuna.render();
  }

  //---------------------- CAT -------------------------------//
  var catBaseMat = new Matrix4();
  catBaseMat.translate(g_catPos.x, 0, g_catPos.z);
  // Draw the cat body cube
  var body = new Sphere();
  body.color = [0, 0, 0.0, 1];
  body.textureNum = -2;
  body.matrix = new Matrix4(catBaseMat);
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
    leg.textureNum = 6;
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
  // Add tuna or not
  document.getElementById('addTuna').onclick = handleAddTuna;
  document.getElementById('deleteTuna').onclick = () => { g_tunaPos = null; g_isWalking = false; };
  // ON/OFF Buttons
  document.getElementById('on').onclick = function() {
    g_Animation=true;
    // console.log('on',g_Animation);
  };
  document.getElementById('off').onclick = function() {
    g_Animation=false;
    // console.log('off',g_Animation);
  };
  document.getElementById('mOn').onclick = function() {
    g_magentaAnimation=true;
    // console.log('on',g_magentaAnimation);
  };
  document.getElementById('mOff').onclick = function() {
    g_magentaAnimation=false;
    // console.log('off',g_magentaAnimation);
  };
  document.getElementById('tOn').onclick = function() {
    g_tailAnimation=true;
    // console.log('on',g_tailAnimation);
  };
  document.getElementById('tOff').onclick = function() {
    g_tailAnimation=false;
    // console.log('off',g_tailAnimation);
  };

  // Angle Slider
  document.getElementById('angleSlide').addEventListener('mousemove', function() {
    g_globalAngle = this.value;
    renderScene();
    // console.log('angle', g_globalAngle);
  });

  // Yellow/Magenta Arm Slider
  document.getElementById('yellowSlide').addEventListener('mousemove', function() {
    g_yellowAngle = this.value;
    renderScene();
    // console.log('yellow angle', g_yellowAngle);
  });
  document.getElementById('magentaSlide').addEventListener('mousemove', function() {
    g_magentaAngle = this.value;
    renderScene();
    // console.log('magenta angle', g_magentaAngle);
  });
  document.getElementById('tailSlide').addEventListener('mousemove', function() {
    g_tailAngle = this.value;
    renderScene();
    // console.log('tail angle', g_tailAngle);
  });
  document.getElementById('earSlide').addEventListener('mousemove', function() {
    g_ears = parseFloat(this.value);
    renderScene();
    // console.log('ear angle', g_ears);
  });
  
  // Set random BG
  // document.getElementById('randomBG').onclick = function() {
  //   const r = Math.random();
  //   const g = Math.random();
  //   const b = Math.random();
  //   g_BGColor = [r,g,b,1];
  //   gl.clearColor(r, g, b, 1.0);
  //   gl.clear(gl.COLOR_BUFFER_BIT);
  //   renderScene();
  //   // console.log(`New BG: ${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)}`);
  // };  
  
  // Eraser
  // document.getElementById('eraser').onclick = function() {
  //   g_selectedShape = ERASER;
  //   g_selectedColor = g_BGColor.slice();
  // };
}

function sendTextToHtml(text, htmlID) {
  var htmlElm = document.getElementById('numdot');
  if (!htmlElm) {
    // console.log('Failed to get ' + htmlID);
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

// Change it to WASD
function keydown(ev) {
  if (ev.key == 'w' || ev.key == 'W') {
    g_camera.forward();
  } else if (ev.key == 's' || ev.key == 'S') {
    g_camera.back();
  } else if (ev.key == 'a' || ev.key == 'A') {
    g_camera.left();
  } else if (ev.key == 'd' || ev.key == 'D') {
    g_camera.right();
  } else if (ev.key == 'q' || ev.key == 'Q') {
    g_camera.panRight();
  } else if (ev.key == 'e' || ev.key == 'E') {
    g_camera.panLeft();
  } else if (ev.key == 'z' || ev.key == 'Z') {
    let pos = g_camera.getLookedAtGrid();
    if (pos.x >= 0 && pos.x < 32 && pos.z >= 0 && pos.z < 32) {
        g_map[pos.x][pos.z] += 1;
    }
  } else if (ev.key == 'x' || ev.key == 'X') {
    let pos = g_camera.getLookedAtGrid();
    if (pos.x >= 0 && pos.x < 32 && pos.z >= 0 && pos.z < 32) {
        if (g_map[pos.x][pos.z] > 0) g_map[pos.x][pos.z] -= 1; 
    }
  }

  renderScene(); 
}

function handleAddTuna() {
  let pos = g_camera.getLookedAtGrid();
  g_tunaPos = pos;
  g_isWalking = true;
  console.log("Tuna placed at:", pos.x, pos.z);
}

function saveWorld() {
  localStorage.setItem("myWorld", JSON.stringify(g_map));
  console.log("World Saved!");
}

function loadWorld() {
  let saved = localStorage.getItem("myWorld");
  if (saved) {
      g_map = JSON.parse(saved);
      renderScene();
  }
}