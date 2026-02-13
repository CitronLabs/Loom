export class HeroController {
    constructor(element) {
        this.canvas = element.querySelector('#hero-gpu-canvas');
        this.gl = this.canvas.getContext('webgl2');
        if (!this.gl) return;

        this.rescale();
        // Assuming your hooking system passes the resize event here
        this.init();
    }

    // This method is called by your built-in hooking system
    onMouseMove(event) {
        // We calculate normalized coordinates: -0.5 to 0.5
        this.mouse = {
            x: (event.clientX / window.innerWidth) - 0.5,
            y: (event.clientY / window.innerHeight) - 0.5
        };
    }

    rescale() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.clientWidth * dpr;
        this.canvas.height = this.canvas.clientHeight * dpr;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    init() {
        const gl = this.gl;
        this.mouse = { x: 0, y: 0 }; // Initialize default state

        const vs = `#version 300 es
            layout(location=0) in vec3 pos;
            layout(location=1) in vec3 color;
            uniform mat4 uProj;
            uniform mat4 uView;
            out vec3 vColor;
            void main() {
                gl_Position = uProj * uView * vec4(pos, 1.0);
                vColor = color;
            }`;

        const fs = `#version 300 es
            precision highp float;
            in vec3 vColor;
            out vec4 fragColor;
            void main() { 
                // Using a softer alpha for a subtler blend
                fragColor = vec4(vColor * vColor, 0.3); 
            }`;

        const prog = this.createProgram(gl, vs, fs);
        gl.useProgram(prog);

        const { positions, colors } = this.getCubeData();
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        this.uploadBuffer(gl, new Float32Array(positions), 0, 3);
        this.uploadBuffer(gl, new Float32Array(colors), 1, 3);

        const uProjLoc = gl.getUniformLocation(prog, "uProj");
        const uViewLoc = gl.getUniformLocation(prog, "uView");

        gl.disable(gl.DEPTH_TEST); 
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE); 

        const render = (time) => {
            const t = time * 0.0004; // Even slower rotation
            gl.clear(gl.COLOR_BUFFER_BIT);

            const aspect = this.canvas.width / this.canvas.height;
            const p = this.getPerspective(45, aspect, 0.1, 100);
            
            const s = Math.sin(t), c = Math.cos(t);
            
            // Subtler Parallax: factor reduced from 2.5 down to 0.5
            const mx = this.mouse.x * 0.5;
            const my = this.mouse.y * 0.5;

            const v = [
                c,  s*s,  s,  0,
                0,  c,   -s,  0,
               -s,  c*s,  c,  0,
                mx, my,  -8,  1  // Pushed back further to -8 for a smaller, cleaner look
            ];

            gl.uniformMatrix4fv(uProjLoc, false, p);
            gl.uniformMatrix4fv(uViewLoc, false, v);
            
            gl.drawArrays(gl.TRIANGLES, 0, 36);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    getPerspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov * Math.PI / 360);
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) / (near - far), -1,
            0, 0, (2 * near * far) / (near - far), 0
        ];
    }

    uploadBuffer(gl, data, loc, size) {
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    }

    createProgram(gl, vsSrc, fsSrc) {
        const s = (t, src) => {
            const sh = gl.createShader(t);
            gl.shaderSource(sh, src);
            gl.compileShader(sh);
            return sh;
        };
        const p = gl.createProgram();
        gl.attachShader(p, s(gl.VERTEX_SHADER, vsSrc));
        gl.attachShader(p, s(gl.FRAGMENT_SHADER, fsSrc));
        gl.linkProgram(p);
        return p;
    }

    getCubeData() {
        const positions = [
            -1,-1, 1,  1,-1, 1,  1, 1, 1, -1,-1, 1,  1, 1, 1, -1, 1, 1,
            -1,-1,-1, -1, 1,-1,  1, 1,-1, -1,-1,-1,  1, 1,-1,  1,-1,-1,
             1,-1,-1,  1, 1,-1,  1, 1, 1,  1,-1,-1,  1, 1, 1,  1,-1, 1,
            -1,-1,-1, -1,-1, 1, -1, 1, 1, -1,-1,-1, -1, 1, 1, -1, 1,-1,
            -1, 1,-1, -1, 1, 1,  1, 1, 1, -1, 1,-1,  1, 1, 1,  1, 1,-1,
            -1,-1,-1,  1,-1,-1,  1,-1, 1, -1,-1,-1,  1,-1, 1, -1,-1, 1
        ];

        const colors = [
            0.8,0.1,0.1, 0.8,0.1,0.1, 0.8,0.1,0.1, 0.8,0.1,0.1, 0.8,0.1,0.1, 0.8,0.1,0.1, 
            0.1,0.8,0.1, 0.1,0.8,0.1, 0.1,0.8,0.1, 0.1,0.8,0.1, 0.1,0.8,0.1, 0.1,0.8,0.1, 
            0.1,0.1,0.8, 0.1,0.1,0.8, 0.1,0.1,0.8, 0.1,0.1,0.8, 0.1,0.1,0.8, 0.1,0.1,0.8, 
            0.8,0.8,0.1, 0.8,0.8,0.1, 0.8,0.8,0.1, 0.8,0.8,0.1, 0.8,0.8,0.1, 0.8,0.8,0.1, 
            0.8,0.1,0.8, 0.8,0.1,0.8, 0.8,0.1,0.8, 0.8,0.1,0.8, 0.8,0.1,0.8, 0.8,0.1,0.8, 
            0.1,0.8,0.8, 0.1,0.8,0.8, 0.1,0.8,0.8, 0.1,0.8,0.8, 0.1,0.8,0.8, 0.1,0.8,0.8  
        ];
        
        return { positions, colors };
    }
}
