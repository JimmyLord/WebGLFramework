class ImGui
{
    constructor(gl, canvas)
    {
        this.gl = gl;
        this.canvas = canvas;

        // Persistent values.
        this.drawList = [];
        this.windows = {};
        this.currentTime = 0;
        this.ownsMouse = false;
        this.lastTimeMouseClicked = [ 0, 0, 0 ];
        this.mouseChange = new vec2(0);
        this.lastMousePosition = new vec2(0);
        this.activeWindow = null;
        this.activeControl = null;
        this.windowBeingMoved = null;
        this.windowBeingResized = null;
        this.windowMoved = false;
        this.oldMouseButtons = [ false, false, false ];
        this.stateIsDirty = false;

        // Persistent values within single frame.

        // Settings.
        this.scale = 2;
        this.padding = new vec2(2);
        this.doubleClickTime = 0.3;

        // Inputs.
        this.mousePosition = new vec2(0);
        this.mouseButtons = [ false, false, false ];
        
        // Outputs.
        this.isHoveringWindow = false;
        this.isHoveringControl = false;

        // Resources.
        this.VBO = gl.createBuffer();
        this.IBO = gl.createBuffer();

        let imguiVertShaderSource = `
            attribute vec4 a_Position;
            attribute vec2 a_UV;
            attribute vec4 a_Color;

            uniform mat4 u_MatProj;

            varying vec2 v_UV;
            varying vec4 v_Color;

            void main()
            {
                gl_Position = u_MatProj * a_Position;
                v_UV = a_UV;
                v_Color = a_Color;
            }
        `;

        let imguiFragShaderSource = `
            precision mediump float;

            uniform sampler2D u_TextureAlbedo;

            varying vec2 v_UV;
            varying vec4 v_Color;
            
            void main()
            {
                gl_FragColor = texture2D( u_TextureAlbedo, v_UV ).rrrr * 255.0 * v_Color;
            }
        `;

        this.shader = new Shader( gl, imguiVertShaderSource, imguiFragShaderSource );
        this.generateFontTexture();
    }

    generateFontTexture()
    {
        let pixels = new Uint8Array( [
            // Dummy full-white block for window backgrounds and other things. 
            // 1 dummy + 6 unused + 33-38: !"#$%&
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 0,0,0,0,1,0,0,0, 0,0,0,1,0,1,0,0, 0,0,0,1,0,1,0,0, 0,0,0,0,1,0,0,0, 0,1,1,0,0,0,0,0, 0,0,1,1,0,0,0,0,
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 0,0,0,0,1,0,0,0, 0,0,0,1,0,1,0,0, 0,0,0,1,0,1,0,0, 0,1,1,1,1,1,1,0, 0,1,1,0,0,0,1,0, 0,1,0,0,1,0,0,0,
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0, 0,1,1,1,1,1,1,1, 0,1,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,0,1,0,0,0,
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,1,0,1,0,0, 0,1,0,0,1,0,0,0, 0,0,0,0,1,0,0,0, 0,0,1,0,1,0,0,0,
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0, 0,1,1,1,1,1,1,1, 0,1,1,1,1,1,1,0, 0,0,0,1,0,0,0,0, 0,0,0,1,0,0,0,0,
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,1,0,1,0,0, 0,0,0,0,1,0,1,0, 0,0,1,0,0,0,0,0, 0,0,1,0,1,0,1,0,
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,1,0,1,0,0, 0,1,1,1,1,1,1,0, 0,1,0,0,0,1,1,0, 0,1,0,0,0,1,0,0,
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,1,0,1,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,1,0, 0,0,1,1,1,0,1,0,
            // 39-51: '()*+,-./0123
            0,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,1,0,0,0,0, 0,1,0,0,1,0,0,1, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 0,0,1,1,1,1,0,0, 0,0,0,1,1,0,0,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,0,0,
            0,0,0,0,1,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,1,0,1,0,1,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,1,0, 0,0,0,0,0,0,1,0,
            0,0,0,0,0,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,1,1,1,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,1,0, 0,0,0,0,0,0,1,0,
            0,0,0,0,0,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,1,1,1,1,1,1,1, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,1,1,1,1,1,0, 0,0,1,1,1,1,0,0,
            0,0,0,0,0,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,1,1,1,0,0, 0,0,1,1,1,1,1,0, 0,0,0,0,0,0,0,0, 0,1,1,1,1,1,1,0, 0,0,0,0,0,0,0,0, 0,0,0,1,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,0,0,1,0,
            0,0,0,0,0,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,1,0,1,0,1,0, 0,0,0,0,1,0,0,0, 0,0,1,1,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,1,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,0,0,1,0,
            0,0,0,0,0,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,1,0,0,1,0,0,1, 0,0,0,0,1,0,0,0, 0,0,1,1,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,1,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,0,0,1,0,
            0,0,0,0,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,1,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,1,0,0,0,0,0, 1,0,0,0,0,0,0,0, 0,0,1,1,1,1,0,0, 0,0,0,1,1,1,0,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,0,0,
            // 52-64: 456789:;<=>?@
            0,1,0,0,0,0,1,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,1,1,0,0,0, 0,0,1,1,1,1,0,0,
            0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,1,1,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,1,0,0,1,0,0, 0,1,0,0,0,0,1,0,
            0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,1,1,0,0,0, 0,0,0,1,1,0,0,0, 0,0,0,0,1,1,0,0, 0,1,1,1,1,1,1,0, 0,0,1,1,0,0,0,0, 0,0,0,0,0,0,1,0, 0,1,0,1,1,0,1,0,
            0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,0,0,0,0,1,0,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,0,0,0,0,0,0,0, 0,0,0,1,1,0,0,0, 0,0,1,1,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,1,1,0,0, 0,0,0,0,0,0,1,0, 0,1,0,1,1,0,1,0,
            0,0,0,0,0,0,1,0, 0,0,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,1,1,1,1,1,0, 0,0,0,0,0,0,1,0, 0,0,0,0,1,1,0,0, 0,1,0,1,0,0,1,0,
            0,0,0,0,0,0,1,0, 0,0,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,0,0,1,0, 0,0,0,1,1,0,0,0, 0,0,0,1,1,0,0,0, 0,0,1,1,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,1,1,0,0, 0,0,0,1,0,0,0,0, 0,1,0,0,1,1,0,0,
            0,0,0,0,0,0,1,0, 0,0,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,1,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,0,0,1,0, 0,0,0,1,1,0,0,0, 0,0,0,1,1,0,0,0, 0,0,0,0,1,1,0,0, 0,0,0,0,0,0,0,0, 0,0,1,1,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,0,0,0,
            0,0,0,0,0,0,1,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,0,0,1,0,0,0,0, 0,1,1,1,1,1,1,0, 0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,0, 0,0,1,1,0,0,0,0, 0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,1,0,0,0,0, 0,0,1,1,1,0,0,0,
            // 65-77: Upper case A-M
            0,0,0,1,1,0,0,0, 0,1,1,1,1,1,0,0, 0,1,1,1,1,1,0,0, 0,1,1,1,1,1,0,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,0,0, 0,1,1,1,1,1,1,0, 0,1,0,0,0,0,1,0, 0,0,1,1,1,1,1,0, 0,0,0,1,1,1,1,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0,
            0,0,1,0,0,1,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,0,0,0, 0,1,1,0,0,1,1,0,
            0,0,1,0,0,1,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,0,1,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,1,1,0,1,0,
            0,1,0,0,0,0,1,0, 0,1,1,1,1,1,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,1,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0,
            0,1,1,1,1,1,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,0,0,0, 0,1,0,0,1,1,1,0, 0,1,1,1,1,1,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 0,1,1,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0,
            0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,1,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0,
            0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,1,0,0,1,0,0, 0,1,0,0,1,0,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0,
            0,1,0,0,0,0,1,0, 0,1,1,1,1,1,0,0, 0,1,1,1,1,1,0,0, 0,1,1,1,1,1,0,0, 0,1,1,1,1,1,1,0, 0,1,0,0,0,0,0,0, 0,1,1,1,1,1,1,0, 0,1,0,0,0,0,1,0, 0,0,1,1,1,1,1,0, 0,0,0,1,1,0,0,0, 0,1,0,0,0,1,0,0, 0,1,1,1,1,1,0,0, 0,1,0,0,0,0,1,0,
            // 78-90: Upper case N-Z
            0,1,0,0,0,0,1,0, 0,0,1,1,1,1,0,0, 0,1,1,1,1,1,0,0, 0,0,1,1,1,1,0,0, 0,1,1,1,1,1,0,0, 0,0,1,1,1,1,1,0, 0,0,1,1,1,1,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,1,0,0,0,1,0, 0,1,1,1,1,1,1,0,
            0,1,1,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,1,0,0,1,0,0, 0,0,1,0,0,0,1,0, 0,0,0,0,0,0,1,0,
            0,1,0,1,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,1,0,0,1,0,0, 0,0,0,1,0,1,0,0, 0,0,0,0,0,1,0,0,
            0,1,0,0,1,0,1,0, 0,1,0,0,0,0,1,0, 0,1,1,1,1,1,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,1,1,0,0,1,1,0, 0,1,0,0,0,0,1,0, 0,0,0,1,1,0,0,0, 0,0,0,1,0,1,0,0, 0,0,0,0,1,0,0,0,
            0,1,0,0,0,1,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,1,1,1,1,0,0, 0,0,1,1,1,1,0,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,0,1,0,0,1,0,0, 0,1,0,0,0,0,1,0, 0,0,0,1,1,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,1,0,0,0,0,
            0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,1,0,1,0, 0,1,0,0,1,0,0,0, 0,0,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,0,1,0,0,1,0,0, 0,1,0,0,0,0,1,0, 0,0,1,0,0,1,0,0, 0,0,0,0,1,0,0,0, 0,0,1,0,0,0,0,0,
            0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,1,1,0, 0,1,0,0,0,1,0,0, 0,0,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,0,1,1,1,1,0,0, 0,1,0,1,1,0,1,0, 0,0,1,0,0,1,0,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,0,0,
            0,1,0,0,0,0,1,0, 0,0,1,1,1,1,0,0, 0,1,0,0,0,0,0,0, 0,0,1,1,1,1,1,0, 0,1,0,0,0,0,1,0, 0,1,1,1,1,1,0,0, 0,0,0,0,1,0,0,0, 0,0,1,1,1,1,0,0, 0,0,0,1,1,0,0,0, 0,1,1,0,0,1,1,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,1,1,1,1,1,0,
            // TODO 91-103: [\]^_`abcdefg
            0,0,0,1,1,1,0,0, 1,0,0,0,0,0,0,0, 0,0,1,1,1,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0, 0,0,1,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,0,0,1,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,1,0,1,0,0, 0,0,0,0,0,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,1,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,1,1,0,0, 0,0,1,1,1,0,0,0,
            0,0,0,1,0,0,0,0, 0,0,1,0,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,1,0,0,0,1,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,1,0,0, 0,0,0,0,0,0,0,0, 0,0,0,1,0,0,0,0, 0,1,0,0,0,1,0,0,
            0,0,0,1,0,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,1,1,1,0,0,0, 0,1,1,1,1,0,0,0, 0,0,1,1,1,0,0,0, 0,0,1,1,1,1,0,0, 0,0,1,1,1,0,0,0, 0,0,0,1,0,0,0,0, 0,1,0,0,0,1,0,0,
            0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,0,1,1,1,0,0,0, 0,1,0,0,0,1,0,0,
            0,0,0,1,0,0,0,0, 0,0,0,0,0,1,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,1,1,1,0,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,1,0,0, 0,1,1,1,1,1,0,0, 0,0,0,1,0,0,0,0, 0,0,1,1,1,1,0,0,
            0,0,0,1,0,0,0,0, 0,0,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,0,1,0,0,
            0,0,0,1,1,1,0,0, 0,0,0,0,0,0,0,1, 0,0,1,1,1,0,0,0, 0,0,0,0,0,0,0,0, 0,1,1,1,1,1,1,0, 0,0,0,0,0,0,0,0, 0,0,1,1,1,0,1,0, 0,1,1,1,1,0,0,0, 0,0,1,1,1,0,0,0, 0,0,1,1,1,1,0,0, 0,0,1,1,1,1,0,0, 0,0,0,1,0,0,0,0, 0,0,1,1,1,0,0,0,
            // TODO 104-116: hijklmnopqrst
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,1,1,1,0,0,0, 0,0,1,1,1,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,1,0,0,0,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,1,0,0,0,0,
            0,1,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,1,0,0,0,0, 0,0,1,0,0,1,0,0, 0,0,1,1,1,0,0,0, 0,0,1,1,1,0,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,1,0,1,1,0,0,0, 0,0,1,1,1,0,0,0, 0,0,1,1,1,0,0,0,
            0,1,1,1,1,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,1,0,1,0,0,0,0, 0,0,0,1,0,0,0,0, 0,1,0,1,1,0,1,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,1,1,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,1,0,0,0,0,
            0,1,0,0,0,1,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,1,1,0,0,0,0,0, 0,0,0,1,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,1,1,1,1,0,0,0, 0,0,1,1,1,1,0,0, 0,1,0,0,0,0,0,0, 0,0,1,1,0,0,0,0, 0,0,0,1,0,0,0,0,
            0,1,0,0,0,1,0,0, 0,0,0,1,0,0,0,0, 0,1,0,0,1,0,0,0, 0,1,0,1,0,0,0,0, 0,0,0,1,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,1,0,0,0,0,
            0,1,0,0,0,1,0,0, 0,0,0,1,0,0,0,0, 0,0,1,1,0,0,0,0, 0,1,0,0,1,0,0,0, 0,0,0,1,0,0,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,1,0,0, 0,0,1,1,1,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,0,0,0,0,0, 0,1,1,1,0,0,0,0, 0,0,0,1,0,0,0,0,
            // TODO 117-129: uvwxyz{|}~ + 3 unused
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,1,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,1,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,1,0,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,1,0,0, 0,0,1,0,1,0,0,0, 0,1,1,1,1,1,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,1,0,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,0,1,0, 0,0,1,0,1,0,0,0, 0,0,1,0,1,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,1,0,0,0,1,0,0, 0,0,1,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,1,0,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,1,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,1,0,0,0,1,0,0, 0,0,1,0,1,0,0,0, 0,1,0,1,1,0,1,0, 0,0,1,0,1,0,0,0, 0,0,1,0,0,0,0,0, 0,0,1,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,0,1,1,1,0,0,0, 0,0,0,1,0,0,0,0, 0,0,1,0,0,1,0,0, 0,1,0,0,0,1,0,0, 0,1,0,0,0,0,0,0, 0,1,1,1,1,1,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
        ] );

        this.texture = new Texture( this.gl );
        this.firstChar = 33 - 7; // -7 for dummy block and 6 unused spots
        this.numCols = 13;
        this.numRows = 8;
        this.texture.createFromUInt8Array( pixels, this.numCols*8, this.numRows*8 );
    }

    loadState(imguiState)
    {
        let state = null;
        try { state = JSON.parse( imguiState ); }
        catch( e ) { return; }

        this.scale = state.scale;
        this.doubleClickTime = state.doubleClickTime;

        for( let key in state.windows )
        {
            this.windows[key] = new Window();
            let window = this.windows[key];

            window.position.setF32( state.windows[key].position["x"], state.windows[key].position["y"] );
            window.size.setF32( state.windows[key].size["x"], state.windows[key].size["y"] );
            window.cursor.set( window.position );
            
            // If the window is offscreen, force it back to 0,0.
            if( window.position.x + window.size.x < 0 || window.position.x >= this.canvas.w ||
                window.position.y + window.size.y < 0 || window.position.y >= this.canvas.h )
            {
                window.position.setF32( 0, 0 );
            }
        }
    }

    markStateDirty()
    {
        this.stateIsDirty = true;
    }

    saveState(storage, name)
    {
        if( this.stateIsDirty )
        {
            //console.log( "Saving imgui state." );

            storage[name] = JSON.stringify( this );
            this.stateIsDirty = false;
        }
    }

    toJSON()
    {
        let state = {
            scale: this.scale,
            doubleClickTime: this.doubleClickTime,
        }

        state.windows = {};
        
        for( let key in this.windows )
        {
            state.windows[key] = {};
            state.windows[key].position = this.windows[key].position;
            state.windows[key].size = this.windows[key].size;
        }

        return state;
    }

    newFrame(deltaTime)
    {
        this.currentTime += deltaTime;

        this.isHoveringWindow = false;

        this.drawList.length = 0;
        this.activeWindow = null;

        this.mousePosition.divideBy( this.scale );

        this.mouseChange = this.mousePosition.minus( this.lastMousePosition );
        this.mouseChangeUnscaled = this.mouseChange.times( this.scale );
        this.lastMousePosition.setF32( this.mousePosition.x, this.mousePosition.y );

        // Loop through all windows.
        for( let key in this.windows )
        {
            // Find which window is hovered and if it was clicked.
            if( this.windows[key].activeThisFrame && this.windows[key].rect.contains( this.mousePosition ) )
            {
                if( this.mouseButtons[0] == false || this.ownsMouse == true )
                {
                    this.isHoveringWindow = true;
                    this.ownsMouse = true;
                }

                if( this.mouseButtons[0] == true && this.oldMouseButtons[0] == false ) // Left button clicked.
                {
                    this.windowBeingMoved = this.windows[key];

                    // If double click on a window title, collapse or expand it.
                    let titleH = 8 + this.padding.y*2;
                    if( this.mousePosition.y < this.windows[key].rect.y + titleH )
                    {
                        if( this.currentTime - this.lastTimeMouseClicked[0] < this.doubleClickTime )
                        {
                            this.windowBeingMoved.expanded = !this.windowBeingMoved.expanded;
                            this.windowBeingMoved = null;
                        }
                    }
                }
            }

            // Reset their frame persistent values.
            this.windows[key].activeThisFrame = false;
            this.windows[key].cursor.set( this.windows[key].position );
            this.windows[key].previousLineEndPosition.setF32( 0, 0 );
        }

        if( this.mouseButtons[0] == true && this.isHoveringWindow == false )
        {
            this.ownsMouse = false;
        }

        if( this.mouseButtons[0] == false ) // Not held.
        {
            if( this.windowMoved )
            {
                this.windowMoved = false;
                this.stateIsDirty = true;
            }
            this.activeControl = null;
            this.windowBeingMoved = null;
            this.windowBeingResized = null;
        }

        if( this.isHoveringControl == false && this.windowBeingMoved )
        {
            if( this.mouseChange.x != 0 || this.mouseChange.y != 0 )
            {
                this.windowBeingMoved.position.add( this.mouseChange );
                this.windowMoved = true;
                this.windowBeingMoved.cursor.set( this.windowBeingMoved.position );
            }
        }

        if( this.isHoveringControl == false && this.windowBeingResized )
        {
            if( this.mouseChange.x != 0 || this.mouseChange.y != 0 )
            {
                this.windowBeingResized.size.add( this.mouseChange );
                this.windowMoved = true;
                //this.windowBeingMoved.cursor.set( this.windowBeingMoved.position );
            }
        }

        if( false )
        {
            this.window( "TEST" );
            this.windows["TEST"].position.x = 400;
            this.windows["TEST"].position.y = 20;
            this.windows["TEST"].size.x = 250;
            this.text( "Delta: " + this.mouseChange.x + " " + this.mouseChange.y );
            this.text( "Mouse Pos: " + this.mousePosition.x + " " + this.mousePosition.y );
            this.text( "Buttons: " + this.mouseButtons );
            if( this.windowBeingMoved )
            {
                this.text( "Rect XY: " + this.windowBeingMoved.rect.x + " " + this.windowBeingMoved.rect.y );
                this.text( "Rect WH: " + this.windowBeingMoved.rect.w + " " + this.windowBeingMoved.rect.h );
                this.text( "In Rect: " + this.windowBeingMoved.rect.contains( this.mousePosition ) );
            }
        }

        // Update lastTimeMouseClicked to be able to detect double-clicks above.
        if( this.mouseButtons[0] == true && this.oldMouseButtons[0] == false ) // Left button clicked.
        {
            this.lastTimeMouseClicked[0] = this.currentTime;
        }
    }

    draw()
    {
        let gl = this.gl;

        gl.disable( gl.DEPTH_TEST );
        gl.enable( gl.BLEND );
        gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
        gl.enable( gl.SCISSOR_TEST );
        for( let i=0; i<this.drawList.length; i++ )
        {
            let item = this.drawList[i];
            
            this.drawItem( item );
        }
        gl.disable( gl.SCISSOR_TEST );
        gl.enable( gl.DEPTH_TEST );

        // Backup old mouse state before DOM callbacks change current state.
        this.oldMouseButtons[0] = this.mouseButtons[0];
        this.oldMouseButtons[1] = this.mouseButtons[1];
        this.oldMouseButtons[2] = this.mouseButtons[2];

        this.isHoveringControl = false;
    }
    
    drawItem(item)
    {
        let gl = this.gl;

        let sizeofFloat32 = 4;
        let sizeofUint8 = 1;
        let sizeofUint16 = 2;
        
        // VertexFormat: XY UV RGBA. (4 floats + 4 uint8s or 5 floats or 20 bytes)
        let sizeofVertex = (4*sizeofFloat32 + 4*sizeofUint8);
        let vertexAttributes = new ArrayBuffer( item.vertexCount * sizeofVertex );
        let vertexAttributesAsFloats = new Float32Array( vertexAttributes );
        for( let i=0; i<item.vertexCount; i++ )
        {
            vertexAttributesAsFloats[i*5 + 0] = item.verts[i*8 + 0];
            vertexAttributesAsFloats[i*5 + 1] = item.verts[i*8 + 1];
            vertexAttributesAsFloats[i*5 + 2] = item.verts[i*8 + 2];
            vertexAttributesAsFloats[i*5 + 3] = item.verts[i*8 + 3];
        }

        let vertexAttributesAsUint8s = new Uint8Array( vertexAttributes );
        for( let i=0; i<item.vertexCount; i++ )
        {
            vertexAttributesAsUint8s[i*sizeofVertex + 4*sizeofFloat32 + 0] = item.verts[i*8 + 4];
            vertexAttributesAsUint8s[i*sizeofVertex + 4*sizeofFloat32 + 1] = item.verts[i*8 + 5];
            vertexAttributesAsUint8s[i*sizeofVertex + 4*sizeofFloat32 + 2] = item.verts[i*8 + 6];
            vertexAttributesAsUint8s[i*sizeofVertex + 4*sizeofFloat32 + 3] = item.verts[i*8 + 7];
        }

        // Indices: Uint16.
        let indices16 = new ArrayBuffer( item.indexCount * sizeofUint16 );
        let indicesAsUint16s = new Uint16Array( indices16 );
        for( let i=0; i<item.indexCount; i++ )
        {
            indicesAsUint16s[i] = item.indices[i];
        }

        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bufferData( gl.ARRAY_BUFFER, vertexAttributes, gl.STREAM_DRAW );

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IBO );
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices16, gl.STREAM_DRAW );

        // Set up VBO and attributes.
        gl.bindBuffer( gl.ARRAY_BUFFER, this.VBO );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.IBO );

        let a_Position = gl.getAttribLocation( this.shader.program, "a_Position" );
        gl.enableVertexAttribArray( a_Position );
        gl.vertexAttribPointer( a_Position, 2, gl.FLOAT, false, sizeofVertex, 0 )

        let a_UV = gl.getAttribLocation( this.shader.program, "a_UV" );
        if( a_UV != -1 )
        {
            gl.enableVertexAttribArray( a_UV );
            gl.vertexAttribPointer( a_UV, 2, gl.FLOAT, false, sizeofVertex, 8 )
        }

        let a_Color = gl.getAttribLocation( this.shader.program, "a_Color" );
        if( a_Color != -1 )
        {
            gl.enableVertexAttribArray( a_Color );
            gl.vertexAttribPointer( a_Color, 4, gl.UNSIGNED_BYTE, true, sizeofVertex, 16 )
        }

        // Set up shader and uniforms.
        gl.useProgram( this.shader.program );

        // Ortho matrix with 0,0 at top-left.
        this.matProj = new mat4();
        this.matProj.createOrthoInfiniteZ( 0, this.canvas.width / this.scale, this.canvas.height / this.scale, 0 );

        let u_MatProj = gl.getUniformLocation( this.shader.program, "u_MatProj" );
        gl.uniformMatrix4fv( u_MatProj, false, this.matProj.m )

        let u_TextureAlbedo = gl.getUniformLocation( this.shader.program, "u_TextureAlbedo" );
        if( u_TextureAlbedo != null )
        {
            let textureUnit = 0;
            gl.activeTexture( gl.TEXTURE0 + textureUnit );
            gl.bindTexture( gl.TEXTURE_2D, this.texture.textureID );
            gl.uniform1i( u_TextureAlbedo, textureUnit );
        }

        // Scissor.
        let lowerLeftY = this.canvas.height - (item.rect.y + item.rect.h) * this.scale;
        gl.scissor( item.rect.x * this.scale, lowerLeftY, item.rect.w * this.scale, item.rect.h * this.scale );
        
        // Draw.        
        gl.drawElements( item.primitiveType, item.indexCount, gl.UNSIGNED_SHORT, 0 );
        
        if( a_UV != -1 )
            gl.disableVertexAttribArray( a_UV );
        if( a_Color != -1 )
            gl.disableVertexAttribArray( a_Color );
    }

    sameLine()
    {
        this.activeWindow.cursor.set( this.activeWindow.previousLineEndPosition );
    }

    // Return true is window is expanded.
    window(name)
    {
        let gl = this.gl;

        if( this.windows[name] == undefined )
        {
            let windowCount = Object.keys( this.windows ).length;

            this.windows[name] = new Window();
            this.activeWindow = this.windows[name];
            
            this.activeWindow.position.setF32( 20 + 150*windowCount, 20 );
            this.activeWindow.size.setF32( 120, 90 );
            this.activeWindow.cursor.set( this.activeWindow.position );
        }
        
        this.activeWindow = this.windows[name];
        this.activeWindow.activeThisFrame = true;

        // If the window is offscreen, force it back to 0,0.
        if( this.activeWindow.position.x + this.activeWindow.size.x < 0 || this.activeWindow.position.x >= this.canvas.w ||
            this.activeWindow.position.y + this.activeWindow.size.y < 0 || this.activeWindow.position.y >= this.canvas.h )
        {
            this.activeWindow.position.setF32( 0, 0 );
        }

        // If we're adding the window for the first time, add a title and BG.
        if( this.activeWindow.cursor.y == this.activeWindow.position.y )
        {
            let verts = [];
            let indices = [];
            
            let x = this.activeWindow.position.x;
            let y = this.activeWindow.position.y;
            
            let w = this.activeWindow.size.x;
            
            let titleH = 8 + this.padding.y*2;
            
            // Draw the title box.
            let h = titleH;
            this.addBoxToArray( verts, indices, x,y,w,h, 0,0,0,200 );

            this.activeWindow.rect.set( x, y, w, h );

            if( this.activeWindow.expanded )
            {
                // Draw the BG box.
                y += titleH;
                h = this.activeWindow.size.y - titleH;
                this.addBoxToArray( verts, indices, x,y,w,h, 0,0,255,200 );

                // Define scissor rect, y is lower left.
                let rx = this.activeWindow.position.x;
                let ry = this.activeWindow.position.y;
                let rw = this.activeWindow.size.x;
                let rh = this.activeWindow.size.y;
                this.activeWindow.rect.set( rx, ry, rw, rh );
            }

            this.drawList.push( new DrawListItem( gl.TRIANGLES, verts, indices, this.activeWindow.rect ) );

            if( this.checkbox( "", this.activeWindow.expanded ) )
            {
                this.activeWindow.expanded = !this.activeWindow.expanded;
            }
            this.sameLine();
            this.text( name );
        }

        // Button at bottom right to resize window.
        if( this.activeWindow.expanded )
        {
            let x = this.activeWindow.cursor.x;
            let y = this.activeWindow.cursor.y;
            let rect = this.activeWindow.rect;
            this.activeWindow.cursor.x = rect.x + rect.w - 12; // padding + 8 + padding.
            this.activeWindow.cursor.y = rect.y + rect.h - 12; // padding + 8 + padding.
            if( this.button( " " ) )
            {
                this.windowBeingResized = this.activeWindow;
            }
            this.activeWindow.cursor.x = x;
            this.activeWindow.cursor.y = y;
        }

        return this.activeWindow.expanded;
    }

    endWindow(forceResize)
    {
        if( forceResize )
        {
            this.activeWindow.size.set( this.activeWindow.previousLineEndPosition.minus( this.activeWindow.position ) );
            this.activeWindow.size.x += this.padding.x;
            this.activeWindow.size.y += this.padding.y + 8 + this.padding.y + this.padding.y;
        }
    }

    addBoxToArray(verts, indices, x, y, w, h, r, g, b, a)
    {
        let numVerts = verts.length/8;
        indices.push( numVerts+0,numVerts+1,numVerts+2, numVerts+0,numVerts+2,numVerts+3 );
        verts.push( x+0,y+h,   0,0,   r,g,b,a );
        verts.push( x+0,y+0,   0,0,   r,g,b,a );
        verts.push( x+w,y+0,   0,0,   r,g,b,a );
        verts.push( x+w,y+h,   0,0,   r,g,b,a );
    }

    text(str)
    {
        // if( this.activeWindow.expanded == false )
        //     return;

        let gl = this.gl;

        this.activeWindow.cursor.x += this.padding.x;
        this.activeWindow.cursor.y += this.padding.y;
        let x = this.activeWindow.cursor.x;
        let y = this.activeWindow.cursor.y;

        let w = 8;
        let h = 8;

        let verts = [];
        let indices = [];

        let stepU = 1.0 / this.numCols;
        let stepV = 1.0 / this.numRows;

        let count = 0;
        for( let i=0; i<str.length; i++ )
        {
            let c = str.charCodeAt(i);
            if( c == 32 ) // Handle spaces.
            {
                x += w;
                continue;
            }
			if( c == 97+6 || c == 97+9 || c == 97+15 || c == 97+16 || c == 97+24 ) // g/j/p/q/y
				y += 2;
            c -= this.firstChar;
            let cx = Math.trunc( c % this.numCols );
            let cy = Math.trunc( c / this.numCols );

            verts.push( x+0,y+h,   stepU*(cx+0),stepV*(cy+1),   255,255,255,255 );
            verts.push( x+0,y+0,   stepU*(cx+0),stepV*(cy+0),   255,255,255,255 );
            verts.push( x+w,y+0,   stepU*(cx+1),stepV*(cy+0),   255,255,255,255 );
            verts.push( x+w,y+h,   stepU*(cx+1),stepV*(cy+1),   255,255,255,255 );
            indices.push( count*4+0,count*4+1,count*4+2, count*4+0,count*4+2,count*4+3 );

            x += w;
            c += this.firstChar;
			if( c == 97+6 || c == 97+9 || c == 97+15 || c == 97+16 || c == 97+24 ) // g/j/p/q/y
				y -= 2;
            count++;
        }

        this.drawList.push( new DrawListItem( gl.TRIANGLES, verts, indices, this.activeWindow.rect ) );

        this.activeWindow.previousLineEndPosition.setF32( x-this.padding.x, y-this.padding.y );

        this.activeWindow.cursor.setF32( x, y+h );
        this.activeWindow.cursor.y += this.padding.y;

        this.activeWindow.cursor.x = this.activeWindow.position.x;
    }

    button(label, returnTrueIfHeld)
    {
        // if( this.activeWindow.expanded == false )
        //     return;

        let gl = this.gl;

        let w = this.padding.x + label.length * 8 + this.padding.x;
        let buttonTopPadding = 1;
        let h = buttonTopPadding + 8 + this.padding.y;

        let verts = [];
        let indices = [];

        let x = this.activeWindow.cursor.x + this.padding.x;
        let y = this.activeWindow.cursor.y + buttonTopPadding;

        let isHovering = false;
        let rgb = new vec3(0,96,0);
        let rect = new Rect( x, y, w, h );
        if( rect.contains( this.mousePosition ) ) // is hovering.
        {
            isHovering = true;
            rgb.setF32(0,160,0);

            if( this.mouseButtons[0] == true ) // is pressing.
            {
                rgb.setF32(0,220,0);
            }
        }

        this.addBoxToArray( verts, indices, x,y,w,h, rgb.x,rgb.y,rgb.z,255 );
        this.drawList.push( new DrawListItem( gl.TRIANGLES, verts, indices, this.activeWindow.rect ) );

        this.activeWindow.cursor.x += this.padding.x;
        this.text( label );
        this.activeWindow.previousLineEndPosition.setF32( x + w, y - buttonTopPadding );

        // Check if was pressed this frame.
        if( isHovering &&
            ( ( returnTrueIfHeld && this.mouseButtons[0] == true ) ||
              ( this.mouseButtons[0] == true && this.oldMouseButtons[0] == false ) ) )
        {
            this.isHoveringControl = true;
            this.windowBeingMoved = null;
            this.windowBeingResized = null;
            return true;
        }

        return false;
    }

    checkbox(label, isChecked)
    {
        // if( this.activeWindow.expanded == false )
        //     return;

        let gl = this.gl;

        this.text( label );
        this.sameLine();
        this.activeWindow.cursor.x += this.padding.x;

        let w = this.padding.x + 8 + this.padding.x;
        let buttonTopPadding = 1;
        let h = buttonTopPadding + 8 + this.padding.y;

        let verts = [];
        let indices = [];

        let x = this.activeWindow.cursor.x + this.padding.x;
        let y = this.activeWindow.cursor.y + buttonTopPadding;

        let isHovering = false;
        let rgb = new vec3(0,96,0);
        let rect = new Rect( x, y, w, h );
        if( rect.contains( this.mousePosition ) ) // is hovering.
        {
            isHovering = true;
            rgb.setF32( 0, 160, 0 );

            if( this.mouseButtons[0] == true ) // is pressing.
            {
                rgb.setF32( 0, 220, 0 );
            }
        }

        this.addBoxToArray( verts, indices, x,y,w,h, rgb.x,rgb.y,rgb.z,255 );

        if( isChecked )
        {
            rgb.setF32( 255, 255, 0 );
            this.addBoxToArray( verts, indices, x+2,y+2,w-4,h-4, rgb.x,rgb.y,rgb.z,255 );
        }

        this.drawList.push( new DrawListItem( gl.TRIANGLES, verts, indices, this.activeWindow.rect ) );

        this.activeWindow.cursor.x += this.padding.x;
        this.activeWindow.previousLineEndPosition.setF32( x + w, y - buttonTopPadding );
        this.activeWindow.cursor.x = this.activeWindow.position.x;
        this.activeWindow.cursor.y += this.padding.y + 8 + this.padding.y;
        
        // Check if was pressed this frame.
        if( isHovering &&
            ( ( this.mouseButtons[0] == true && this.oldMouseButtons[0] == false ) ) )
        {
            this.isHoveringControl = true;
            this.windowBeingMoved = null;
            this.windowBeingResized = null;
            return true;
        }

        return false;
    }

    dragNumber(label, value, increment, decimalPlaces)
    {
        // if( this.activeWindow.expanded == false )
        //     return;

        let gl = this.gl;

        // Label and a bit of padding to it's right.
        this.text( label );
        this.sameLine();
        this.activeWindow.cursor.x += this.padding.x;
        this.valueAsString = value.toFixed( decimalPlaces );

        // Vars.
        let verts = [];
        let indices = [];

        let buttonTopPadding = 1;
        let offsetx = this.activeWindow.cursor.x - this.activeWindow.position.x;
        let boxWidth = (this.activeWindow.size.x - offsetx) - this.padding.x*2;
        let midPoint = boxWidth/2 - this.valueAsString.length*8/2;

        // Background.
        let x = this.activeWindow.cursor.x + this.padding.x;
        let y = this.activeWindow.cursor.y + buttonTopPadding;
        let w = boxWidth;
        let h = buttonTopPadding + 8 + this.padding.y;

        let isHovering = false;
        let rgb = new vec3(0,96,0);
        let rect = new Rect( x, y, w, h );
        if( rect.contains( this.mousePosition ) ) // is hovering.
        {
            isHovering = true;
            rgb.setF32( 0, 160, 0 );

            if( this.mouseButtons[0] == true ) // is pressing.
            {
                rgb.setF32( 0, 220, 0 );
            }
        }

        this.addBoxToArray( verts, indices, x,y,w,h, rgb.x,rgb.y,rgb.z,255 );
        this.drawList.push( new DrawListItem( gl.TRIANGLES, verts, indices, this.activeWindow.rect ) );

        // Value.
        this.activeWindow.cursor.x += midPoint;
        this.text( this.valueAsString );
        this.sameLine();

        this.activeWindow.cursor.x += this.padding.x;
        this.activeWindow.previousLineEndPosition.setF32( x + w, y - buttonTopPadding );
        this.activeWindow.cursor.x = this.activeWindow.position.x;
        this.activeWindow.cursor.y += this.padding.y + 8 + this.padding.y;
        
        // Check if was pressed this frame.
        if( isHovering &&
            ( ( this.mouseButtons[0] == true && this.oldMouseButtons[0] == false ) ) )
        {
            this.activeControl = label;
            this.isHoveringControl = true;
            this.windowBeingMoved = null;
            this.windowBeingResized = null;
        }

        // If mouse held.
        if( this.activeControl == label &&
            this.mouseButtons[0] == true && this.oldMouseButtons[0] == true )
        {
            value += this.mouseChangeUnscaled.x * increment;
        }

        return value;
    }
}

class Window
{
    constructor()
    {
        this.position = new vec2( 0, 0 );
        this.size = new vec2( 0, 0 );
    
        this.activeThisFrame = false;
        this.cursor = new vec2(0);
        this.previousLineEndPosition = new vec2(0);
        this.rect = new Rect(0,0,0,0);

        this.expanded = true;
    }
}

class DrawListItem
{
    constructor(primitiveType, verts, indices, rect)
    {
        this.primitiveType = primitiveType;
        this.vertexCount = verts.length / 8;
        this.indexCount = indices.length;
        this.verts = verts;
        this.indices = indices;
        this.rect = rect;
    }
}

class Rect
{
    constructor(x,y,w,h)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    set(x,y,w,h)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(pos)
    {
        if( pos.x > this.x && pos.x < this.x + this.w &&
            pos.y > this.y && pos.y < this.y + this.h )
        {
            return true;
        }
        
        return false;
    }
}
