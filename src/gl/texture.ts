export class Texture
{
    gl: WebGL2RenderingContext;
    textureID: WebGLTexture | null;
    image: HTMLImageElement | null;

    constructor(gl: WebGL2RenderingContext)
    {
        this.gl = gl;
        this.textureID = null;
        this.image = null;
    }

    loadFromFile(filename: string)
    {
        let gl = this.gl;

        // This is deprecated, but no clue what an alternative would be... other than flipping all UVs.
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

        this.textureID = gl.createTexture();

        // Create a temp 1 pixel texture, until loading of actual texture is complete.
        let pixels = new Uint8Array( [255, 255, 255, 255] );
        gl.bindTexture( gl.TEXTURE_2D, this.textureID );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

        // Start load of texture requested.
        let tex = this;
        this.image = new Image();
        this.image.src = filename;
        this.image.onload = function()
        {
            if( tex.image == null ) return;
            gl.bindTexture( gl.TEXTURE_2D, tex.textureID );
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image );
            tex.image = null;
        }
    }

    createFromUInt8Array(pixels: any, width: number, height: number)
    {
        let gl = this.gl;

        this.textureID = gl.createTexture();
        gl.bindTexture( gl.TEXTURE_2D, this.textureID );

        gl.texImage2D( gl.TEXTURE_2D, 0, gl.R8, width, height, 0, gl.RED, gl.UNSIGNED_BYTE, pixels );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    }

    free()
    {
        let gl = this.gl;

        gl.deleteTexture( this.textureID );
        this.textureID = null;
        this.image = null;
    }
}
