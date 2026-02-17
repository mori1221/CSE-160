class Cone {
    constructor() {
      this.type = "cone";
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
      this.textureNum = -2;
      this.segments = 12; // High for smoothness, low for a "low-poly" ear
    }
  
    render() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        let segments = 12; 
        let angleStep = 360 / segments;
        
        for (var i = 0; i < 360; i += angleStep) {
            let a1 = i * Math.PI / 180;
            let a2 = (i + angleStep) * Math.PI / 180;
        
            // Apex is at top center (0, 1, 0)
            // Base points are around (0, 0, 0) with radius 0.5
            let p1 = [0.5 * Math.cos(a1), 0, 0.5 * Math.sin(a1)];
            let p2 = [0.5 * Math.cos(a2), 0, 0.5 * Math.sin(a2)];
        
            // Side walls
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            drawTriangle3D([0, 1, 0,  p1[0], p1[1], p1[2],  p2[0], p2[1], p2[2]]);
        
            // Base (Bottom)
            gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
            drawTriangle3D([0, 0, 0,  p2[0], p2[1], p2[2],  p1[0], p1[1], p1[2]]);
        }
    }
  }