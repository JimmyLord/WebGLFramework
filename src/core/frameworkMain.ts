import { color } from "../datatypes/color.js";
import { FrameworkParams } from "./frameworkParams.js";
import { ImGui } from "../imgui/imgui.js";
import { ResourceManager } from "./resourceManager.js";
import { vec2, vec3, vec4 } from "../datatypes/vector.js";

export let modifierKeyFlag =
{
    shift:  1,
    ctrl:   2,
    alt:    4,
}

export interface Runnable
{
    shutdown?(): void;

    update?(deltaTime: number, currentTime: number): void;
    draw?(): void;

    onResize?(): void;
    onBeforeUnload?(): void;
    onFocusChanged?(hasFocus: boolean): void;
    onPopState?(event: PopStateEvent): void;
    onHashChange?(hash: string): void;

    onMouseMove?(x: number, y: number): void;
    onMouseDown?(buttonID: number, x: number, y: number): void;
    onMouseUp?(buttonID: number, x: number, y: number): void;
    onMouseWheel?(direction: number): void;
    onKeyDown?(key: string, keyCode: number, modifierKeys: number): void;
    onKeyUp?(key: string, keyCode: number, modifierKeys: number): void;
}

export class FrameworkMain
{
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    resources: ResourceManager;
    imgui: ImGui;
    storage: Storage | null = null;

    runnableObject: Runnable | null = null;

    // Settings.
    showFPSCounter: boolean;
    autoRefresh: boolean;
    maxDeltaTime: number;
    clearColor: color;
    pauseOnFocusLoss: boolean;

    // Public members.
    runningTime: number;
    FPS: number;
    isVisible: boolean;

    // Internal members.
    frameCountInLastSecond: number;
    timeToNextFPSUpdate: number;
    lastTimeRefreshCalled: number;
    lastTime: number;

    // Input state.
    hasKeyboardFocus = true; // Used for multi-canvas setup.
    keyStates: any;
    mousePosition: vec2;
    mouseButtons: boolean[];
    simulateMouseWithFirstFinger: boolean;
    touches: TouchPoint[];

    // Canvas.
    fullFrame: boolean = false;

    // Bound functions for callbacks.
    updateThis: any;
    
