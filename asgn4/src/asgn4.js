// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;

  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;

  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix;
  
  void main() {
    //gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0)));
    // v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;

  uniform vec4 u_FragColor;
  uniform vec3 u_cameraPos;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler6;
  uniform int u_whichTexture;
  uniform float u_texColorWeight;
  uniform vec3 u_lightPos;
  uniform float u_specularOn;
  uniform bool u_lightOn;
  uniform vec3 u_lightColor;
  void main() {
    vec4 texColor = vec4(1.0);
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0); //Use normal for debug color
    } else if (u_whichTexture == -2) {
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
    } else if (u_whichTexture == 4) {
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    } else if (u_whichTexture == 5) {
      gl_FragColor = mix(u_FragColor, texColor, u_texColorWeight);
    } else if (u_whichTexture == 6) {
      gl_FragColor = texture2D(u_Sampler6, v_UV);
    } else {
      gl_FragColor = vec4(1, 0.2, 0.2, 1); //error
    }

    vec3 lightVector =  u_lightPos - vec3(v_VertPos);
    float r=length(lightVector);
    // if(r < 1.0){
    //   gl_FragColor = vec4(1, 0, 0, 1);
    // } else if (r < 2.0) {
    //   gl_FragColor = vec4(0, 1, 0, 1);
    // }
    // Light falloff visualization 1/r^2
    // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r), 1);
    // gl_FragColor = vec4(vec3(gl_FragColor) * max(dot(normalize(v_Normal), normalize(u_lightPos - vec3(v_VertPos))), 0.0), gl_FragColor.a);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);
    gl_FragColor.a = 1.0;

    // Reflection
    vec3 R = reflect(-L, N);

    // eye
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

    // Specular
    float specular = pow(max(dot(R, E), 0.0), 60.0) * u_specularOn;
    vec3 specularColor = specular * u_lightColor;

    vec3 diffuse = vec3(gl_FragColor) * u_lightColor * nDotL *0.7; // Diffuse light
    vec3 ambient = vec3(gl_FragColor) * u_lightColor * 0.3; // Ambient light
    //vec3 specular = vec3(1.0) * pow(max(dot(reflect(-L, N), normalize(-v_VertPos.xyz)), 0.0), 16.0); // Specular highlight
    if (u_lightOn) {
      gl_FragColor = vec4(diffuse + ambient + specularColor, gl_FragColor.a);
      // if(u_whichTexture == 0) {
      //   gl_FragColor = vec4(diffuse + ambient + specularColor, gl_FragColor.a);
      // } else {
      //   gl_FragColor = vec4(diffuse + ambient, gl_FragColor.a);
      // }
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
let u_lightPos;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_NormalMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_texColorWeight;
let g_userBlocks = [];
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler6;
let g_catRotation = 0;
let u_whichTexture;
let u_cameraPos;
let u_specularOn;
let u_lightOn;
let u_lightColor;
let g_lightColor = [1, 1, 1];
let g_selectedColor = [0,0,0,1.0];
let g_selectedSize = 5;
let g_selectedShape = POINT;
let g_selectedSegments = 10;
let g_BGColor = [0, 0, 0, 1.0];
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_ears = 0;
let g_Animation = true;
let g_magentaAnimation = false;
let g_isWalking = false;
let g_walkAnim = 0;
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_tailAnimation = true;
let g_tailAngle = 0;
var g_shapesList = [] // The array for the color, scale, and position of a mouse press
let g_tunaPos = null;     
let g_catPos = {x: 0, z: 0}; // Cat's current world position
let g_catSpeed = 0.02;
let g_normalOn = false;
let g_lightOn = true;
let g_lightPos = [0, 1, 1];
var g_catHouse;

function main() {
  
  // Set up canvas and gl var
  setupWebGL();
  // Set up GLSL shader programs and connect to GLSL var
  connectVariableToGLSL();
  // Set up actions for HTML and UI
  addActionsForHtmlUI();

  // g_catHouse = new Model('cat-house.json');

  document.onkeydown = keydown;

  initTextures();

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

  //Fish (tuna/salmon?)
  var image4 = new Image();
  image4.onload = function(){ sendImageToTEXTTURE4(image4); };
  image4.src = 'images/fish.jpg';

  // Ice
  var image5 = new Image();
  image5.onload = function(){ sendImageToTEXTTURE5(image5); };
  image5.src = 'images/ice.png';


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

function sendImageToTEXTTURE4(image) {
  // Create a texture object
  var texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create texture');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable the texture unit 0
  gl.activeTexture(gl.TEXTURE4);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler4, 4);
}

function sendImageToTEXTTURE5(image) {
   // Create a texture object
   var texture = gl.createTexture();
   if(!texture) {
     console.log('Failed to create texture');
     return false;
   }
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
   // Enable the texture unit 0
   gl.activeTexture(gl.TEXTURE6);
   // Bind the texture object to the target
   gl.bindTexture(gl.TEXTURE_2D, texture);
   // Set the texture parameters
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
   // Set the texture image
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
   // Set the texture unit 0 to the sampler
   gl.uniform1i(u_Sampler6, 6);
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
        g_catRotation = Math.atan2(dx, dz) * (180 / Math.PI);
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

    // Get the storage location of a_Normal
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
      console.log('Failed to get the storage location of a_Normal');
      return;
    }
  
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      // console.log('Failed to get the storage location of u_FragColor');
      return;
    }

    // Get the storage location of u_lightPos
    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');

    // Get the storage location of u_cameraPos
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');

    // Get the storage location of u_specularOn
    u_specularOn = gl.getUniformLocation(gl.program, 'u_specularOn');

    // Get the storage location of u_lightOn
    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');

    // Get the storage location of u_lightColor
    u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');

    // Get the storage location of u_NormalMatrix
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');

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
    u_Sampler4 =  gl.getUniformLocation(gl.program, 'u_Sampler4');
    u_Sampler6 =  gl.getUniformLocation(gl.program, 'u_Sampler6');

    u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  
  
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
  g_lightPos[0] = Math.cos(g_seconds) * 2;
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
  gl.uniform1f(u_specularOn, 0.0);
  
  // Check how long it takes to draw
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(70, 1*canvas.width/canvas.height, 1,100);
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
  drawUserBlocks();

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
  sky.color = [0.8,0.8,0.8, 1];
  sky.textureNum =0;
  if(g_normalOn) {
    sky.textureNum = -3
  };
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.021, -0.5);
  // Transition from Day (Blue) to Sunset (Orange) to Night (Dark Purple)
  let dayCycle = Math.sin(g_seconds * 0.5); 
  let r = 0.3 + (0.4 * dayCycle); 
  let g = 0.5 + (0.2 * dayCycle);
  let b = 0.9 * Math.max(0.2, dayCycle);
  gl.uniform1f(u_texColorWeight, 0.5);
  gl.uniform4f(u_FragColor, r, g, b, 1.0);
  sky.render();

  // Draw Tuna
  if (g_tunaPos) {
    var tuna = new Cube();
    tuna.textureNum = 4;
    let bounce = Math.sin(g_seconds * 5) * 0.1;
    tuna.matrix.translate(g_tunaPos.x - 16, -0.7 + bounce, g_tunaPos.z - 16);
    tuna.matrix.rotate(g_seconds * 100, 0, 1, 0); // Spin!
    tuna.matrix.scale(0.2, 0.1, 0.2);
    gl.uniform1f(u_texColorWeight, 0.5);
    gl.uniform4f(u_FragColor, 1, 1, 0.5, 1);
    tuna.render();
  }
  
  
  // Draw the Light
  gl.uniform1f(u_specularOn, 1.0);
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  gl.uniform1f(u_lightOn, g_lightOn);
  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
  var light = new Cube();
  light.color = [2, 2, 0, 1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1, -0.1, -0.1);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.render();

  // Draw the light Sphere
  var ball = new SphereLight();
  ball.color = [0, 1, 0.8, 1];
  if(g_normalOn) {
    ball.textureNum = -3
  };
  ball.matrix.translate(0.9, 0.1, 0);
  ball.matrix.scale(0.4, 0.4, 0.4);
  ball.render();
  

  //---------------------- CAT -------------------------------//
  let pulse = Math.abs(Math.sin(g_seconds * 10)); // Creates a flashing value 0.0 to 1.0
  var catBaseMat = new Matrix4();
  catBaseMat.translate(g_catPos.x, 0, g_catPos.z);
  catBaseMat.rotate(g_catRotation+180, 0, 1, 0);
  // Draw the cat body cube
  var body = new Sphere();
  body.color = [0, 0, 0.0, 1];
  body.textureNum = -2;
  body.matrix = new Matrix4(catBaseMat);
  if(!g_isWalking) {
    body.matrix.translate(0, -0.55, 0.1);
    body.matrix.rotate(-10,1,0,0);
    body.matrix.scale(0.18, 0.45, 0.2);
    gl.uniform1f(u_texColorWeight, 0.0);
  } else {
    body.matrix.translate(0, -0.19, 0.05);
    body.matrix.rotate(270, 1, 0, 0);
    body.matrix.scale(0.15, 0.45, 0.18);
    // Make the cat glow gold when it's running!
    gl.uniform1f(u_texColorWeight, pulse); 
    gl.uniform4f(u_FragColor, 1.0, 0.84, 0.0, 1.0);
  }
  body.render();
  
  // Draw Legs 
  function drawLeg(x, y, z, swing) {
    var leg = new Cube();
    leg.color = [0, 0, 0, 1];
    leg.textureNum = -2;
    leg.matrix = new Matrix4(catBaseMat);
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
  neck.matrix = new Matrix4(catBaseMat);
  neck.color = [0.996, 0.894, 0.565, 1.0];
  if(g_isWalking ) {
    neck.matrix.translate(0, -0.55, -0.4);
  } else {
    neck.matrix.translate(0, -0.5, 0.0);
  }
  neck.matrix.rotate(-5, 1, 0, 0);
  neck.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  var yellowCoordinatesMat = new Matrix4(neck.matrix);
  var tempNormalMatrix = new Matrix4();
  neck.matrix.scale(0.17, 0.1, 0.14);
  neck.matrix.translate(-0.5, 5, -0.4);
  tempNormalMatrix.set(globalRotMat).multiply(neck.matrix);
  neck.normalMatrix.setInverseOf(tempNormalMatrix).transpose();
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
  mid.matrix = new Matrix4(catBaseMat);
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
  var tempNormalMatrix = new Matrix4();
  tempNormalMatrix.set(globalRotMat).multiply(mid.matrix);
  mid.normalMatrix.setInverseOf(tempNormalMatrix).transpose();
  mid.render();

  // Cat head
  var head = new Sphere();
  head.color = [0, 0, 0, 1]; 
  head.matrix = new Matrix4(catBaseMat);
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
  // normals
  document.getElementById('normalOn').onclick = function() { g_normalOn = true; };
  document.getElementById('normalOff').onclick = function() { g_normalOn = false; };
  // lights 
  document.getElementById('lightOn').onclick = function() { g_lightOn = true; };
  document.getElementById('lightOff').onclick = function() { g_lightOn = false; };
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

  // Light Sliders
  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) {
    if(ev.buttons == 1) {
      g_lightPos[0] = this.value/100;
      renderScene();
    }
  });
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) {
    if(ev.buttons == 1) {
      g_lightPos[1] = this.value/100;
      renderScene();
    }
  });
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) {
    if(ev.buttons == 1) {
      g_lightPos[2] = this.value/100;
      renderScene();
    }
  });

  //Light Color Sliders
  document.getElementById('lightR').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_lightColor[0] = this.value/100; renderScene(); 
    }
  });
  document.getElementById('lightG').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_lightColor[1] = this.value/100; renderScene(); 
    }
  });
  document.getElementById('lightB').addEventListener('mousemove', function(ev) { 
    if(ev.buttons == 1) {
      g_lightColor[2] = this.value/100; renderScene(); 
    }
  });

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

  if (ev.code === 'Space') {
    // Direction = At - Eye
    let dx = g_camera.at.elements[0] - g_camera.eye.elements[0];
    let dz = g_camera.at.elements[2] - g_camera.eye.elements[2];
    
    // Normalize and pick a distance (e.g., 2 units in front)
    let mag = Math.sqrt(dx*dx + dz*dz);
    let nx = (dx/mag) * 2;
    let nz = (dz/mag) * 2;

    let blockX = Math.round(g_camera.eye.elements[0] + nx);
    let blockZ = Math.round(g_camera.eye.elements[2] + nz);

    g_userBlocks.push({x: blockX, z: blockZ, y: -0.85}); 
    console.log("Block placed at:", blockX, blockZ);
    
    ev.preventDefault(); // Prevent page from jumping down
  } 

  if (ev.key === 'j' || ev.key === 'J') {
    // Remove the most recent block (Last In, First Out)
    if (g_userBlocks.length > 0) {
        g_userBlocks.pop();
        console.log("Block removed");
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

function drawUserBlocks() {
  for (let i = 0; i < g_userBlocks.length; i++) {
    let b = g_userBlocks[i];
    let cube = new Cube();
    cube.textureNum = 6;
    cube.matrix.translate(b.x, b.y, b.z);
    cube.render();
  }
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
