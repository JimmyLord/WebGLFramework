class Texture
{
    constructor(gl, filename)
    {
        // This is deprecated, but no clue what an alternative would be... other than flipping all UVs.
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

        this.m_gl = gl;
        this.m_textureID = gl.createTexture();

        // Create a temp 1 pixel texture, until loading of actual texture is complete.
        var pixels = new Uint8Array( [255, 255, 255, 255] );
        gl.bindTexture( gl.TEXTURE_2D, this.m_textureID );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

        // Start load of texture requested.
        this.m_image = new Image();
        this.m_image.src = filename;
        this.m_image.addEventListener( 'load', this );
    }

    free()
    {
        var gl = this.m_gl;

        gl.deleteTexture( this.m_textureID );
        this.m_textureID = null;
        this.m_image = null;
        this.m_gl = null;
    }

    handleEvent(event)
    {
        var gl = this.m_gl;

        if( event.type == "load" )
        {
            gl.bindTexture( gl.TEXTURE_2D, this.m_textureID );
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.m_image );
            
            this.m_image.removeEventListener( 'load', this );
            this.m_image = null;
        }
    }
}