    constructor(params: FrameworkParams)
    {
        if( params.canvasName == null ) { throw( "Canvas name not supplied in meta tag" ); }
        this.canvas = <HTMLCanvasElement>document.getElementById( params.canvasName );
        if( this.canvas == null ) { throw( "Failed to find canvas with name: " + params.canvasName ); }

        let gl = this.canvas.getContext( "webgl2" );
        if( gl == null ) { throw( "Failed to get WebGL context from canvas." ); }
        this.gl = gl;

        // Main object receiving update/draw/input calls.
        this.runnableObject = null;

        // Settings.
        this.showFPSCounter = false;
        this.autoRefresh = true;
        this.maxDeltaTime = 0; // Prevent deltaTime from getting bigger than this. 0 for unlimited.
        this.clearColor = new color( 0, 0, 0.4, 1 );
        this.pauseOnFocusLoss = true;

        // Public members.
        this.runningTime = 0;
        this.FPS = 0;
        this.isVisible = true;

        // Internal members.
        this.frameCountInLastSecond = 0;
        this.timeToNextFPSUpdate = 1;
        this.lastTimeRefreshCalled = 0;
        this.lastTime = 0;

        // Input state.
        this.keyStates = {};
        this.mousePosition = new vec2(0);
        this.mouseButtons = [ false, false, false ];
        this.simulateMouseWithFirstFinger = true;
        this.touches = []; // Array of TouchPoint classes.

        // Temp hacks for iPad.
        let iPad = false;
        let userAgent = navigator.userAgent.toLowerCase(); 
        if( userAgent.indexOf('safari') !== -1 )
        { 
            if( userAgent.indexOf('chrome') === -1 )
            {
                iPad = true;
            }
        }

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
        {
            if( params.fullFrame == true )
            {
                this.fullFrame = true;
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }
            else
            {
                if( params.width > 0 )
                    this.canvas.width = params.width;
                if( params.height > 0 )
                    this.canvas.height = params.height;
            }

            if( params.focus == false )
            {
                this.hasKeyboardFocus = false;
            }
        }

        // Correct the canvas size for requested pixel ratio.
        this.canvas.width *= window.devicePixelRatio;
        this.canvas.height *= window.devicePixelRatio;
        this.canvas.style.width = (this.canvas.width / window.devicePixelRatio) + 'px';
        this.canvas.style.height = (this.canvas.height / window.devicePixelRatio) + 'px';
        
        // Create an imgui instance.
        this.imgui = new ImGui( gl, this.canvas );
        if( this.storage !== null )
        {
            this.imgui.loadState( this.storage[ "imguiState" ] );
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

        // Bound functions for callbacks.
        this.updateThis = this.update.bind( this );
    }

    run(runnableObject: Runnable)
    {
        // Initial state for running.
        this.runnableObject = runnableObject;
        this.lastTime = performance.now();
        
        this.registerDoMCallbacks();

        // Start the update/draw cycle.
        this.refresh( true );
    }
    
    update(currentTime: number)
    {
        vec2.resetTemps();
        vec3.resetTemps();
        vec4.resetTemps();

        let deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Limit deltaTime, so no bit time steps will happen if framerate drops too low.
        if( this.maxDeltaTime !== 0 && deltaTime > this.maxDeltaTime )
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

        if( this.runnableObject?.update )
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

        if( this.runnableObject?.draw )
        {
            this.runnableObject.draw();
        }

        this.imgui.draw();
        if( this.storage !== null )
        {
            this.imgui.saveState( this.storage, "imguiState" );
        }

        let forceRefresh = false;
        if( this.imgui.needsRefresh )
        {
            forceRefresh = true;
        }

        // Don't refresh if we're not in focus.
        if( this.isVisible === false && this.pauseOnFocusLoss === true )
        {
            //console.log( "Pausing refresh" );
            return;
        }

        // Restart the update/draw cycle.
        if( this.autoRefresh || forceRefresh )
        {
            this.lastTimeRefreshCalled = this.lastTime;
            requestAnimationFrame( this.updateThis );
        }
    }

    refresh(force = false)
    {
        if( force === false && this.autoRefresh )
            return;

        // Only allow refresh to be called once for the current frame.
        if( this.lastTimeRefreshCalled !== this.lastTime )
        {
            this.lastTimeRefreshCalled = this.lastTime;
            requestAnimationFrame( this.updateThis );
        }
    }

    drawImGuiTestWindow()
    {
        this.imgui.window( "ImGui Test" );
        //this.imgui.windows["ImGui Test"].size.setF32( 143, 120 );
        this.imgui.text( "Test" );
        this.imgui.sameLine();
        this.imgui.text( " Focus:" + this.hasKeyboardFocus );
        let window = this.imgui.windows["ImGui Test"];
        this.imgui.text( "Pos:   " + Math.trunc( window.position.x ) + "," + Math.trunc( window.position.y ) );
        this.imgui.text( "Size:  " + Math.trunc( window.size.x ) + "," + Math.trunc( window.size.y ) );
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
        window.addEventListener( "popstate",     (event) => this.onPopState(event),     false );
        window.addEventListener( "hashchange",   (event) => this.onHashChange(event),   false );

        // Register document events.
        document.addEventListener( "mouseover",        (event) => this.onMouseOver(event),        false );
        document.addEventListener( "mousemove",        (event) => this.onMouseMove(event),        false );
        document.addEventListener( "mousedown",        (event) => this.onMouseDown(event),        false );
        document.addEventListener( "mouseup",          (event) => this.onMouseUp(event),          false );
        document.addEventListener( "wheel",            (event) => this.onMouseWheel(event),       false );
        document.addEventListener( "keydown",          (event) => this.onKeyDown(event),          false );
        document.addEventListener( "keyup",            (event) => this.onKeyUp(event),            false );
        document.addEventListener( "touchstart",       (event) => this.onTouchStart(event),       false );
        document.addEventListener( "touchmove",        (event) => this.onTouchMove(event),        false );
        document.addEventListener( "touchend",         (event) => this.onTouchEnd(event),         false );
        document.addEventListener( "touchcancel",      (event) => this.onTouchCancel(event),      false );
        document.addEventListener( "blur",             (event) => this.onBlur(event),             false );
        document.addEventListener( "focus",            (event) => this.onFocus(event),            false );
    }

    onBeforeUnload(event: BeforeUnloadEvent)
    {
        if( this.runnableObject?.onBeforeUnload )
        {
            this.runnableObject.onBeforeUnload();
        }
    }

    onUnload(event: Event)
    {
        this.shutdown();
    }
    
    onResize(event: UIEvent)
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

        // Let app know the canvas was resized.
        if( this.runnableObject?.onResize )
        {
            this.runnableObject.onResize();
        }
    }

