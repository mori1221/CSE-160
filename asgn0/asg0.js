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
  // refaw canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);  
  // read x and y for v1
  let v1x = document.getElementById("vx").value;
  let v1y = document.getElementById("vy").value;
  console.log(v1x, v1y);
  // create vector
  newVector = new Vector3([v1x, v1y, 0]);
  // draw line
  drawVector(newVector, 'red');

}
