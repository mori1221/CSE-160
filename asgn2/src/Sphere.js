class Sphere{
    constructor() {
      this.type = "sphere";
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
      this.segments = 12; // Increase for more smoothness
    }
  
    render() {
      var rgba = this.color;
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      let d = Math.PI / this.segments;
      let dd = Math.PI / this.segments;
  
      for (let t = 0; t < Math.PI; t += d) {
        for (let r = 0; r < 2 * Math.PI; r += r) {
          // Spherical to Cartesian conversion
          // p1 = top-left, p2 = bottom-left, p3 = bottom-right, p4 = top-right
          let p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];
          let p2 = [Math.sin(t+d)*Math.cos(r), Math.sin(t+d)*Math.sin(r), Math.cos(t+d)];
          let p3 = [Math.sin(t+d)*Math.cos(r+dd), Math.sin(t+d)*Math.sin(r+dd), Math.cos(t+d+d)];
          let p4 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
  
          gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
          drawTriangle3D([p1[0],p1[1],p1[2], p2[0],p2[1],p2[2], p4[0],p4[1],p4[2]]);
          drawTriangle3D([p3[0],p3[1],p3[2], p4[0],p4[1],p4[2], p2[0],p2[1],p2[2]]);
        }
      }
    }
}