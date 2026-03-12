class Camera{
    constructor() {
        this.eye = new Vector3();
        this.eye.elements.set([0, 0, 3]);

        this.at = new Vector3();
        this.at.elements.set([0, 0, -100]);

        this.up = new Vector3();
        this.up.elements.set([0, 1, 0]);
    }

    forward() {
        // var f = this.at.subtract(this.eye);
        // f=f.divide(f.length());
        // this.at = this.at.add(f);
        // this.eye=this.eye.add(f);
        let f = [0, 0, 0];
        // f = at - eye
        f[0] = this.at.elements[0] - this.eye.elements[0];
        f[1] = this.at.elements[1] - this.eye.elements[1];
        f[2] = this.at.elements[2] - this.eye.elements[2];

        // Normalize
        let len = Math.sqrt(f[0]*f[0] + f[1]*f[1] + f[2]*f[2]);
        f[0] /= len; f[1] /= len; f[2] /= len;

        // eye = eye + f; at = at + f
        this.eye.elements[0] += f[0]; this.eye.elements[1] += f[1]; this.eye.elements[2] += f[2];
        this.at.elements[0] += f[0];  this.at.elements[1] += f[1];  this.at.elements[2] += f[2];
    }
    back() {
        // var f = this.at.subtract(this.eye);
        // f = f.divide(f.length());
        // this.eye = this.eye.subtract(f);
        // this.at = this.at.subtract(f);
        let f = [0, 0, 0];
        f[0] = this.at.elements[0] - this.eye.elements[0];
        f[1] = this.at.elements[1] - this.eye.elements[1];
        f[2] = this.at.elements[2] - this.eye.elements[2];

        let len = Math.sqrt(f[0]*f[0] + f[1]*f[1] + f[2]*f[2]);
        f[0] /= len; f[1] /= len; f[2] /= len;

        // eye = eye - f; at = at - f
        this.eye.elements[0] -= f[0]; this.eye.elements[1] -= f[1]; this.eye.elements[2] -= f[2];
        this.at.elements[0] -= f[0];  this.at.elements[1] -= f[1];  this.at.elements[2] -= f[2];
    }
    left() {
        // var f = this.at.subtract(this.eye);
        // f = f.divide(f.length());
        // var s = Vector3.cross(f, this.up); 
        // s = s.divide(s.length());
        // this.eye = this.eye.subtract(s);
        // this.at = this.at.subtract(s);
        let f = [0, 0, 0];
        f[0] = this.at.elements[0] - this.eye.elements[0];
        f[1] = this.at.elements[1] - this.eye.elements[1];
        f[2] = this.at.elements[2] - this.eye.elements[2];

        // s = f x up
        let s = [0, 0, 0];
        s[0] = f[1] * this.up.elements[2] - f[2] * this.up.elements[1];
        s[1] = f[2] * this.up.elements[0] - f[0] * this.up.elements[2];
        s[2] = f[0] * this.up.elements[1] - f[1] * this.up.elements[0];

        // Normalize s
        let len = Math.sqrt(s[0]*s[0] + s[1]*s[1] + s[2]*s[2]);
        s[0] /= len; s[1] /= len; s[2] /= len;

        this.eye.elements[0] -= s[0]; this.eye.elements[1] -= s[1]; this.eye.elements[2] -= s[2];
        this.at.elements[0] -= s[0];  this.at.elements[1] -= s[1];  this.at.elements[2] -= s[2];
    }
    right() {
        // var f = this.at.subtract(this.eye);
        // f = f.divide(f.length());
        // var s = Vector3.cross(this.up, f); 
        // s = s.divide(s.length());
        // this.eye = this.eye.add(s);
        // this.at = this.at.add(s);
        let f = [0, 0, 0];
        f[0] = this.at.elements[0] - this.eye.elements[0];
        f[1] = this.at.elements[1] - this.eye.elements[1];
        f[2] = this.at.elements[2] - this.eye.elements[2];

        // s = f x up
        let s = [0, 0, 0];
        s[0] = f[1] * this.up.elements[2] - f[2] * this.up.elements[1];
        s[1] = f[2] * this.up.elements[0] - f[0] * this.up.elements[2];
        s[2] = f[0] * this.up.elements[1] - f[1] * this.up.elements[0];

        // Normalize s
        let len = Math.sqrt(s[0]*s[0] + s[1]*s[1] + s[2]*s[2]);
        s[0] /= len; s[1] /= len; s[2] /= len;

        // Add s to move right
        this.eye.elements[0] += s[0]; this.eye.elements[1] += s[1]; this.eye.elements[2] += s[2];
        this.at.elements[0] += s[0];  this.at.elements[1] += s[1];  this.at.elements[2] += s[2];
    }

    panLeft() {
        // Calculate the forward vector f = at - eye
        let f = new Vector3();
        f.elements[0] = this.at.elements[0] - this.eye.elements[0];
        f.elements[1] = this.at.elements[1] - this.eye.elements[1];
        f.elements[2] = this.at.elements[2] - this.eye.elements[2];

        // Rotate f by alpha degrees (let's use 5 degrees)
        // Rotation formulas for Y-axis rotation:
        // x' = x cos(a) - z sin(a)
        // z' = x sin(a) + z cos(a)
        let alpha = 5 * Math.PI / 180; // Convert 5 degrees to radians
        let x = f.elements[0];
        let z = f.elements[2];
        
        f.elements[0] = x * Math.cos(alpha) - z * Math.sin(alpha);
        f.elements[2] = x * Math.sin(alpha) + z * Math.cos(alpha);

        // Update the 'at' vector: at = eye + f
        this.at.elements[0] = this.eye.elements[0] + f.elements[0];
        this.at.elements[1] = this.eye.elements[1] + f.elements[1];
        this.at.elements[2] = this.eye.elements[2] + f.elements[2];
    }

    panRight() {
        let f = new Vector3();
        f.elements[0] = this.at.elements[0] - this.eye.elements[0];
        f.elements[1] = this.at.elements[1] - this.eye.elements[1];
        f.elements[2] = this.at.elements[2] - this.eye.elements[2];

        // Use -5 degrees for panning right
        let alpha = -5 * Math.PI / 180; 
        let x = f.elements[0];
        let z = f.elements[2];
        
        f.elements[0] = x * Math.cos(alpha) - z * Math.sin(alpha);
        f.elements[2] = x * Math.sin(alpha) + z * Math.cos(alpha);

        this.at.elements[0] = this.eye.elements[0] + f.elements[0];
        this.at.elements[1] = this.eye.elements[1] + f.elements[1];
        this.at.elements[2] = this.eye.elements[2] + f.elements[2];
    }

    onMove(degrees) {
        let f = new Vector3();
        f.elements[0] = this.at.elements[0] - this.eye.elements[0];
        f.elements[1] = this.at.elements[1] - this.eye.elements[1];
        f.elements[2] = this.at.elements[2] - this.eye.elements[2];
        let alpha = -degrees * Math.PI / 180; 
        let x = f.elements[0];
        let z = f.elements[2];
        f.elements[0] = x * Math.cos(alpha) - z * Math.sin(alpha);
        f.elements[2] = x * Math.sin(alpha) + z * Math.cos(alpha);
        this.at.elements[0] = this.eye.elements[0] + f.elements[0];
        this.at.elements[1] = this.eye.elements[1] + f.elements[1];
        this.at.elements[2] = this.eye.elements[2] + f.elements[2];
    }

    getLookedAtGrid() {
        // 1. Calculate forward vector
        let f = [
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ];
        
        // 2. Normalize f
        let len = Math.sqrt(f[0]*f[0] + f[1]*f[1] + f[2]*f[2]);
        f[0]/=len; f[1]/=len; f[2]/=len;
    
        // 3. Project a point 2 units in front of camera
        let targetX = this.eye.elements[0] + f[0] * 2;
        let targetZ = this.eye.elements[2] + f[2] * 2;
    
        // 4. Map back to grid (assuming your map is 32x32 centered at 0,0)
        // Map -16...16 to 0...32
        let x = Math.floor(targetX + 16);
        let z = Math.floor(targetZ + 16);
    
        return {x: x, z: z};
    }
}
