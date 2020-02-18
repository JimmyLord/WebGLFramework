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

        this.imgui.newFrame();

        this.camera.update();

        if( this.runnableObject.update )
        {
            this.runnableObject.update( deltaTime, currentTime );
        }

        this.imgui.text( "ABCDEFGHIJKLM" );
        this.imgui.text( "NOPQRSTUVWXYZ" );
        this.imgui.text( "TESTING ABC" );

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
        let x = event.layerX - this.canvas.offsetLeft;
        let y = event.layerY - this.canvas.offsetTop;
        let [orthoX, orthoY] = this.camera.convertMouseToOrtho( this.canvas, x, y );

        if( this.runnableObject.onMouseMove )
        {
            this.runnableObject.onMouseMove( event.which, x, y, orthoX, orthoY );
        }
    }

    onMouseDown(event)
    {
        let x = event.layerX - this.canvas.offsetLeft;
        let y = event.layerY - this.canvas.offsetTop;
        let [orthoX, orthoY] = this.camera.convertMouseToOrtho( this.canvas, x, y );

        if( this.runnableObject.onMouseDown )
        {
            this.runnableObject.onMouseDown( event.which, x, y, orthoX, orthoY );
        }
    }

    onMouseUp(event)
    {
        let x = event.layerX - this.canvas.offsetLeft;
        let y = event.layerY - this.canvas.offsetTop;
        let [orthoX, orthoY] = this.camera.convertMouseToOrtho( this.canvas, x, y );

        if( this.runnableObject.onMouseUp )
        {
            this.runnableObject.onMouseUp( event.which, x, y, orthoX, orthoY );
        }
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