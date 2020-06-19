// Params:
//    canvasName="MainCanvas"
//    width=600
//    height=400
//    fullFrame="true" or 1
class FrameworkMain
{
    constructor()
    {
        // Settings.
        this.showFPSCounter = false;
        this.autoRefresh = true;
        this.maxDeltaTime = 0; // Prevent deltaTime from getting bigger than this. 0 for unlimited.
        this.clearColor = new color( 0, 0, 0.4, 1 );

        // Public members.
        this.runningTime = 0;
        this.FPS = 0;

        // Internal members.
        this.frameCountInLastSecond = 0;
        this.timeToNextFPSUpdate = 1;
        this.lastTimeRefreshCalled = 0;

        // Input state.
        this.keyStates = new Map;
        this.mousePosition = new vec2(0);
        this.mouseButtons = [ false, false, false ];
        this.simulateMouseWithFirstFinger = true;
        this.touches = []; // Array of TouchPoint classes.

        // Temp hacks for iPad.
        let iPad = false;
        let userAgent = navigator.userAgent.toLowerCase(); 
        if( userAgent.indexOf('safari') != -1 )
        { 
            if( userAgent.indexOf('chrome') == -1 )
            {
                iPad = true;
            }
        }

        // Get the canvas and the OpenGL context.
        this.canvas = document.getElementById( document.currentScript.getAttribute( "canvasName" ) );
        let gl = this.canvas.getContext( "webgl2" );
        if( gl == 0 )
        {
            log( "Failed to get WebGL context from canvas." );
            return;
        }
        this.gl = gl;

        // Get local storage.
        try { this.storage = window.localStorage }
        catch( e ) { this.storage = null; }

        // Disable local storage on safari, temp hack for ipad testing.
        if( iPad )
        {
            this.storage = null;
        }

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
        if( this.storage != null )
        {
            this.imgui.loadState( this.storage.imguiState );
        }

        if( iPad )
        {
            this.imgui.scale = 4;
        }
    
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

        // Limit deltaTime, so no bit time steps will happen if framerate drops too low.
        if( this.maxDeltaTime != 0 && deltaTime > this.maxDeltaTime )
            deltaTime = this.maxDeltaTime;

        this.runningTime += deltaTime;

        this.timeToNextFPSUpdate -= deltaTime;
        if( this.timeToNextFPSUpdate <= 0.001 )
        {
            this.FPS = this.frameCountInLastSecond;
            this.frameCountInLastSecond = 0;
            this.timeToNextFPSUpdate = 1;
        }
        this.frameCountInLastSecond++;

        this.imgui.mousePosition.set( this.mousePosition );
        for( let i=0; i<this.mouseButtons.length; i++ )
        {
            this.imgui.mouseButtons[i] = this.mouseButtons[i];
        }
        this.imgui.newFrame( deltaTime );

        if( this.showFPSCounter )
        {
            this.imgui.addStringToDrawList( "FPS " + this.FPS, this.canvas.width/this.imgui.scale - 8*6 - 2, 2 );
        }

        if( this.runnableObject.update )
        {
            this.runnableObject.update( deltaTime, this.runningTime );
        }

        this.draw();
    }
    
    draw()
    {
        let gl = this.gl;
        
        gl.viewport( 0, 0, this.canvas.width, this.canvas.height );
        gl.clearColor( this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a );
        gl.clear( gl.COLOR_BUFFER_BIT );

        if( this.runnableObject.draw )
        {
            this.runnableObject.draw();
        }

        this.imgui.draw();
        if( this.storage != null )
        {
            this.imgui.saveState( this.storage, "imguiState" );
        }

        // Restart the update/draw cycle.
        if( this.autoRefresh )
        {
            this.lastTimeRefreshCalled = this.lastTime;
            requestAnimationFrame( (currentTime) => this.update( currentTime ) );
        }
    }

