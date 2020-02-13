class FrameworkMain
{
    constructor(runnableObject)
    {
        this.keyStates = new Map;

        // Get the canvas and the OpenGL context.
        this.canvas = document.getElementById( document.currentScript.getAttribute( "canvasName" ) );
        this.gl = this.canvas.getContext( "webgl" );
        var gl = this.gl;
        if( gl == 0 )
        {
            log( "Failed to get WebGL context from canvas." );
            return;
        }
    
        // Set the size of the canvas.
        if( document.currentScript.getAttribute( "fullFrame" ) == "true" ||
            document.currentScript.getAttribute( "fullFrame" ) == 1 )
        {
            var fullFrame = true;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
        else
        {
            this.canvas.width = document.currentScript.getAttribute( "width" );
            this.canvas.height = document.currentScript.getAttribute( "height" );
        }
    
        // Setup our resources.
        this.resources = new ResourceManager( gl );
        var resources = this.resources;

        resources.meshes["triangle"] = new Mesh( gl );
        resources.meshes["triangle"].createTriangle( new vec3( 0.5, 0.5 ) );
        resources.meshes["circle"] = new Mesh( gl );
        resources.meshes["circle"].createCircle( 200, 0.2 );
        resources.meshes["cube"] = new Mesh( gl );
        resources.meshes["cube"].createCube( new vec3( 1, 1, 1 ) );
    
        resources.textures["testTexture"] = new Texture( gl, "data/textures/test.png" );
        
        resources.materials["red"] = new Material( resources.shaders["uniformColor"], new color( 1, 0, 0, 1 ), null );
        resources.materials["green"] = new Material( resources.shaders["uniformColor"], new color( 0, 1, 0, 1 ), null );
        resources.materials["blue"] = new Material( resources.shaders["uniformColor"], new color( 0, 0, 1, 1 ), null );
        resources.materials["testTexture"] = new Material( resources.shaders["texture"], new color( 0, 0, 0, 1 ), resources.textures["testTexture"] );
        resources.materials["vertexColor"] = new Material( resources.shaders["vertexColor"], new color( 0, 0, 1, 1 ), null );
    
        this.camera = new Camera( new vec3(0, 0, -3), false, 2, this.canvas.width / this.canvas.height );
    
        gl.enable( gl.DEPTH_TEST );
        gl.enable( gl.CULL_FACE );
        gl.cullFace( gl.BACK );
        gl.frontFace( gl.CW );
    }

    run(runnableObject)
    {
        var camera = this.camera;
        var keyStates = this.keyStates;
        var gl = this.gl;
        var canvas = this.canvas;
        var framework = this;

        // Start the update/draw cycle.
        requestAnimationFrame( update );
    
        var lastTime = null;
        function update(currentTime)
        {
            if( lastTime == null )
                lastTime = currentTime;
            var deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
    
            camera.update();

            runnableObject.update( deltaTime, currentTime );
    
            draw();
        }
    
        function draw()
        {
            gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
            gl.clearColor( 0, 0, 0.4, 1 );
            gl.clear( gl.COLOR_BUFFER_BIT );
    
            runnableObject.draw( camera );

            requestAnimationFrame( update );
        }
    
        // Register input callbacks.
        document.addEventListener( "mousemove", onMouseMove, false );
        document.addEventListener( "mousedown", onMouseDown, false );
        document.addEventListener( "mouseup",   onMouseUp,   false );
        document.addEventListener( "keydown",   onKeyDown,   false );
        document.addEventListener( "keyup",     onKeyUp,     false );
    
        function onMouseMove(event)
        {
            var x = event.layerX - canvas.offsetLeft;
            var y = event.layerY - canvas.offsetTop;
    
            var orthoScaleX = camera.matProj.m[0];
            var orthoOffsetX = camera.matProj.m[12];
            var orthoScaleY = camera.matProj.m[5];
            var orthoOffsetY = camera.matProj.m[13];

            var orthoX = ((x / canvas.width) / orthoScaleX) * 2 - ((1 + orthoOffsetX) / orthoScaleX);
            var orthoY = (((canvas.height - y) / canvas.height) / orthoScaleY) * 2 - ((1 + orthoOffsetY) / orthoScaleY);

            runnableObject.onMouseMove( x, y, orthoX, orthoY );
        }
    
        function onMouseDown(event)
        {
            var x = event.layerX - canvas.offsetLeft;
            var y = event.layerY - canvas.offsetTop;
        }
    
        function onMouseUp(event)
        {
            var x = event.layerX - canvas.offsetLeft;
            var y = event.layerY - canvas.offsetTop;
        }
    
        function onKeyDown(event)
        {
            keyStates[event.key] = 1;
        }
    
        function onKeyUp(event)
        {
            keyStates[event.key] = 0;
        }
    
        // Setup document events.
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
            framework.shutdown( runnableObject );
            // return false; // If false is returned, the browser will pop-up a confirmation on unload.
        };
    }

    shutdown(runnableObject)
    {
        this.gl.disableVertexAttribArray( 0 );

        this.resources.free();
        this.resources = null;

        this.gl.canvas.width = 1;
        this.gl.canvas.height = 1;

        runnableObject.shutdown();

        this.camera.free();
        this.camera = null;

        log( "Shutdown!" );
    }
}