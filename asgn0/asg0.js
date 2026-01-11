// DrawTriangle.js (c) 2012 matsuda

// Global variables
let canvas;
let ctx;

/** the main */
function main() {
   // Retrieve <canvas> element
   canvas = document.getElementById('asg0');  

  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

  // Draw a black rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);       // Fill a rectangle with the color

  // Initialize vectors
  v1 = new Vector3([2.25, 2.25, 0]);

  // Call drawing functions
  drawVector(v1, 'red');

}

/** the drawing function */
function drawVector(v, color) {
  ctx.strokeStyle = color;
  let cx = canvas.width/2;
  let cy = canvas.height/2;
  let vx = v.elements[0] * 20;
  let vy = v.elements[1] * 20;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + vx, cy - vy);
  ctx.stroke();
}

/** drawing function  */
function handleDrawEvent() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // redraw canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);  
  // read x and y for v1
  let v1x = document.getElementById("vx").value;
  let v1y = document.getElementById("vy").value;
  // read x and y for v2
  let v2x = document.getElementById("v2x").value;
  let v2y = document.getElementById("v2y").value;
  console.log('v1:', v1x, v1y);
  console.log('v2:', v2x, v2y);
  // create vectors
  newVector1 = new Vector3([v1x, v1y, 0]);
  newVector2 = new Vector3([v2x, v2y, 0]);
  // draw line
  drawVector(newVector1, 'red');
  drawVector(newVector2, 'blue');
}
/** handle operations */
function handleDrawOperationEvent() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // redraw canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // read x and y for v1
  let v1x = document.getElementById("vx").value;
  let v1y = document.getElementById("vy").value;
  // read x and y for v2
  let v2x = document.getElementById("v2x").value;
  let v2y = document.getElementById("v2y").value;
  console.log('v1:', v1x, v1y);
  console.log('v2:', v2x, v2y);
  // read select options + read scale
  let selectedOption = document.getElementById('select').value;
  let scale = document.getElementById('sca').value;
  console.log('Operation:', selectedOption);
  console.log('Scale:', scale);
  // create vectors
  v1 = new Vector3([v1x, v1y, 0]);
  v2 = new Vector3([v2x, v2y, 0]);
  v3 = new Vector3([0, 0, 0]);
  v4 = new Vector3([0, 0, 0]);
  // operation 
  if (selectedOption == 'add') {
    v3.add(v1, v2);
  } else if (selectedOption == 'sub') {
    v3.sub(v1, v2);
  } else if (selectedOption == 'mul') {
    v3.mul(v1, scale);
    v4.mul(v2, scale);
  } else if (selectedOption == 'div') {
    v3.div(v1, scale);
    v4.div(v2, scale);
  } else if (selectedOption == 'mag') {
    let v1m = v1.magnitude();
    console.log('Magnitude v1: ', v1m);
    let v2m = v2.magnitude();
    console.log('Magnitude v2: ', v2m);
  } else if (selectedOption == 'nor') {
    v3.set(v1);
    v4.set(v2);
    v3.normalize();
    v4.normalize();
  } else if (selectedOption == 'ang') {
    let angle = angleBetween(v1, v2);
    console.log('Angle: ', angle);
  } else if (selectedOption == 'are') {
    let area = areaTriangle(v1, v2);
    console.log('Area of the triangle:', area);
  }
  // draw line
  drawVector(v1, 'red');
  drawVector(v2, 'blue');
  drawVector(v3, 'green');
  drawVector(v4, 'green');
}

/** compute the angle between v1 and v2 */
function angleBetween(v1, v2) {
  let theta = Math.acos(Vector3.dot(v1, v2) / (v1.magnitude() * v2.magnitude()));
  let angle = theta * 180 / Math.PI;
  return angle;
}

/** compute the area of triangle */
function areaTriangle(v1, v2) {
  let crossProduct = Vector3.cross(v1, v2);
  let area = (crossProduct.magnitude()) / 2;
  return area;
}
