class Camera
{
    constructor(position, height)
    {
        this.m_position = position;
        this.m_desiredHeight = height;
        this.m_matView = new mat4;
        this.m_matProj = new mat4;
    }

    free()
    {
        this.m_matView = null;
        this.m_matProj = null;
    }

    update(canvas)
    {
        this.m_matView.createView2D( this.m_position );

        var aspectRatio = canvas.width / canvas.height;
        var halfHeight = this.m_desiredHeight / 2;
        var halfWidth = halfHeight * aspectRatio;

        this.m_matProj.createOrthoInfiniteZ( -halfWidth, halfWidth, -halfHeight, halfHeight );
    }
}
