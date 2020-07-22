class Camera
{
    constructor(position, isOrtho, orthoWorldHeight, aspectRatio)
    {
        this.isOrtho = isOrtho;
        this.position = new vec3( position.x, position.y, position.z );
        this.rotation = new vec3( 0, 0, 0 );
        this.desiredHeight = orthoWorldHeight;
        this.aspectRatio = aspectRatio;

        this.matView = new mat4;
        this.matProj = new mat4;

        // Ortho 2D camera settings.
        this.zoom = 1;

        // Temp values for mouse/keyboard interaction.
        this.panning = false;
        this.oldMousePos = new vec2( -1, -1 );
    }

    free()
    {
        this.matView = null;
        this.matProj = null;
    }

    fromJSON(jsonString)
    {
        let state = null;
        try { state = JSON.parse( jsonString ); }
        catch( e ) { return; }

        if( state == null )
            return;

        this.isOrtho = state.isOrtho;
        this.zoom = state.zoom;
        this.desiredHeight = state.desiredHeight;
        this.position.setF32( state.position["x"], state.position["y"], state.position["z"] );
    }

    toJSON()
    {
        let state = {
            isOrtho: this.isOrtho,
            zoom: this.zoom,
            desiredHeight: this.desiredHeight,
            position: this.position,
        }

        return state;
    }

    update()
    {
        this.matView.createViewSRT( new vec3(1), this.rotation, this.position );

        if( this.isOrtho )
        {
            // If orthographic.
            let halfHeight = (this.desiredHeight * this.zoom) / 2;
            let halfWidth = halfHeight * this.aspectRatio;
            this.matProj.createOrtho( -halfWidth, halfWidth, -halfHeight, +halfHeight, -1000, 1000 );
        }
        else
        {
            // If perspective.
            this.matProj.createPerspectiveVFoV( 45.0, this.aspectRatio, 0.01, 100.0 );
        }
    }

    onMouseMove(x, y)
    {
        let changed = false;

        if( this.oldMousePos.x != -1 && this.panning )
        {
            this.position.x += (this.oldMousePos.x - x) * 0.01 * (this.zoom * this.desiredHeight / 10.0);
            this.position.y += (this.oldMousePos.y - y)*-1 * 0.01 * (this.zoom * this.desiredHeight / 10.0);
            changed = true;
        }
        
        this.oldMousePos.setF32( x, y );
        return changed;
    }

    onMouseDown(buttonID, x, y)
    {
        if( buttonID == 1 )
            this.panning = true;
    }

    onMouseUp(buttonID, x, y)
    {
        if( buttonID == 1 )
            this.panning = false;
    }

    onMouseWheel(direction)
    {
        if( this.isOrtho )
        {
            this.zoom += direction * 0.1;
            if( this.zoom < 0.1 )
                this.zoom = 0.1;
        }
        else
        {
            let change = direction * -0.3;
            let at = this.matView.getAt();
            this.position.add( at.times( change ) );
        }

        return true;
    }

    convertScreenToWorld(canvas, screenX, screenY)
    {
        if( this.isOrtho == false )
            return [0,0];

        let orthoScaleX = this.matProj.m[0];
        let orthoOffsetX = this.matProj.m[12];
        let orthoScaleY = this.matProj.m[5];
        let orthoOffsetY = this.matProj.m[13];

        // Transform from canvas coordinates to view space coordinates.
        let worldX = ((screenX / canvas.width) / orthoScaleX) * 2 - ((1 + orthoOffsetX) / orthoScaleX);
        let worldY = (((canvas.height - screenY) / canvas.height) / orthoScaleY) * 2 - ((1 + orthoOffsetY) / orthoScaleY);

        // Transform from view space coordinates to world space coordinates.
        // TODO: Fix for view rotation if we ever spin the camera.
        worldX += this.position.x;
        worldY += this.position.y;

        return [worldX, worldY];
    }

    convertWorldToScreen(canvas, worldX, worldY)
    {
        if( this.isOrtho == false )
            return [0,0];

        let orthoScaleX = this.matProj.m[0];
        let orthoOffsetX = this.matProj.m[12];
        let orthoScaleY = this.matProj.m[5];
        let orthoOffsetY = this.matProj.m[13];

        // Transform from world space coordinates to view space coordinates.
        // TODO: Fix for view rotation if we ever spin the camera.
        worldX -= this.position.x;
        worldY -= this.position.y;

        // Transform from view space coordinates to canvas coordinates.
        let x = (worldX + (1 + orthoOffsetX) / orthoScaleX) / 2 * orthoScaleX * canvas.width;
        let y = ((worldY + (1 + orthoOffsetY) / orthoScaleY) / 2 * orthoScaleY * canvas.height - canvas.height) * -1;

        return [x, y];
    }
}
