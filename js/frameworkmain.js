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

        // Get local storage.
        this.storage = window.localStorage;

        // Set some members.
        this.gl = gl;
        this.keyStates = new Map;
        this.lastMousePosition = new vec2(0);

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
        this.imgui.loadState( this.storage.imguiState );
    
        // Set up some base common resources.
        let resources = new ResourceManager( gl );
        this.resources = resources;

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

        this.imgui.mousePosition.setF32( this.lastMousePosition.x, this.lastMousePosition.y );
        this.imgui.newFrame( deltaTime );

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
            this.runnableObject.draw();
        }

        // Restart the update/draw cycle.
        requestAnimationFrame( (currentTime) => this.update( currentTime ) );

        this.imgui.draw();
        this.imgui.saveState( this.storage, "imguiState" );
    }

    drawImGuiTestWindow()
    {
        this.imgui.window( "ImGui Test" );
        //this.imgui.windows["ImGui Test"].size.setF32( 143, 120 );
        this.imgui.text( "Te" );
        this.imgui.sameLine();
        this.imgui.text( "st" );
        this.imgui.text( "Pos:   " + Math.trunc( this.imgui.windows["ImGui Test"].position.x ) + "," + Math.trunc( this.imgui.windows["ImGui Test"].position.y ) );
        this.imgui.text( "Size:  " + Math.trunc( this.imgui.windows["ImGui Test"].size.x ) + "," + Math.trunc( this.imgui.windows["ImGui Test"].size.y ) );
        this.imgui.text( "Mouse: " + this.lastMousePosition.x + "," + this.lastMousePosition.y );

        this.imgui.window( "ImGui Test" );
        this.imgui.text( "UI Scale:" );
        this.imgui.sameLine();
        if( this.imgui.button( "1" ) ) { this.imgui.scale = 1; this.imgui.markStateDirty(); }
        this.imgui.sameLine();
        if( this.imgui.button( "1.5" ) ) { this.imgui.scale = 1.5; this.imgui.markStateDirty(); }
        this.imgui.sameLine();
        if( this.imgui.button( "2" ) ) { this.imgui.scale = 2; this.imgui.markStateDirty(); }
    }

    registerDoMCallbacks()
    {
        // Register window events.
        window.addEventListener( "beforeunload", (event) => this.onBeforeUnload(event), false );
        window.addEventListener( "unload",       (event) => this.onUnload(event),       false );
        window.addEventListener( "resize",       (event) => this.onResize(event),       false );

        // Register document events.
        document.addEventListener( "mousemove",    (event) => this.onMouseMove(event),    false );
        document.addEventListener( "mousedown",    (event) => this.onMouseDown(event),    false );
        document.addEventListener( "mouseup",      (event) => this.onMouseUp(event),      false );
        document.addEventListener( "wheel",        (event) => this.onMouseWheel(event),   false );
        document.addEventListener( "keydown",      (event) => this.onKeyDown(event),      false );
        document.addEventListener( "keyup",        (event) => this.onKeyUp(event),        false );
    }

    onBeforeUnload(event)
    {
        if( this.runnableObject.onBeforeUnload )
        {
            this.runnableObject.onBeforeUnload();
        }
    }

    onUnload(event)
    {
        this.shutdown();
    }
    
    onResize(event)
    {
        if( this.fullFrame )
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

    onMouseMove(event)
    {
        let x = (event.layerX - this.canvas.offsetLeft) * window.devicePixelRatio;
        let y = (event.layerY - this.canvas.offsetTop) * window.devicePixelRatio;

        if( this.runnableObject.onMouseMove )
        {
            this.runnableObject.onMouseMove( event.which-1, x, y );
        }

        this.lastMousePosition.setF32( Math.trunc(x), Math.trunc(y) );
    }

    onMouseDown(event)
    {
        let x = (event.layerX - this.canvas.offsetLeft) * window.devicePixelRatio;
        let y = (event.layerY - this.canvas.offsetTop) * window.devicePixelRatio;

        if( this.runnableObject.onMouseDown )
        {
            this.runnableObject.onMouseDown( event.which-1, x, y );
        }

        this.imgui.mouseButtons[ event.which-1 ] = true;
    }

    onMouseUp(event)
    {
        let x = (event.layerX - this.canvas.offsetLeft) * window.devicePixelRatio;
        let y = (event.layerY - this.canvas.offsetTop) * window.devicePixelRatio;

        if( this.runnableObject.onMouseUp )
        {
            this.runnableObject.onMouseUp( event.which-1, x, y );
        }

        this.imgui.mouseButtons[ event.which-1 ] = false;
    }

    onMouseWheel(event)
    {
        let direction = Math.sign( event.deltaY );

        if( this.runnableObject.onMouseWheel )
        {
            this.runnableObject.onMouseWheel( direction );
        }
    }

    onKeyDown(event)
    {
        this.keyStates[event.key] = 1;

        if( this.runnableObject.onKeyDown )
        {
            this.runnableObject.onKeyDown( event.key );
        }

        this.imgui.keyBuffer.push( event.key );
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

        log( "Shutdown!" );
    }
}