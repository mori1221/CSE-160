class Cube {
    constructor(){
      this.type="cube";
    //   this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
    //   this.size = 5.0;
    //   this.segments = 10;
      this.matrix = new Matrix4();
      this.textureNum = -2;
      this.cubeVerts32 = new Float32Array([
        0,0,0,  1,1,0,  1,0,0
        ,
        0,0,0,  0,1,0,  1,1,0
        ,
        0,1,0,  0,1,1,  1,1,1
        ,
        0,1,0,  1,1,1,  1,1,0
        ,
        0,0,0, 1,0,1, 1,0,0
        ,
        0,0,0, 0,0,1, 1,0,1
        ,
        0,0,1, 1,1,1, 1,0,1
        ,
        0,0,1, 0,1,1, 1,1,1,
        ,
        0,0,0, 0,1,1, 0,1,0
        ,
        0,0,0, 0,0,1, 0,1,1
        ,
        1,0,0, 1,1,0, 1,1,1
        ,
        1,0,0, 1,1,1, 1,0,1

      ]);
      this.cubeVert = [
        0,0,0,  1,1,0,  1,0,0
        ,
        0,0,0,  0,1,0,  1,1,0
        ,
        0,1,0,  0,1,1,  1,1,1
        ,
        0,1,0,  1,1,1,  1,1,0
        ,
        0,0,0, 1,0,1, 1,0,0
        ,
        0,0,0, 0,0,1, 1,0,1
        ,
        0,0,1, 1,1,1, 1,0,1
        ,
        0,0,1, 0,1,1, 1,1,1,
        ,
        0,0,0, 0,1,1, 0,1,0
        ,
        0,0,0, 0,0,1, 0,1,1
        ,
        1,0,0, 1,1,0, 1,1,1
        ,
        1,0,0, 1,1,1, 1,0,1

      ];
    }
  
    render() {
      var rgba = this.color;  
      // Pass the position of a point to a_Position variable
      // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

      // Pass the texture number
      gl.uniform1i(u_whichTexture, this.textureNum);

      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // Pass the matrix to u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      // Front of cube
      drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0, 1,1 ,1,0]);
      drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0, 0,1 ,1,1]);
      // drawTriangle3D([0,0,0,  1,1,0,  1,0,0]);
      // drawTriangle3D([0,0,0,  0,1,0,  1,1,0]);

      // Top of Cube
      gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
      drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [0,0, 0,1 ,1,1]);
      drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);
      // drawTriangle3D([0,1,0,  0,1,1,  1,1,1]);
      // drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);
      
      

      // Bottom
      gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
      drawTriangle3DUV([0,0,0, 1,0,1, 1,0,0], [0,1, 1,0, 1,1]);
      drawTriangle3DUV([0,0,0, 0,0,1, 1,0,1], [0,1, 0,0, 1,0]);
      // drawTriangle3D([0,0,0,  1,0,1,  1,0,0]);
      // drawTriangle3D([0,0,0,  0,0,1,  1,0,1]);

      // Back
      gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
      drawTriangle3DUV([0,0,1, 1,1,1, 1,0,1], [1,0, 0,1, 0,0]);
      drawTriangle3DUV([0,0,1, 0,1,1, 1,1,1], [1,0, 1,1, 0,1]);
      // drawTriangle3D([0,0,1,  1,1,1,  1,0,1]);
      // drawTriangle3D([0,0,1,  0,1,1,  1,1,1]);

      // Left
      gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
      // drawTriangle3D([0,0,0,  0,1,1,  0,1,0]);
      // drawTriangle3D([0,0,0,  0,0,1,  0,1,1]);
      drawTriangle3DUV([0,0,0, 0,1,1, 0,1,0], [1,0, 0,1, 1,1]);
      drawTriangle3DUV([0,0,0, 0,0,1, 0,1,1], [1,0, 0,0, 0,1]);

      // Right
      gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
      drawTriangle3DUV([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1]);
      drawTriangle3DUV([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0]);
      // drawTriangle3D([1,0,0,  1,1,0,  1,1,1]);
      // drawTriangle3D([1,0,0,  1,1,1,  1,0,1]);
    }

    renderfast() {
      var rgba = this.color;  
      // Pass the position of a point to a_Position variable
      // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

      // Pass the texture number
      gl.uniform1i(u_whichTexture, this.textureNum);

      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // Pass the matrix to u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      var allverts=[];

      // Front of cube
      allverts=allverts.concat([0,0,0,  1,1,0,  1,0,0]);
      allverts=allverts.concat([0,0,0,  0,1,0,  1,1,0]);

      drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0, 1,1 ,1,0]);
      drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0, 0,1 ,1,1]);
      // drawTriangle3D([0,0,0,  1,1,0,  1,0,0]);
      // drawTriangle3D([0,0,0,  0,1,0,  1,1,0]);

      // Top of Cube
      allverts=allverts.concat([0,1,0,  0,1,1,  1,1,1]);
      allverts=allverts.concat([0,1,0, 1,1,1, 1,1,0]);
      gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
      drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [0,0, 0,1 ,1,1]);
      drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);
      // drawTriangle3D([0,1,0,  0,1,1,  1,1,1]);
      // drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);
      
      

      // Bottom
      allverts=allverts.concat([0,0,0, 1,0,1, 1,0,0]);
      allverts=allverts.concat([0,0,0, 0,0,1, 1,0,1]);
      gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
      // drawTriangle3DUV([0,0,0, 1,0,1, 1,0,0], [0,1, 1,0, 1,1]);
      // drawTriangle3DUV([0,0,0, 0,0,1, 1,0,1], [0,1, 0,0, 1,0]);
      // drawTriangle3D([0,0,0,  1,0,1,  1,0,0]);
      // drawTriangle3D([0,0,0,  0,0,1,  1,0,1]);

      // Back
      allverts=allverts.concat([0,0,1, 1,1,1, 1,0,1]);
      allverts=allverts.concat([0,0,1, 0,1,1, 1,1,1]);
      gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
      // drawTriangle3DUV([0,0,1, 1,1,1, 1,0,1], [1,0, 0,1, 0,0]);
      // drawTriangle3DUV([0,0,1, 0,1,1, 1,1,1], [1,0, 1,1, 0,1]);
      // drawTriangle3D([0,0,1,  1,1,1,  1,0,1]);
      // drawTriangle3D([0,0,1,  0,1,1,  1,1,1]);

      // Left
      allverts=allverts.concat([0,0,0, 0,1,1, 0,1,0]);
      allverts=allverts.concat([0,0,0, 0,0,1, 0,1,1]);
      gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
      // drawTriangle3D([0,0,0,  0,1,1,  0,1,0]);
      // drawTriangle3D([0,0,0,  0,0,1,  0,1,1]);
      // drawTriangle3DUV([0,0,0, 0,1,1, 0,1,0], [1,0, 0,1, 1,1]);
      // drawTriangle3DUV([0,0,0, 0,0,1, 0,1,1], [1,0, 0,0, 0,1]);

      // Right
      allverts=allverts.concat([1,0,0, 1,1,0, 1,1,1]);
      allverts=allverts.concat([1,0,0, 1,1,1, 1,0,1]);
      gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
      // drawTriangle3DUV([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1]);
      // drawTriangle3DUV([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0]);
      // drawTriangle3D([1,0,0,  1,1,0,  1,1,1]);
      // drawTriangle3D([1,0,0,  1,1,1,  1,0,1]);

      drawTriangle3D(allverts)
    }

    renderfaster() {
      var rgba = this.color;  
      // Pass the position of a point to a_Position variable
      // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
      // Pass the texture number
      gl.uniform1i(u_whichTexture, this.textureNum);

      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // Pass the matrix to u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

     
      initTriangle3D();
      
       

      // gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
      // gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      // gl.enableVertexAttribArray(a_Position);

      gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}