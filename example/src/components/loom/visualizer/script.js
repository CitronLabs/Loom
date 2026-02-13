
export class GraphicsController {
    constructor(element) {
        this.el = element;
        this.glCanvas = element.querySelector('#gl-canvas');
        this.gpuCanvas = element.querySelector('#gpu-canvas');
        
        this.initWebGL();
        this.initWebGPU();
    }

   initWebGL() {
    const gl = this.glCanvas.getContext('webgl');
    if (!gl) {
        console.error("WebGL context could not be created.");
        return;
    }

    // Force the viewport to match the internal resolution
    gl.viewport(0, 0, this.glCanvas.width, this.glCanvas.height);

    // Set a bright color to confirm the buffer is being swapped
    gl.clearColor(0.6, 0.3, 0.9, 1.0); // Purple
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    console.log("WebGL: Canvas cleared to purple.");
  }
    async initWebGPU() {
     if (!navigator.gpu) {
        this.gpuCanvas.style.background = "red"; // Visual error indicator
        console.error("WebGPU is not supported on this browser.");
        return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();
    const context = this.gpuCanvas.getContext('webgpu');
    const format = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device: device,
        format: format,
        alphaMode: 'opaque' // Better for debugging solid colors
    });

    const commandEncoder = device.createCommandEncoder();
    
    // A RenderPass is required even for a simple clear
    const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0.0, g: 0.5, b: 0.5, a: 1.0 }, // Teal
            loadOp: 'clear',
            storeOp: 'store'
        }]
    });
    
    passEncoder.end();
    
    // Finalize and push to the GPU
    device.queue.submit([commandEncoder.finish()]);
    console.log("WebGPU: Command buffer submitted.");    }
}
