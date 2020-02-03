function log(str)
{
    var newElem = document.createElement( 'p' ); 
    newElem.appendChild( document.createTextNode( str ) );
    document.body.appendChild(newElem);
}

function main()
{
    var canvas = document.getElementById( document.currentScript.getAttribute('canvasName') );
    canvas.width = 400;
    canvas.height = 300;

    var gl = canvas.getContext( "webgl" );
    if( gl == 0 )
    {
        log( "Failed to get WebGL context from canvas." );
        return;
    }

    //log( "WebGL set up" );

    var vertShaderSource = `
        attribute vec4 a_Position;
        uniform mat4 u_WorldMatrix;
        void main()
        {
            gl_Position = u_WorldMatrix * a_Position;
        }
    `;
   
    var fragShaderSource = `
        precision mediump float;
        void main()
        {
            gl_FragColor = vec4( 0, 1, 0, 1 );
        }
    `;

    var shader = new Shader( gl, vertShaderSource, fragShaderSource );
    var mesh = new Mesh( gl );
    var material = new Material( shader );

    var entities = [];
    entities.push( new Entity( new vec3(-1), mesh, material ) );
    entities.push( new Entity( new vec3(0), mesh, material ) );

    var lastTime = null;

    requestAnimationFrame( update );

    function update(currentTime)
    {
        if( lastTime == null )
            lastTime = currentTime;
        deltaTime = (currentTime - lastTime) / 1000.0;
        lastTime = currentTime;

        entities[0].m_position.x += deltaTime;
        entities[1].m_position.x = Math.cos( currentTime/1000.0 );
        entities[1].m_position.y = Math.sin( currentTime/1000.0 );

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

        mesh.free()
        shader.free();

        gl.canvas.width = 1;
        gl.canvas.height = 1;

        log( "Shutdown!" );
    }

    window.onbeforeunload = function()
    {
        shutdown();
        // return false; // If false is returned, the browser will pop-up a confirmation on unload.
    };
}

main()
