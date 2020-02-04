function log(str)
{
    var newElem = document.createElement( 'p' ); 
    newElem.appendChild( document.createTextNode( str ) );
    document.body.appendChild( newElem );
}

// Params:
//    canvasName="MainCanvas"
//    width=600
//    height=400
//    fullFrame="true" or 1
function main()
{
    m_KeyStates = new Map;

    // Get the canvas and the OpenGL context.
    var canvas = document.getElementById( document.currentScript.getAttribute( "canvasName" ) );
    var gl = canvas.getContext( "webgl" );
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
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    else
    {
        canvas.width = document.currentScript.getAttribute( "width" );
        canvas.height = document.currentScript.getAttribute( "height" );
    }

    // Setup our resources.
    var resources = new ResourceManager( gl );
    resources.m_Meshes["Triangle"] = new Mesh( gl );
    resources.m_Meshes["Triangle"].createTriangle( new vec3( 0.5, 0.5 ) );
    resources.m_Materials["red"]   = new Material( resources.m_Shaders["color"], new color( 1, 0, 0, 1 ) );
    resources.m_Materials["green"] = new Material( resources.m_Shaders["color"], new color( 0, 1, 0, 1 ) );
    resources.m_Materials["blue"]  = new Material( resources.m_Shaders["color"], new color( 0, 0, 1, 1 ) );

    // Setup some entities.
    var entities = [];
    entities.push( new Entity( new vec3(0), resources.m_Meshes["Triangle"], resources.m_Materials["red"] ) );
    entities.push( new Entity( new vec3(0), resources.m_Meshes["Triangle"], resources.m_Materials["green"] ) );
    entities.push( new Entity( new vec3(0), resources.m_Meshes["Triangle"], resources.m_Materials["blue"] ) );

    // Start the update/draw cycle.
    requestAnimationFrame( update );

    var lastTime = null;
    function update(currentTime)
    {
        if( lastTime == null )
            lastTime = currentTime;
        deltaTime = (currentTime - lastTime) / 1000.0;
        lastTime = currentTime;

        //entities[0].m_position.x += deltaTime;
        entities[1].m_position.x = Math.cos( currentTime/1000.0 );
        entities[1].m_position.y = Math.sin( currentTime/1000.0 );

        dir = new vec3(0);
        if( this.m_KeyStates[65] )
            dir.x = -1;
        if( this.m_KeyStates[68] )
            dir.x = 1;
        if( this.m_KeyStates[83] )
            dir.y = -1;
        if( this.m_KeyStates[87] )
            dir.y = 1;

        entities[2].m_position.x += dir.x * deltaTime;
        entities[2].m_position.y += dir.y * deltaTime;

        draw();
    }

    function draw()
    {
        gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
        gl.clearColor( 0, 0, 0.4, 1 );
        gl.clear( gl.COLOR_BUFFER_BIT );

        entities.forEach( entity => entity.draw() );

        requestAnimationFrame( update );
    }

    function shutdown()
    {
        gl.disableVertexAttribArray( 0 );

        resources.free();
        resources = null;

        gl.canvas.width = 1;
        gl.canvas.height = 1;

        log( "Shutdown!" );
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

        entities[0].m_position.x = x / canvas.width * 2 - 1;
        entities[0].m_position.y = (canvas.height - y) / canvas.height * 2 - 1;
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
        m_KeyStates[event.keyCode] = 1;
    }

    function onKeyUp(event)
    {
        m_KeyStates[event.keyCode] = 0;
    }

    // Setup document events.
    window.onresize = function()
    {
        if( fullFrame )
        {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    window.onbeforeunload = function()
    {
        shutdown();
        // return false; // If false is returned, the browser will pop-up a confirmation on unload.
    };
}

main()
