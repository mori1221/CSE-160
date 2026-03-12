// prettier-ignore
class Model {
    constructor(gl, filePath) {
        this.gl = gl;
        this.filePath = filePath;
        this.color = [1,1,1,1];
        this.matrix = new Matrix4();
        this.isFullyLoaded= false;
        this.textureNum;
        this.getFileContent().then(() => {
            this.vertexBuffer = gl.createBuffer();
            this.normalBuffer = gl.createBuffer();
            this.uvBuffer = gl.createBuffer();
            this.isFullyLoaded = true;
            if(!this.vertexBuffer || !this.normalBuffer || !this.uvBuffer) {
                console.log('Failed to create buffer for', this.filePath);
                return;
            }
            // console.log(this.modelData);  
        }); 
    }

    async parseModel(fileContent) {
        const lines = fileContent.split("\n");
        const allVertices = [];
        const allNormals = [];
        const unpackedVerts = [];
        const unpackedNormals = [];
        const unpackedUVs = [];
        const allUVs = [];
        //console.log(lines);
        for (let i = 0; i<lines.length; i++){
            const line = lines[i];
            if (!line || line.startsWith('#')) continue;
            const tokens = line.split(/\s+/);
            if(tokens[0] == 'v'){
                allVertices.push(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
              
              // console.log(line);
            } else if (tokens[0] == 'vn') {
                allNormals.push(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
            }else if (tokens[0] == 'vt') {
                allUVs.push(parseFloat(tokens[1]), parseFloat(tokens[2]));
            } else if (tokens[0] == 'f') {
                for (let i = 1; i < tokens.length; i++) {
                    if (!tokens[i]) continue;
                    
                    const indices = tokens[i].split("/");
                    
                    // Vertex index is always first
                    const vIdx = (parseInt(indices[0]) - 1) * 3;

                    // Find uvs
                    if (indices[1]) {
                        const uvIdx = (parseInt(indices[1]) - 1) * 2;
                        unpackedUVs.push(allUVs[uvIdx], allUVs[uvIdx+1]);
                    } else {
                        // Fallback if no UVs exist in the file
                        unpackedUVs.push(0, 0);
                    }
                    
                    // Normal index is always last (works for v//vn and v/vt/vn)
                    const nIdx = (parseInt(indices[indices.length - 1]) - 1) * 3;
            
                    if (!isNaN(vIdx)) {
                        unpackedVerts.push(allVertices[vIdx], allVertices[vIdx+1], allVertices[vIdx+2]);
                    }
                    if (!isNaN(nIdx)) {
                        unpackedNormals.push(allNormals[nIdx], allNormals[nIdx+1], allNormals[nIdx+2]);
                    }
                    
                }
                
                // for (const face of [tokens[1], tokens[2], tokens[3]]) {
                //     const indices = face.split("//");
                //     const vertexIndex = (parseInt(indices[0]) -1)*3;
                //     const normalIndex = (parseInt(indices[1]) -1)*3;

                //     unpackedVerts.push(
                //         allVertices[vertexIndex],
                //         allVertices[vertexIndex+1],
                //         allVertices[vertexIndex+2]
                //     )
                //     unpackedNormals.push(
                //         allNormals[normalIndex],
                //         allNormals[normalIndex+1],
                //         allNormals[normalIndex+2]
                //     )
                // }
            }
        }

        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        for (let i = 0; i < unpackedVerts.length; i += 3) {
            minX = Math.min(minX, unpackedVerts[i]); maxX = Math.max(maxX, unpackedVerts[i]);
            minY = Math.min(minY, unpackedVerts[i+1]); maxY = Math.max(maxY, unpackedVerts[i+1]);
            minZ = Math.min(minZ, unpackedVerts[i+2]); maxZ = Math.max(maxZ, unpackedVerts[i+2]);
        }
        let midX = (minX + maxX) / 2, midY = (minY + maxY) / 2, midZ = (minZ + maxZ) / 2;
        let range = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
        for (let i = 0; i < unpackedVerts.length; i += 3) {
            unpackedVerts[i] = (unpackedVerts[i] - midX) / range;
            unpackedVerts[i+1] = (unpackedVerts[i+1] - midY) / range;
            unpackedVerts[i+2] = (unpackedVerts[i+2] - midZ) / range;
        }
        this.modelData = {
            vertices: new Float32Array(unpackedVerts),
            normals: new Float32Array(unpackedNormals),
            uvs: new Float32Array(unpackedUVs)
        };
        this.isFullyLoaded = true;
    }

    render() {
        if (!this.isFullyLoaded || !this.modelData || !this.modelData.vertices) {
            return; 
        }

        //vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0 , 0);
        gl.enableVertexAttribArray(a_Position);

        //uvs
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.uvs, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);
        
        //normals
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.normals, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0 , 0);
        gl.enableVertexAttribArray(a_Normal);

        // set uniform
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform4fv(u_FragColor, this.color);
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform1f(u_texColorWeight, 0.0);
        

        //normal Matrix
        let normalMatrix = new Matrix4();
        if (typeof g_globalRotateMatrix !== 'undefined') {
            normalMatrix.set(g_globalRotateMatrix);
        }
        if (typeof a_UV !== 'undefined' && a_UV >= 0) {
            gl.disableVertexAttribArray(a_UV); 
        }
        normalMatrix.multiply(this.matrix);
        normalMatrix.setInverseOf(normalMatrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        // let normalMatrix = new Matrix4().setInverseOf(this.matrix);
        // normalMatrix.transpose();
        // gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
        gl.uniform1f(u_texColorWeight, 0.0);        
        gl.drawArrays(gl.TRIANGLES, 0, this.modelData.vertices.length /3);
        
    }

    async getFileContent() {
        try {
            const response = await fetch(this.filePath);
            if (!response.ok) throw new Error(`Could not load file "${this.filePath}". Are you sure the file name/path are correct?`);

            const fileContent = await response.text();
            this.parseModel(fileContent);
        } catch (e) {
            throw new Error(`Something went wrong when loading ${this.filePath}. Error: ${e}`);
        }
    }
}