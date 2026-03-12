class Sphere {
  constructor() {
    this.type = "sphere";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render() {
    var rgba = this.color;
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    var d = 15; // Step size in degrees
    for (var t = 0; t < 180; t += d) {
      for (var r = 0; r < 360; r += d) {
        // Convert polar coordinates (t=latitude, r=longitude) to Cartesian (x,y,z)
        // Point 1
        var x1 = Math.sin(t * Math.PI/180) * Math.cos(r * Math.PI/180);
        var y1 = Math.sin(t * Math.PI/180) * Math.sin(r * Math.PI/180);
        var z1 = Math.cos(t * Math.PI/180);

        // Point 2 (down one step)
        var x2 = Math.sin((t+d) * Math.PI/180) * Math.cos(r * Math.PI/180);
        var y2 = Math.sin((t+d) * Math.PI/180) * Math.sin(r * Math.PI/180);
        var z2 = Math.cos((t+d) * Math.PI/180);

        // Point 3 (down and right one step)
        var x3 = Math.sin((t+d) * Math.PI/180) * Math.cos((r+d) * Math.PI/180);
        var y3 = Math.sin((t+d) * Math.PI/180) * Math.sin((r+d) * Math.PI/180);
        var z3 = Math.cos((t+d) * Math.PI/180);

        // Point 4 (right one step)
        var x4 = Math.sin(t * Math.PI/180) * Math.cos((r+d) * Math.PI/180);
        var y4 = Math.sin(t * Math.PI/180) * Math.sin((r+d) * Math.PI/180);
        var z4 = Math.cos(t * Math.PI/180);

        // Face 1
        drawTriangle3D([x1, y1, z1,  x2, y2, z2,  x4, y4, z4]);
        // Face 2
        drawTriangle3D([x2, y2, z2,  x3, y3, z3,  x4, y4, z4]);
      }
    }
  }
}