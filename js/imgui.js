class ImGui
{
    constructor(gl, canvas)
    {
        this.gl = gl;
        this.canvas = canvas;

        // Persistent values.
        this.drawList = [];
        this.windows = {};
        this.lastMousePosition = new vec3(0);
        this.activeWindow = null;
        this.windowMoving = null;
        this.oldMouseButtons = [ false, false, false ];

        // Persistent values within single frame.

        // Settings.
        this.scale = 2;
        this.padding = new vec3(2);

        // Inputs.
        this.mousePosition = new vec3(0);
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
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,
            // TODO 33-38: !"#$%&
            // TODO 39-51: '()*+,-./0123
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,1,1,1,1,0,0, 0,0,0,1,1,0,0,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,0,0,
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,1,0, 0,0,0,0,0,0,1,0,
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,0,1,0, 0,0,0,0,0,0,1,0,
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,1,1,1,1,1,0, 0,0,1,1,1,1,0,0,
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,0,0,1,0,
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,1,1,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,0,0,1,0,
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,1,1,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,1,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,0,0,1,0,
            0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,1,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,1,1,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,1,1,1,1,0,0, 0,0,0,1,1,1,0,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,0,0,
            // TODO 52-64: 456789:;<=>?@
            0,1,0,0,0,0,1,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,1,0,0,0,0,1,0, 0,1,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,0,0,0,1,0,0, 0,1,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,0,0,0,0,1,0,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,1,0, 0,0,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,1,0, 0,0,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,0,1,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,1,0, 0,0,0,0,0,0,1,0, 0,1,0,0,0,0,1,0, 0,0,0,1,0,0,0,0, 0,1,0,0,0,0,1,0, 0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,1,0, 0,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,0, 0,0,0,1,0,0,0,0, 0,1,1,1,1,1,1,0, 0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
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
            // TODO 91-96: [\]^_`
            // TODO 97-109: Lower case a-m
            // TODO 110-122: Lower case n-z
            // TODO 123-126: {|}~
        ] );

        this.texture = new Texture( this.gl );
        this.firstChar = 39 - 13; // -13 for dummy block.
        this.numCols = 13;
        this.numRows = 5;
        this.texture.createFromUInt8Array( pixels, this.numCols*8, this.numRows*8 );
    }

    newFrame()
    {
        this.isHoveringWindow = false;

        this.drawList.length = 0;
        this.activeWindow = null;

        this.mousePosition.divideBy( this.scale );

        let mouseChange = this.mousePosition.minus( this.lastMousePosition );
        this.lastMousePosition.setF32( this.mousePosition.x, this.mousePosition.y, 0 );

        // Loop through all windows.
        for( let key in this.windows )
        {
            // Reset their frame persistent values.
            this.windows[key].cursor.set( this.windows[key].position );
            this.windows[key].previousLineEndPosition.setF32( 0, 0, 0 );

            // Find which window is hovered and if it was clicked.
            if( this.windows[key].rect.contains( this.mousePosition ) )
            {
                this.isHoveringWindow = true;

                if( this.mouseButtons[0] == 1 && this.oldMouseButtons[0] == 0 ) // Left button clicked.
                {
                    this.windowMoving = this.windows[key];
                    break;
                }
            }
        }

        if( this.mouseButtons[0] == 0 )
        {
            this.windowMoving = null;
        }

        if( this.isHoveringControl == false && this.windowMoving )
        {
            this.windowMoving.position.add( mouseChange );
            this.windowMoving.cursor.set( this.windowMoving.position );
        }

        if( false )
        {
            this.window( "TEST" );
            this.windows["TEST"].position.x = 400;
            this.windows["TEST"].position.y = 20;
            this.windows["TEST"].size.x = 250;
            this.text( "Delta: " + mouseChange.x + " " + mouseChange.y );
            this.text( "Mouse Pos: " + this.mousePosition.x + " " + this.mousePosition.y );
            this.text( "Buttons: " + this.mouseButtons );
            if( this.windowMoving )
            {
                this.text( "Rect XY: " + this.windowMoving.rect.x + " " + this.windowMoving.rect.y );
                this.text( "Rect WH: " + this.windowMoving.rect.w + " " + this.windowMoving.rect.h );
                this.text( "In Rect: " + this.windowMoving.rect.contains( this.mousePosition ) );
            }
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

    window(name)
    {
        let gl = this.gl;

        if( this.windows[name] == undefined )
        {
            let windowCount = Object.keys( this.windows ).length;

            this.windows[name] = []
            this.activeWindow = this.windows[name];
            this.activeWindow.position = new vec3( 20 + 150*windowCount, 20, 0 );
            this.activeWindow.size = new vec3( 120, 90, 0 );
            this.activeWindow.rect = new Rect( 0, 0, 0, 0 );
            this.activeWindow.cursor = new vec3(0);
            this.activeWindow.cursor.set( this.activeWindow.position );
            this.activeWindow.previousLineEndPosition = new vec3(0);
        }
        
        this.activeWindow = this.windows[name];

        // If we're adding the window for the first time, add a title and BG.
        if( this.activeWindow.cursor.y == this.activeWindow.position.y )
        {
            let numVerts = 0;
            let numIndices = 0;
            let verts = [];
            let indices = [];
    
            let x = this.activeWindow.position.x;
            let y = this.activeWindow.position.y;
    
            let w = this.activeWindow.size.x;

            let titleH = 8 + this.padding.y*2;
            
            // Draw the title box.
            let h = titleH;
            verts.push( x+0,y+h,   0,0,   0,0,0,200 );
            verts.push( x+0,y+0,   0,0,   0,0,0,200 );
            verts.push( x+w,y+0,   0,0,   0,0,0,200 );
            verts.push( x+w,y+h,   0,0,   0,0,0,200 );
            indices.push( numVerts+0,numVerts+1,numVerts+2, numVerts+0,numVerts+2,numVerts+3 );
            numVerts += 4;
            numIndices += 6;

            // Draw the BG box.
            y += titleH;
            h = this.activeWindow.size.y - titleH;
            verts.push( x+0,y+h,   0,0,   255,255,255,64 );
            verts.push( x+0,y+0,   0,0,   255,255,255,64 );
            verts.push( x+w,y+0,   0,0,   255,255,255,64 );
            verts.push( x+w,y+h,   0,0,   255,255,255,64 );
            indices.push( numVerts+0,numVerts+1,numVerts+2, numVerts+0,numVerts+2,numVerts+3 );
            numVerts += 4;
            numIndices += 6;

            // Define scissor rect, y is lower left.
            let rx = this.activeWindow.position.x;
            let ry = this.activeWindow.position.y;
            let rw = this.activeWindow.size.x;
            let rh = this.activeWindow.size.y+100;
            this.activeWindow.rect.set( rx, ry, rw, rh );
            this.rect = this.activeWindow.rect;

            this.drawList.push( new DrawListItem( gl.TRIANGLES, numVerts, verts, numIndices, indices, this.activeWindow.rect ) );

            this.text( name );
        }
    }

    text(str)
    {
        let gl = this.gl;

        this.activeWindow.cursor.x += this.padding.x;
        this.activeWindow.cursor.y += this.padding.y;
        let x = this.activeWindow.cursor.x;
        let y = this.activeWindow.cursor.y;

        let w = 8;
        let h = 8;

        let numVerts = 0;
        let numIndices = 0;
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
            if( c >= 97 ) // Temp hack for lower case letters.
                c -= 32;
            c -= this.firstChar;
            let cx = Math.trunc( c % this.numCols );
            let cy = Math.trunc( c / this.numCols );

            verts.push( x+0,y+h,   stepU*(cx+0),stepV*(cy+1),   255,255,255,255 );
            verts.push( x+0,y+0,   stepU*(cx+0),stepV*(cy+0),   255,255,255,255 );
            verts.push( x+w,y+0,   stepU*(cx+1),stepV*(cy+0),   255,255,255,255 );
            verts.push( x+w,y+h,   stepU*(cx+1),stepV*(cy+1),   255,255,255,255 );
            indices.push( count*4+0,count*4+1,count*4+2, count*4+0,count*4+2,count*4+3 );

            numVerts += 4;
            numIndices += 6;

            x += w;
            count++;
        }

        this.drawList.push( new DrawListItem( gl.TRIANGLES, numVerts, verts, numIndices, indices, this.rect ) );

        this.activeWindow.previousLineEndPosition.setF32( x-this.padding.x, y-this.padding.y, 0 );

        this.activeWindow.cursor.setF32( x, y+h, 0 );
        this.activeWindow.cursor.y += this.padding.y;

        this.activeWindow.cursor.x = this.activeWindow.position.x;
    }

    button(label)
    {
        let gl = this.gl;

        let w = this.padding.x + label.length * 8 + this.padding.x;
        let buttonTopPadding = 1;
        let h = buttonTopPadding + 8 + this.padding.y;

        let numVerts = 4;
        let numIndices = 6;
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

        verts.push( x+0,y+h,   0,0,   rgb.x,rgb.y,rgb.z,255 );
        verts.push( x+0,y+0,   0,0,   rgb.x,rgb.y,rgb.z,255 );
        verts.push( x+w,y+0,   0,0,   rgb.x,rgb.y,rgb.z,255 );
        verts.push( x+w,y+h,   0,0,   rgb.x,rgb.y,rgb.z,255 );
        indices.push( 0,1,2, 0,2,3 );

        this.drawList.push( new DrawListItem( gl.TRIANGLES, numVerts, verts, numIndices, indices, this.rect ) );

        this.activeWindow.cursor.x += this.padding.x;

        this.text( label );

        this.activeWindow.cursor.y += this.padding.y;

        // Check if was pressed this frame.
        if( isHovering && this.mouseButtons[0] == true && this.oldMouseButtons[0] == false )
        {
            this.isHoveringControl = true;
            this.windowMoving = null;
            return true;
        }

        this.activeWindow.previousLineEndPosition.setF32( x + w, y - buttonTopPadding, 0 );

        this.activeWindow.cursor.y -= this.padding.y;

        return false;
    }
}

class DrawListItem
{
    constructor(primitiveType, vertCount, verts, indexCount, indices, rect)
    {
        this.primitiveType = primitiveType;
        this.vertexCount = vertCount;
        this.indexCount = indexCount;
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
