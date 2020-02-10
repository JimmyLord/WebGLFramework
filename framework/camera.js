class Camera
{
    constructor(position, isOrtho, orthoWorldHeight, aspectRatio)
    {
        this.m_isOrtho = isOrtho;
        this.m_position = position;
        this.m_desiredHeight = orthoWorldHeight;
        this.m_aspectRatio = aspectRatio;

        this.m_matView = new mat4;
        this.m_matProj = new mat4;
    }

    free()
    {
        this.m_matView = null;
        this.m_matProj = null;
    }

    update()
    {
        this.m_matView.createView2D( this.m_position );

        if( this.m_isOrtho )
        {
            // If orthographic.
            var halfHeight = this.m_desiredHeight / 2;
            var halfWidth = halfHeight * this.m_aspectRatio;
            this.m_matProj.createOrthoInfiniteZ( -halfWidth, halfWidth, -halfHeight, halfHeight );
        }
        else
        {
            // If perspective.
            this.m_matProj.createPerspectiveVFoV( 45.0, this.m_aspectRatio, 0.01, 100.0 );
        }
    }
}
