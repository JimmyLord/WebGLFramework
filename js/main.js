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
        void main()
        {           
            gl_Position = a_Position;
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

    gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
    gl.clearColor( 0, 0, 0.4, 1 );
    gl.clear( gl.COLOR_BUFFER_BIT );

    //log( "Screen cleared" );

    mesh.draw( shader );

    //log( "Triangle drawn" );

    mesh.free()
    shader.free();

    log( "Done!" );
}

main()
