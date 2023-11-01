import { mat4 } from "../datatypes/matrix.js";
import { vec2, vec3 } from "../datatypes/vector.js";
import { FrameworkMain } from "./frameworkmain.js";

export class Camera
{
    framework: FrameworkMain;

    isOrtho: boolean;
    
    position: vec3;
    rotation: vec3;
    scale: vec3;
    
    desiredHeight: number;
    aspectRatio: number;

    matView: mat4;
    matProj: mat4;

    zoom: number;
    panning: boolean;
    oldMousePos: vec2;

    constructor(position: vec3, isOrtho: boolean, orthoWorldHeight: number, framework: FrameworkMain)
    {
        this.framework = framework;

        this.isOrtho = isOrtho;

        this.position = new vec3( position.x, position.y, position.z );
        this.rotation = new vec3( 0 );
        this.scale = new vec3( 1 );

        this.desiredHeight = orthoWorldHeight;
        this.aspectRatio = 1;
        if( this.framework.canvas )
        {
            this.aspectRatio = this.framework.canvas.width / this.framework.canvas.height;            
        }

        this.matView = new mat4();
        this.matProj = new mat4();

        // Ortho 2D camera settings.
        this.zoom = 1;

        // Temp values for mouse/keyboard interaction.
        this.panning = false;
        this.oldMousePos = new vec2( -1, -1 );

        this.recalculateProjection();
    }

    free()
    {
    }

    fromJSON(jsonString: string)
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
        this.recalculateProjection();
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

    update(deltaTime: number)
    {
        this.matView.createViewSRT( this.scale, this.rotation, this.position );
    }

    recalculateProjection()
    {
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

    onResize()
    {
        if( this.framework.canvas )
        {
            this.aspectRatio = this.framework.canvas.width / this.framework.canvas.height;
        }

        this.recalculateProjection();
    }

    onMouseMove(x: number, y: number): boolean
    {
        let changed = false;

        if( this.oldMousePos.x !== -1 && this.panning )
        {
            this.position.x += (this.oldMousePos.x - x) * 0.01 * (this.zoom * this.desiredHeight / 10.0);
            this.position.y += (this.oldMousePos.y - y)*-1 * 0.01 * (this.zoom * this.desiredHeight / 10.0);
            changed = true;
        }
        
        this.oldMousePos.setF32( x, y );
        return changed;
    }

    onMouseDown(buttonID: number, x: number, y: number): boolean
    {
        if( buttonID === 1 )
            this.panning = true;

        return false;
    }

    onMouseUp(buttonID: number, x: number, y: number): boolean
    {
        if( buttonID === 1 )
            this.panning = false;

        return false;
    }

    onMouseWheel(direction: number): boolean
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

        this.recalculateProjection();

        return true;
    }

    convertScreenToWorld(canvas: HTMLCanvasElement, screenX: number, screenY: number): vec2
    {
        if( this.isOrtho === false )
            return vec2.getTemp( 0, 0 );

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

        return vec2.getTemp( worldX, worldY );
    }

    convertWorldToScreen(canvas: HTMLCanvasElement, worldX: number, worldY: number): vec2
    {
        if( this.isOrtho === false )
            return vec2.getTemp( 0, 0 );

        let orthoScaleX = this.matProj.m[0];
        let orthoScaleY = this.matProj.m[5];
        let orthoOffsetX = this.matProj.m[12];
        let orthoOffsetY = this.matProj.m[13];

        // Transform from world space coordinates to view space coordinates.
        // TODO: Fix for view rotation if we ever spin the camera.
        worldX -= this.position.x;
        worldY -= this.position.y;

        // Transform from view space coordinates to canvas coordinates.
        let x = (worldX + (1 + orthoOffsetX) / orthoScaleX) / 2 * orthoScaleX * canvas.width;
        let y = ((worldY + (1 + orthoOffsetY) / orthoScaleY) / 2 * orthoScaleY * canvas.height - canvas.height) * -1;

        return vec2.getTemp( x, y );
    }
}
