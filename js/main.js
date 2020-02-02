function log(str)
{
    var newElem = document.createElement( 'p' ); 
    newElem.appendChild( document.createTextNode( str ) );
    document.body.appendChild(newElem);
}

function main()
{
    var canvas = document.getElementById( "MainCanvas" );
    canvas.width = 400;
    canvas.height = 300;

    var gl = canvas.getContext( "webgl" );
    if( gl == 0 )
    {
        log( "Something went wrong with WebGL" );
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

    var lastTime = null;
    var position = -1.0;

    requestAnimationFrame( draw );

    function update(currentTime)
    {
        if( lastTime == null )
            lastTime = currentTime;
        deltaTime = (currentTime - lastTime) / 1000.0;
        lastTime = currentTime;

        position += deltaTime;

        draw();
    }

    function draw()
    {
        gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
        gl.clearColor( 0, 0, 0.4, 1 );
        gl.clear( gl.COLOR_BUFFER_BIT );

        var world = new mat4;
        world.setIdentity();
        world.translate( Math.sin( position ), Math.cos(position), 0 );

        mesh.draw( shader, world );

        requestAnimationFrame( update );
    }

    function shutdown()
    {
        mesh.free()
        shader.free();

        log( "Done!" );
    }
}

main()
