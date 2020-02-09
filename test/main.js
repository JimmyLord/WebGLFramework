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
    resources.m_meshes["triangle"] = new Mesh( gl );
    resources.m_meshes["triangle"].createTriangle( new vec3( 0.5, 0.5 ) );
    resources.m_meshes["circle"] = new Mesh( gl );
    resources.m_meshes["circle"].createCircle( 200, 0.2 );
    resources.m_meshes["cube"] = new Mesh( gl );
    resources.m_meshes["cube"].createCube( new vec3( 1, 1, 1 ) );

    resources.m_textures["testTexture"] = new Texture( gl, "data/textures/test.png" );
    
    resources.m_materials["red"] = new Material( resources.m_shaders["uniformColor"], new color( 1, 0, 0, 1 ), null );
    resources.m_materials["green"] = new Material( resources.m_shaders["uniformColor"], new color( 0, 1, 0, 1 ), null );
    resources.m_materials["blue"] = new Material( resources.m_shaders["uniformColor"], new color( 0, 0, 1, 1 ), null );
    resources.m_materials["testTexture"] = new Material( resources.m_shaders["texture"], new color( 0, 0, 0, 1 ), resources.m_textures["testTexture"] );
    resources.m_materials["vertexColor"] = new Material( resources.m_shaders["vertexColor"], new color( 0, 0, 1, 1 ), null );

    // Setup some entities.
    var entities = [];
    entities.push( new Entity( new vec3(0), new vec3(0), resources.m_meshes["circle"], resources.m_materials["testTexture"] ) );
    entities.push( new Entity( new vec3(0), new vec3(0), resources.m_meshes["triangle"], resources.m_materials["green"] ) );
    entities.push( new Entity( new vec3(0), new vec3(0), resources.m_meshes["cube"], resources.m_materials["vertexColor"] ) );

    var camera = new Camera( new vec3(0), 2 );

    gl.enable( gl.DEPTH_TEST );
    gl.enable( gl.CULL_FACE );
    gl.cullFace( gl.BACK );
    gl.frontFace( gl.CW );

    // Start the update/draw cycle.
    requestAnimationFrame( update );

    var lastTime = null;
    function update(currentTime)
    {
        if( lastTime == null )
            lastTime = currentTime;
        deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        entities[1].m_position.x = Math.cos( currentTime/1000 );
        entities[1].m_position.y = Math.sin( currentTime/1000 );
        entities[1].m_rotation.z = -currentTime / 1000 * (180 / Math.PI);
        entities[2].m_rotation.x += deltaTime * 50;
        entities[2].m_rotation.y += deltaTime * 100;

        dir = new vec3(0);
        if( this.m_KeyStates['a'] || this.m_KeyStates['ArrowLeft'] )
            dir.x += -1;
        if( this.m_KeyStates['d'] || this.m_KeyStates['ArrowRight'] )
            dir.x += 1;
        if( this.m_KeyStates['s'] || this.m_KeyStates['ArrowDown'] )
            dir.y += -1;
        if( this.m_KeyStates['w'] || this.m_KeyStates['ArrowUp'] )
            dir.y += 1;

        entities[2].m_position.x += dir.x * deltaTime;
        entities[2].m_position.y += dir.y * deltaTime;

        camera.update( canvas );

        draw();
    }

    function draw()
    {
        gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
        gl.clearColor( 0, 0, 0.4, 1 );
        gl.clear( gl.COLOR_BUFFER_BIT );

        entities.forEach( entity => entity.draw( camera ) );

        requestAnimationFrame( update );
    }

    function shutdown()
    {
        gl.disableVertexAttribArray( 0 );

        resources.free();
        resources = null;

        gl.canvas.width = 1;
        gl.canvas.height = 1;

        entities.forEach( entity => entity.free() );
        entities.length = 0;
        entities = null;

        camera.free();
        camera = null;

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

        var orthoScaleX = camera.m_matProj.m[0];
        var orthoOffsetX = camera.m_matProj.m[12];
        var orthoScaleY = camera.m_matProj.m[5];
        var orthoOffsetY = camera.m_matProj.m[13];

        entities[0].m_position.x = ((x / canvas.width) / orthoScaleX) * 2 - ((1 + orthoOffsetX) / orthoScaleX);
        entities[0].m_position.y = (((canvas.height - y) / canvas.height) / orthoScaleY) * 2 - ((1 + orthoOffsetY) / orthoScaleY);
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
        m_KeyStates[event.key] = 1;
    }

    function onKeyUp(event)
    {
        m_KeyStates[event.key] = 0;
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