    onPopState(event: PopStateEvent)
    {
        if( this.runnableObject?.onPopState )
        {
            this.runnableObject.onPopState( event );
        }
    }

    onHashChange(event: HashChangeEvent)
    {
        if( this.runnableObject?.onHashChange )
        {
            this.runnableObject.onHashChange( window.location.hash );
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

    getTouchPointByID(id: number)
    {
        for( let i=0; i<this.touches.length; i++ )
        {
            if( this.touches[i].id === id )
                return this.touches[i];
        }

        return null;
    }

    removeTouch(id: number)
    {
        for( let i=0; i<this.touches.length; i++ )
        {
            if( this.touches[i].id === id )
            {
                this.touches.splice( i, 1 );
                i--;
            }
        }
    }

    onTouchStart(event: TouchEvent)
    {
        //if( event.target != this.canvas ) { this.hasKeyboardFocus = false; return; }
        //else { this.hasKeyboardFocus = true; }

        let changedTouches = event.changedTouches;
        for( let i=0; i<changedTouches.length; i++ )
        {
            // TODO: Fix for GC.
            let t = new TouchPoint( changedTouches[i].clientX, changedTouches[i].clientY, changedTouches[i].identifier, this.touches.length === 0 );
            this.touches.push( t );
        }

        if( this.simulateMouseWithFirstFinger )
        {
            // If this is the first finger down, then send out some mouse events to the runnableObject.
            let firstTouch = this.getFirstTouchPoint();

            if( firstTouch !== null )
            {
                // TODO: Fix for GC.
                let fakeMouseEvent = {
                    which: 1,
                    offsetX: firstTouch.x,
                    offsetY: firstTouch.y,
                    target: event.target,
                }

                this.onMouseMove( fakeMouseEvent );
                this.imgui.setLastMousePosition( firstTouch.x * window.devicePixelRatio, firstTouch.y * window.devicePixelRatio );
                this.onMouseDown( fakeMouseEvent );

                //console.log( "Mouse Down: " + firstTouch.y );
            }
        }

        //// Cancel default event action.
        //event.preventDefault();
        //return false;
    }

    onTouchMove(event: TouchEvent)
    {
        // if( event.target != this.canvas ) { this.hasKeyboardFocus = false; return; }
        // else { this.hasKeyboardFocus = true; }

        let changedTouches = event.changedTouches;
        for( let i=0; i<changedTouches.length; i++ )
        {
            let t = this.getTouchPointByID( changedTouches[i].identifier );
            if( t !== null )
            {
                t.set( changedTouches[i].clientX, changedTouches[i].clientY, i, t.wasFirstFinger );
            }
        }

        if( this.simulateMouseWithFirstFinger )
        {
            // If this is the first finger down, then send out some mouse events to the runnableObject.
            let firstTouch = this.getFirstTouchPoint();

            if( firstTouch !== null )
            {
                // TODO: Fix for GC.
                let fakeMouseEvent = {
                    which: 1,
                    offsetX: firstTouch.x,
                    offsetY: firstTouch.y,
                    target: event.target,
                }

                this.onMouseMove( fakeMouseEvent );

                //console.log( "Mouse Move: " + firstTouch.y );
            }
        }

        //// Cancel default event action.
        //event.preventDefault();
        //return false;
    }

    onTouchEnd(event: TouchEvent)
    {
        // if( event.target != this.canvas ) { this.hasKeyboardFocus = false; return; }
        // else { this.hasKeyboardFocus = true; }

        let changedTouches = event.changedTouches;
        for( let i=0; i<changedTouches.length; i++ )
        {
            let t = this.getTouchPointByID( changedTouches[i].identifier );
            if( t !== null )
            {
                t.set( changedTouches[i].clientX, changedTouches[i].clientY, i, t.wasFirstFinger );
            }
        }

        if( this.simulateMouseWithFirstFinger )
        {
            // If this is the first finger down, then send out some mouse events to the runnableObject.
            let firstTouch = this.getFirstTouchPoint();

            if( firstTouch !== null )
            {
                // TODO: Fix for GC.
                let fakeMouseEvent = {
                    which: 1,
                    offsetX: firstTouch.x,
                    offsetY: firstTouch.y,
                    target: event.target,
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
        //event.preventDefault();
        //return false;
    }

    onTouchCancel(event: TouchEvent)
    {
        // if( event.target != this.canvas ) { this.hasKeyboardFocus = false; return; }
        // else { this.hasKeyboardFocus = true; }

        // Remove these touches from the list.
        let changedTouches = event.changedTouches;
        for( let i=0; i<changedTouches.length; i++ )
        {
            let t = this.getTouchPointByID( changedTouches[i].identifier );
            if( t !== null )
            {
                t.set( changedTouches[i].clientX, changedTouches[i].clientY, i, false );
            }
        }

        if( this.simulateMouseWithFirstFinger )
        {
            // If this is the first finger down, then send out some mouse events to the runnableObject.
            let firstTouch = this.getFirstTouchPoint();

            if( firstTouch !== null )
            {
                // TODO: Fix for GC.
                let fakeMouseEvent = {
                    which: 1,
                    offsetX: firstTouch.x,
                    offsetY: firstTouch.y,
                    target: event.target,
                }

                this.onMouseMove( fakeMouseEvent );
                this.onMouseUp( fakeMouseEvent );

                //console.log( "Mouse Up: " + firstTouch.y );
            }
        }

        for( let i=0; i<changedTouches.length; i++ )
        {
            this.removeTouch( changedTouches[i].identifier );
        }

        //// Cancel default event action.
        //event.preventDefault();
        //return false;
    }

    onBlur(event: FocusEvent)
    {
        //console.log( "Focus lost" );

        this.isVisible = false;

        if( this.runnableObject?.onFocusChanged )
        {
            // Let app know focus was lost.
            this.runnableObject.onFocusChanged( false );
        }
    }

    onFocus(event: FocusEvent)
    {
        //console.log( "Focus gained" );

        this.isVisible = true;

        if( this.runnableObject?.onFocusChanged )
        {
            // Let app know focus was gained.
            this.runnableObject.onFocusChanged( true );
        }
        
        // Force a refresh when we gain focus.
        this.refresh( true );
    }

    onMouseOver(event: MouseEvent)
    {
        if( event.target != this.canvas ) { return; }

        // Should fire when page is loaded... but seems inconsistant on FireFox.
        // Mainly needed to prevent a bug if mouseDown is sent before mouseMove.
        //    Imgui won't have had a chance to check if the mouse is hovering over any window or control
        //    since it doesn't know the mouse position until it's too late.
        let x = event.offsetX * window.devicePixelRatio;
        let y = event.offsetY * window.devicePixelRatio;

        this.mousePosition.setF32( Math.trunc(x), Math.trunc(y) );

        // Cancel default event action.
        event.preventDefault();
        return false;
    }

    onMouseMove(event: any)
    {
        if( event.target != this.canvas ) { return; }

        let x = event.offsetX * window.devicePixelRatio;
        let y = event.offsetY * window.devicePixelRatio;

        this.mousePosition.setF32( Math.trunc(x), Math.trunc(y) );

        if( this.runnableObject?.onMouseMove )
        {
            this.runnableObject.onMouseMove( x, y );
        }

        // Cancel default event action.
        //event.preventDefault();
        return false;
    }

    onMouseDown(event: any)
    {
        if( event.target != this.canvas ) { this.hasKeyboardFocus = false; return; }
        else { this.hasKeyboardFocus = true; }

        //console.log( "onMouseDown" );

        let x = event.offsetX * window.devicePixelRatio;
        let y = event.offsetY * window.devicePixelRatio;

        this.mousePosition.setF32( Math.trunc(x), Math.trunc(y) );
        this.mouseButtons[ event.which-1 ] = true;

        if( this.runnableObject?.onMouseDown )
        {
            this.runnableObject.onMouseDown( event.which-1, x, y );
        }

        // Cancel default event action.
        //event.preventDefault();
        return false;
    }

    onMouseUp(event: any)
    {
        //if( event.target != this.canvas ) { this.hasKeyboardFocus = false; return; }
        //else { this.hasKeyboardFocus = true; }

        //console.log( "onMouseUp" );

        let x = event.offsetX * window.devicePixelRatio;
        let y = event.offsetY * window.devicePixelRatio;

        this.mousePosition.setF32( Math.trunc(x), Math.trunc(y) );
        this.mouseButtons[ event.which-1 ] = false;

        if( this.runnableObject?.onMouseUp )
        {
            this.runnableObject.onMouseUp( event.which-1, this.mousePosition.x, this.mousePosition.y );
        }

        // Cancel default event action.
        //event.preventDefault();
        return false;
    }

    onMouseWheel(event: WheelEvent)
    {
        if( event.target != this.canvas ) { this.hasKeyboardFocus = false; return; }
        else { this.hasKeyboardFocus = true; }

        let x = event.offsetX * window.devicePixelRatio;
        let y = event.offsetY * window.devicePixelRatio;

        this.mousePosition.setF32( Math.trunc(x), Math.trunc(y) );
        let direction = Math.sign( event.deltaY );

        if( this.runnableObject?.onMouseWheel )
        {
            this.runnableObject.onMouseWheel( direction );
        }
    }

    onKeyDown(event: KeyboardEvent)
    {
        if( this.hasKeyboardFocus == false ) { return }

        this.keyStates[event.key] = 1;

        if( event.repeat === true )
            return;

        let modifierKeys = 0;
        if( event.shiftKey ) modifierKeys |= modifierKeyFlag.shift;
        if( event.ctrlKey ) modifierKeys |= modifierKeyFlag.ctrl;
        if( event.altKey ) modifierKeys |= modifierKeyFlag.alt;

        if( this.runnableObject?.onKeyDown )
        {
            this.runnableObject.onKeyDown( event.key, event.keyCode, modifierKeys );
        }

        if( this.imgui )
        {
            this.imgui.keyBuffer.push( event.key );

            if( this.imgui.controlInEditMode != null )
            {
                //event.preventDefault();
                return false;
            }
        }
    }

    onKeyUp(event: KeyboardEvent)
    {
        if( this.hasKeyboardFocus == false ) { return }

        this.keyStates[event.key] = 0;

        if( event.repeat === true )
            return;

        let modifierKeys = 0;
        if( event.shiftKey ) modifierKeys |= modifierKeyFlag.shift;
        if( event.ctrlKey ) modifierKeys |= modifierKeyFlag.ctrl;
        if( event.altKey ) modifierKeys |= modifierKeyFlag.alt;

        if( this.runnableObject?.onKeyUp )
        {
            this.runnableObject.onKeyUp( event.key, event.keyCode, modifierKeys );
        }
    }

    shutdown()
    {
        if( this.resources )
        {
            this.resources.free();
        }

        if( this.gl )
        {
            this.gl.disableVertexAttribArray( 0 );
            this.gl.canvas.width = 1;
            this.gl.canvas.height = 1;
        }

        if( this.runnableObject?.shutdown )
        {
            this.runnableObject.shutdown();
        }

        console.log( "Shutdown!" );
    }
}

class TouchPoint
{
    x: number;
    y: number;
    id: number;
    wasFirstFinger: boolean;

    constructor(x: number, y: number, id: number, wasFirst: boolean)
    {
        this.x = x;
        this.y = y;
        this.id = id;
        this.wasFirstFinger = wasFirst;
    }

    set(x: number, y: number, id: number, wasFirst: boolean)
    {
        this.x = x;
        this.y = y;
        if( id !== undefined )
            this.id = id;
        if( wasFirst !== undefined )
            this.wasFirstFinger = wasFirst;
    }
}