    refresh()
    {
        if( this.autoRefresh )
            return;

        // Only allow refresh to be called once for the current frame.
        if( this.lastTimeRefreshCalled != this.lastTime )
        {
            this.lastTimeRefreshCalled = this.lastTime;
            requestAnimationFrame( (currentTime) => this.update( currentTime ) );
        }
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
        this.imgui.text( "Mouse: " + this.mousePosition.x + "," + this.mousePosition.y );

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
        document.addEventListener( "mouseover",    (event) => this.onMouseOver(event),    false );
        document.addEventListener( "mousemove",    (event) => this.onMouseMove(event),    false );
        document.addEventListener( "mousedown",    (event) => this.onMouseDown(event),    false );
        document.addEventListener( "mouseup",      (event) => this.onMouseUp(event),      false );
        document.addEventListener( "wheel",        (event) => this.onMouseWheel(event),   false );
        document.addEventListener( "keydown",      (event) => this.onKeyDown(event),      false );
        document.addEventListener( "keyup",        (event) => this.onKeyUp(event),        false );
        document.addEventListener( "touchstart",   (event) => this.onTouchStart(event),   false );
        document.addEventListener( "touchmove",    (event) => this.onTouchMove(event),    false );
        document.addEventListener( "touchend",     (event) => this.onTouchEnd(event),     false );
        document.addEventListener( "touchcancel",  (event) => this.onTouchCancel(event),  false );
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

    // Touch helpers.
    getFirstTouchPoint()
    {
        for( let i=0; i<this.touches.length; i++ )
        {
            if( this.touches[i].wasFirstFinger )
                return this.touches[i];
        }

        return null;
    }

    getTouchPointByID(id)
    {
        for( let i=0; i<this.touches.length; i++ )
        {
            if( this.touches[i].id == id )
                return this.touches[i];
        }

        return null;
    }

    removeTouch(id)
    {
        for( let i=0; i<this.touches.length; i++ )
        {
            if( this.touches[i].id == id )
            {
                this.touches.splice( i, 1 );
                i--;
            }
        }
    }

    onTouchStart(event)
    {
        let changedTouches = event.changedTouches;
        for( let i=0; i<changedTouches.length; i++ )
        {
            let t = new TouchPoint( changedTouches[i].clientX, changedTouches[i].clientY, changedTouches[i].identifier, this.touches.length == 0 );
            this.touches.push( t );
        }

        if( this.simulateMouseWithFirstFinger )
        {
            // If this is the first finger down, then send out some mouse events to the runnableObject.
            let firstTouch = this.getFirstTouchPoint();

            if( firstTouch !== null )
            {
                let fakeMouseEvent = {
                    which: 1,
                    layerX: firstTouch.x,
                    layerY: firstTouch.y,
                }

                this.onMouseMove( fakeMouseEvent );
                this.imgui.setLastMousePosition( firstTouch.x * window.devicePixelRatio, firstTouch.y * window.devicePixelRatio );
                this.onMouseDown( fakeMouseEvent );

                //console.log( "Mouse Down: " + firstTouch.y );
            }
        }

        //// Cancel default event action.
        //if( event.preventDefault ) event.preventDefault();
        //else event.returnValue = false;
        //return false;
    }

    onTouchMove(event)
    {
        let changedTouches = event.changedTouches;
        for( let i=0; i<changedTouches.length; i++ )
        {
            let t = this.getTouchPointByID( changedTouches[i].identifier );
            if( t !== null )
            {
                t.set( changedTouches[i].clientX, changedTouches[i].clientY );
            }
        }

        if( this.simulateMouseWithFirstFinger )
        {
            // If this is the first finger down, then send out some mouse events to the runnableObject.
            let firstTouch = this.getFirstTouchPoint();

            if( firstTouch !== null )
            {
                let fakeMouseEvent = {
                    which: 1,
                    layerX: firstTouch.x,
                    layerY: firstTouch.y,
                }

                this.onMouseMove( fakeMouseEvent );

                //console.log( "Mouse Move: " + firstTouch.y );
            }
        }

        //// Cancel default event action.
        //if( event.preventDefault ) event.preventDefault();
        //else event.returnValue = false;
        //return false;
    }

    onTouchEnd(event)
    {
        let changedTouches = event.changedTouches;
        for( let i=0; i<changedTouches.length; i++ )
        {
            let t = this.getTouchPointByID( changedTouches[i].identifier );
            if( t !== null )
            {
                t.set( changedTouches[i].clientX, changedTouches[i].clientY );
            }
        }

        if( this.simulateMouseWithFirstFinger )
        {
            // If this is the first finger down, then send out some mouse events to the runnableObject.
            let firstTouch = this.getFirstTouchPoint();

            if( firstTouch !== null )
            {
                let fakeMouseEvent = {
                    which: 1,
                    layerX: firstTouch.x,
                    layerY: firstTouch.y,
                }

                this.onMouseMove( fakeMouseEvent );
                this.onMouseUp( fakeMouseEvent );

                //console.log( "Mouse Up: " + firstTouch.y );
            }
        }

        // Remove these touches from the list.
        for( let i=0; i<changedTouches.length; i++ )
        {
            this.removeTouch( changedTouches[i].identifier );
        }

        //// Cancel default event action.
        //if( event.preventDefault ) event.preventDefault();
        //else event.returnValue = false;
        //return false;
    }

    onTouchCancel(event)
    {
        // Remove these touches from the list.
        let changedTouches = event.changedTouches;
        for( let i=0; i<changedTouches.length; i++ )
        {
            this.removeTouch( changedTouches[i].identifier );
        }

        //// Cancel default event action.
        //if( event.preventDefault ) event.preventDefault();
        //else event.returnValue = false;
        //return false;
    }

    onMouseOver(event)
    {
        // Should fire when page is loaded... but seems inconsistant on FireFox.
        // Mainly needed to prevent a bug if mouseDown is sent before mouseMove.
        //    Imgui won't have had a chance to check if the mouse is hovering over any window or control
        //    since it doesn't know the mouse position until it's too late.
        let x = (event.layerX - this.canvas.offsetLeft) * window.devicePixelRatio;
        let y = (event.layerY - this.canvas.offsetTop) * window.devicePixelRatio;

        this.mousePosition.setF32( Math.trunc(x), Math.trunc(y) );

        // Cancel default event action.
        if( event.preventDefault ) event.preventDefault();
        else event.returnValue = false;
        return false;
    }

    onMouseMove(event)
    {
        let x = (event.layerX - this.canvas.offsetLeft) * window.devicePixelRatio;
        let y = (event.layerY - this.canvas.offsetTop) * window.devicePixelRatio;

        this.mousePosition.setF32( Math.trunc(x), Math.trunc(y) );

        if( this.runnableObject.onMouseMove )
        {
            this.runnableObject.onMouseMove( x, y );
        }

        // Cancel default event action.
        if( event.preventDefault ) event.preventDefault();
        else event.returnValue = false;
        return false;
    }

    onMouseDown(event)
    {
        //console.log( "onMouseDown" );

        let x = (event.layerX - this.canvas.offsetLeft) * window.devicePixelRatio;
        let y = (event.layerY - this.canvas.offsetTop) * window.devicePixelRatio;

        this.mousePosition.setF32( Math.trunc(x), Math.trunc(y) );
        this.mouseButtons[ event.which-1 ] = true;

        if( this.runnableObject.onMouseDown )
        {
            this.runnableObject.onMouseDown( event.which-1, x, y );
        }

        // Cancel default event action.
        if( event.preventDefault ) event.preventDefault();
        else event.returnValue = false;
        return false;
    }

    onMouseUp(event)
    {
        //console.log( "onMouseUp" );

        let x = (event.layerX - this.canvas.offsetLeft) * window.devicePixelRatio;
        let y = (event.layerY - this.canvas.offsetTop) * window.devicePixelRatio;

        this.mousePosition.setF32( Math.trunc(x), Math.trunc(y) );
        this.mouseButtons[ event.which-1 ] = false;

        if( this.runnableObject.onMouseUp )
        {
            this.runnableObject.onMouseUp( event.which-1, x, y );
        }

        // Cancel default event action.
        if( event.preventDefault ) event.preventDefault();
        else event.returnValue = false;
        return false;
    }

    onMouseWheel(event)
    {
        let x = (event.layerX - this.canvas.offsetLeft) * window.devicePixelRatio;
        let y = (event.layerY - this.canvas.offsetTop) * window.devicePixelRatio;

        this.mousePosition.setF32( Math.trunc(x), Math.trunc(y) );
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

class TouchPoint
{
    constructor(x, y, id, wasFirst)
    {
        this.x = x;
        this.y = y;
        this.id = id;
        this.wasFirstFinger = wasFirst;
    }

    set(x, y, id, wasFirst)
    {
        this.x = x;
        this.y = y;
        if( id !== undefined )
            this.id = id;
        if( wasFirst !== undefined )
            this.wasFirstFinger = wasFirst;
    }
}
