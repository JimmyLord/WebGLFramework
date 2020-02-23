// Params:
//    canvasName="MainCanvas"
//    width=600
//    height=400
//    fullFrame="true" or 1
class FrameworkMain
{
    constructor()
    {
        // Get the canvas and the OpenGL context.
        this.canvas = document.getElementById( document.currentScript.getAttribute( "canvasName" ) );
        let gl = this.canvas.getContext( "webgl2" );
        if( gl == 0 )
        {
            log( "Failed to get WebGL context from canvas." );
            return;
        }

        // Set some members.
        this.gl = gl;
        this.keyStates = new Map;
        this.lastMousePosition = new vec3(0);

        // Set the size of the canvas.
        this.fullFrame = false;
        if( document.currentScript.getAttribute( "fullFrame" ) == "true" ||
            document.currentScript.getAttribute( "fullFrame" ) == 1 )
        {
            this.fullFrame = true;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
        else
        {
            this.canvas.width = document.currentScript.getAttribute( "width" );
            this.canvas.height = document.currentScript.getAttribute( "height" );
        }

        // Correct the canvas size for requested pixel ratio.
        this.canvas.width *= window.devicePixelRatio;
        this.canvas.height *= window.devicePixelRatio;
        this.canvas.style.width = (this.canvas.width / window.devicePixelRatio) + 'px';
        this.canvas.style.height = (this.canvas.height / window.devicePixelRatio) + 'px';
        
        // Create an imgui instance.
        this.imgui = new ImGui( this.gl, this.canvas );
    
        // Set up some base common resources.
        let resources = new ResourceManager( gl );
        this.resources = resources;

        resources.meshes["triangle"] = new Mesh( gl );
        resources.meshes["triangle"].createTriangle( new vec3( 0.5, 0.5 ) );
        resources.meshes["circle"] = new Mesh( gl );
        resources.meshes["circle"].createCircle( 200, 0.2 );
        resources.meshes["cube"] = new Mesh( gl );
        resources.meshes["cube"].createCube( new vec3( 1, 1, 1 ) );
    
        //resources.textures["testTexture"] = new Texture( gl );
        //resources.textures["testTexture"].loadFromFile( "data/textures/test.png" );
        
        resources.materials["red"] = new Material( resources.shaders["uniformColor"], new color( 1, 0, 0, 1 ), null );
        resources.materials["green"] = new Material( resources.shaders["uniformColor"], new color( 0, 1, 0, 1 ), null );
        resources.materials["blue"] = new Material( resources.shaders["uniformColor"], new color( 0, 0, 1, 1 ), null );
        resources.materials["white"] = new Material( resources.shaders["uniformColor"], new color( 1, 1, 1, 1 ), null );
        //resources.materials["testTexture"] = new Material( resources.shaders["texture"], new color( 0, 0, 0, 1 ), resources.textures["testTexture"] );
        resources.materials["vertexColor"] = new Material( resources.shaders["vertexColor"], new color( 0, 0, 1, 1 ), null );
    
        // Create a camera.
        this.camera = new Camera( new vec3(0, 0, -3), true, 2, this.canvas.width / this.canvas.height );
    
        // Set up some basic GL state.
        gl.enable( gl.DEPTH_TEST );
        gl.depthFunc( gl.LEQUAL );
        gl.enable( gl.CULL_FACE );
        gl.cullFace( gl.BACK );
        gl.frontFace( gl.CW );
    }

    run(runnableObject)
    {
        // Initial state for running.
        this.runnableObject = runnableObject;
        this.lastTime = performance.now();
        
        this.registerDoMCallbacks();

        // Start the update/draw cycle.
        requestAnimationFrame( (currentTime) => this.update( currentTime ) );
    }
    
    update(currentTime)
    {
        let deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.imgui.mousePosition.setF32( this.lastMousePosition.x, this.lastMousePosition.y, 0 );
        this.imgui.newFrame();

        this.camera.update();

        if( this.runnableObject.update )
        {
            this.runnableObject.update( deltaTime, currentTime );
        }

        this.draw();
    }
    
    draw()
    {
        let gl = this.gl;
        
        gl.viewport( 0, 0, this.canvas.width, this.canvas.height );
        gl.clearColor( 0, 0, 0.4, 1 );
        gl.clear( gl.COLOR_BUFFER_BIT );

        if( this.runnableObject.draw )
        {
            this.runnableObject.draw( this.camera );
        }

        // Restart the update/draw cycle.
        requestAnimationFrame( (currentTime) => this.update( currentTime ) );

        this.imgui.draw();
    }

    drawImGuiTestWindow()
    {
        this.imgui.window( "ImGui Test" );
        this.imgui.windows["ImGui Test"].size.setF32( 143, 120, 0 );
        this.imgui.text( "Te" );
        this.imgui.sameLine();
        this.imgui.text( "st" );
        this.imgui.text( "Pos:   " + this.imgui.windows["ImGui Test"].position.x + "," + this.imgui.windows["ImGui Test"].position.y );
        this.imgui.text( "Size:  " + this.imgui.windows["ImGui Test"].size.x + "," + this.imgui.windows["ImGui Test"].size.y );
        this.imgui.text( "Mouse: " + this.lastMousePosition.x + "," + this.lastMousePosition.y );
        this.imgui.text( "UI Scale " );
        this.imgui.sameLine();
        if( this.imgui.button( "1" ) )
            this.imgui.scale = 1;
        this.imgui.sameLine();
        if( this.imgui.button( "1.5" ) )
            this.imgui.scale = 1.5;
        this.imgui.sameLine();
        if( this.imgui.button( "2" ) )
            this.imgui.scale = 2;

        this.imgui.window( "ImGui Test" );
        this.imgui.text( "Test" );
        this.imgui.button( "Dummy" );
        this.imgui.button( "Dummy2" );
        this.imgui.sameLine();
        this.imgui.button( "Dummy3" );
    }

    registerDoMCallbacks()
    {
        // Register input callbacks.
        document.addEventListener( "mousemove", (event) => this.onMouseMove(event), false );
        document.addEventListener( "mousedown", (event) => this.onMouseDown(event), false );
        document.addEventListener( "mouseup",   (event) => this.onMouseUp(event),   false );
        document.addEventListener( "keydown",   (event) => this.onKeyDown(event),   false );
        document.addEventListener( "keyup",     (event) => this.onKeyUp(event),     false );
    
        // Set up extra vars for callbacks below... fix this.
        let fullFrame = this.fullFrame;
        let framework = this;

        // Set up document events.
        window.onresize = function()
        {
            if( fullFrame )
            {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;

                // Correct the canvas size for requested pixel ratio.
                this.canvas.width *= window.devicePixelRatio;
                this.canvas.height *= window.devicePixelRatio;
                this.canvas.style.width = (this.canvas.width / window.devicePixelRatio) + 'px';
                this.canvas.style.height = (this.canvas.height / window.devicePixelRatio) + 'px';
            }
        }
    
        window.onbeforeunload = function()
        {
            framework.shutdown();
            // return false; // If false is returned, the browser will pop-up a confirmation on unload.
        };
    }
    
    onMouseMove(event)
    {
        let x = (event.layerX - this.canvas.offsetLeft) * window.devicePixelRatio;
        let y = (event.layerY - this.canvas.offsetTop) * window.devicePixelRatio;
        let [orthoX, orthoY] = this.camera.convertMouseToOrtho( this.canvas, x, y );

        if( this.runnableObject.onMouseMove )
        {
            this.runnableObject.onMouseMove( event.which-1, x, y, orthoX, orthoY );
        }

        this.lastMousePosition.setF32( Math.trunc(x), Math.trunc(y), 0 );
    }

    onMouseDown(event)
    {
        let x = (event.layerX - this.canvas.offsetLeft) * window.devicePixelRatio;
        let y = (event.layerY - this.canvas.offsetTop) * window.devicePixelRatio;
        let [orthoX, orthoY] = this.camera.convertMouseToOrtho( this.canvas, x, y );

        if( this.runnableObject.onMouseDown )
        {
            this.runnableObject.onMouseDown( event.which-1, x, y, orthoX, orthoY );
        }

        this.imgui.mouseButtons[ event.which-1 ] = true;
    }

    onMouseUp(event)
    {
        let x = (event.layerX - this.canvas.offsetLeft) * window.devicePixelRatio;
        let y = (event.layerY - this.canvas.offsetTop) * window.devicePixelRatio;
        let [orthoX, orthoY] = this.camera.convertMouseToOrtho( this.canvas, x, y );

        if( this.runnableObject.onMouseUp )
        {
            this.runnableObject.onMouseUp( event.which-1, x, y, orthoX, orthoY );
        }

        this.imgui.mouseButtons[ event.which-1 ] = false;
    }

    onKeyDown(event)
    {
        this.keyStates[event.key] = 1;

        if( this.runnableObject.onKeyDown )
        {
            this.runnableObject.onKeyDown( event.key );
        }
    }

    onKeyUp(event)
    {
        this.keyStates[event.key] = 0;

        if( this.runnableObject.onKeyUp )
        {
            this.runnableObject.onKeyUp( event.key );
        }
    }

    shutdown()
    {
        this.gl.disableVertexAttribArray( 0 );

        this.resources.free();
        this.resources = null;

        this.gl.canvas.width = 1;
        this.gl.canvas.height = 1;

        if( this.runnableObject.shutdown )
        {
            this.runnableObject.shutdown();
        }

        this.camera.free();
        this.camera = null;

        log( "Shutdown!" );
    }
}