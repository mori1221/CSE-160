// prettier-ignore
class Model {
    constructor(gl, filePath) {
        this.filePath = filePath;
        this.color = [1,1,1,1];
        this.matrix = new Matrix4();
        this.isFullyLoaded= false;
        this.getFileContent().then(() => {
            this.vertexBuffer = gl.createBuffer();
            this.normalBuffer = gl.createBuffer();
            if(!this.vertexBuffer || !this.normalBuffer){
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
        //console.log(lines);
        for (let i = 0; i<lines.length; i++){
            const line = lines[i];
            const tokens = line.split(" ");
            if(tokens[0] == 'v'){
                allVertices.push(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
              
              // console.log(line);
            } else if (tokens[0] == 'vn') {
                allNormals.push(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
            } else if (tokens[0] == 'f') {
                for (const face of [tokens[1], tokens[2], tokens[3]]) {
                    const indices = face.split("//");
                    const vertexIndex = (parseInt(indices[0]) -1)*3;
                    const normalIndex = (parseInt(indices[1]) -1)*3;

                    unpackedVerts.push(
                        allVertices[vertexIndex],
                        allVertices[vertexIndex+1],
                        allVertices[vertexIndex+2]
                    )
                    unpackedNormals.push(
                        allNormals[normalIndex],
                        allNormals[normalIndex+1],
                        allNormals[normalIndex+2]
                    )
                }
                // for (const face of tokens.slice(1, 4)) { // Safely get 3 tokens
                //     const indices = face.split("/");
                //     const vIdx = (parseInt(indices[0]) - 1) * 3;
                //     // If there are 3 parts (v/vt/vn), normals are at index 2. 
                //     // If 2 parts (v//vn), normals are at index 2 (split results in empty string at [1]).
                //     const nIdx = (parseInt(indices[indices.length - 1]) - 1) * 3;
            
                //     unpackedVerts.push(allVertices[vIdx], allVertices[vIdx+1], allVertices[vIdx+2]);
                //     unpackedNormals.push(allNormals[nIdx], allNormals[nIdx+1], allNormals[nIdx+2]);
                // }


            }
        }
        this.modelData = {
            vertices: new Float32Array(unpackedVerts),
            normals: new Float32Array(unpackedNormals)
        };
        this.isFullyLoaded = true;
        // console.log('all Vertices', allVertices);
        // console.log('all Normals', allNormals);  
    }

    render(gl, program) {
        if(!this.isFullyLoaded) {
            return;
        }

        //vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(program.a_Position, 3, gl.FLOAT, false, 0 , 0);
        gl.enableVertexAttribArray(program.a_Position);
        
        //normals
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.normals, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(program.a_Normal, 3, gl.FLOAT, false, 0 , 0);
        gl.enableVertexAttribArray(program.a_Normal);

        // set uniform
        gl.uniformMatrix4fv(program.u_ModelMatrix, false, this.matrix.elements);
        gl.uniform4fv(program.u_FragColor, this.color);
        

        //normal Matrix
        let normalMatrix = new Matrix4().setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(program.u_NormalMatrix, false, normalMatrix.elements);
        

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