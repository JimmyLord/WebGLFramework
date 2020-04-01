class Camera
{
    constructor(position, isOrtho, orthoWorldHeight, aspectRatio)
    {
        this.isOrtho = isOrtho;
        this.position = position;
        this.desiredHeight = orthoWorldHeight;
        this.aspectRatio = aspectRatio;

        this.matView = new mat4;
        this.matProj = new mat4;
    }

    free()
    {
        this.matView = null;
        this.matProj = null;
    }

    update()
    {
        this.matView.createView2D( this.position );

        if( this.isOrtho )
        {
            // If orthographic.
            let halfHeight = this.desiredHeight / 2;
            let halfWidth = halfHeight * this.aspectRatio;
            this.matProj.createOrtho( -halfWidth, halfWidth, -halfHeight, halfHeight, -1000, 1000 );
        }
        else
        {
            // If perspective.
            this.matProj.createPerspectiveVFoV( 45.0, this.aspectRatio, 0.01, 100.0 );
        }
    }

    convertMouseToOrtho(canvas, x, y)
    {
        let orthoScaleX = this.matProj.m[0];
        let orthoOffsetX = this.matProj.m[12];
        let orthoScaleY = this.matProj.m[5];
        let orthoOffsetY = this.matProj.m[13];

        let orthoX = ((x / canvas.width) / orthoScaleX) * 2 - ((1 + orthoOffsetX) / orthoScaleX);
        let orthoY = (((canvas.height - y) / canvas.height) / orthoScaleY) * 2 - ((1 + orthoOffsetY) / orthoScaleY);

        return [orthoX, orthoY];
    }
}
