class MainProject
{
    constructor(framework)
    {
        this.framework = framework;
        this.scene = null;
        this.objectFollowsMouse = true;
        this.cubeRotates = true;

        // Save state.
        this.stateIsDirty = false;

        // Framework settings.
        this.framework.showFPSCounter = true;
        this.framework.autoRefresh = true;
        this.framework.maxDeltaTime = 1.0/10.0;
    }

    init()
    {
        let resources = this.framework.resources;

        this.scene = new Scene( this.framework );

        this.scene.init( true );
        
        // Set up some entities.
        this.scene.add( new Entity( new vec3(0), new vec3(0), new vec3(1), resources.meshes["circle"], resources.materials["redLit"] ) );
        this.scene.add( new Entity( new vec3(0), new vec3(0), new vec3(1), resources.meshes["triangle"], resources.materials["greenLit"] ) );
        this.scene.add( new Entity( new vec3(0), new vec3(0), new vec3(1), resources.meshes["cube"], resources.materials["vertexColorLit"] ) );
        this.scene.add( new Entity( new vec3(0,0,10), new vec3(0,0,0), new vec3(10,10,10), resources.meshes["rectangle"], resources.materials["whiteLit"] ) );
        this.scene.add( new Entity( new vec3(5,0,5), new vec3(0,-90,0), new vec3(10,10,10), resources.meshes["rectangle"], resources.materials["whiteLit"] ) );
        this.scene.add( new Entity( new vec3(-5,0,5), new vec3(0,90,0), new vec3(10,10,10), resources.meshes["rectangle"], resources.materials["whiteLit"] ) );
        this.scene.add( new Entity( new vec3(0,-5,5), new vec3(-90,0,0), new vec3(10,10,10), resources.meshes["rectangle"], resources.materials["whiteLit"] ) );
        this.scene.add( new Entity( new vec3(0,5,5), new vec3(90,0,0), new vec3(10,10,10), resources.meshes["rectangle"], resources.materials["whiteLit"] ) );

        this.scene.lights.push( new Light( new vec3( 0,0,-2), new color(1,1,1,1), 5 ) );
        this.scene.lights.push( new Light( new vec3( 4,0, 9), new color(0,1,0,1), 2 ) );
        this.scene.lights.push( new Light( new vec3(-4,0, 9), new color(0,0,1,1), 6 ) );

        // Testing particle rendering.
        this.maxParticles = 10000;
        this.particles = [];
        resources.meshes["particles"] = new MeshDynamic( this.framework.gl );
        resources.meshes["particles"].startShape( this.framework.gl.TRIANGLES, this.maxParticles*6 ); // Max 1000 sprites
        this.particleObject = new Entity( new vec3(0), new vec3(0), new vec3(1), resources.meshes["particles"], resources.materials["red"] );
        for( let i=0; i<this.maxParticles; i++ )
        {
            this.particles.push( {} );
            this.particles[i].pos = new vec3( 0, 0, 0 );
            this.particles[i].vel = new vec3( Math.random() * 2 - 1, Math.random() * 2 - 1, 0 );
        }

        this.scene.camera.isOrtho = false;
        this.scene.camera.recalculateProjection();

        this.loadState();
    }

    loadState()
    {
        if( this.framework.storage != null )
        {
            this.scene.camera.fromJSON( this.framework.storage["cameraState"] );
        }
    }

    saveState()
    {
        if( this.stateIsDirty )
        {
            console.log( "Saving State." );
            if( this.scene.camera )
            {
                if( this.framework.storage != null )
                {
                    this.framework.storage["cameraState"] = JSON.stringify( this.scene.camera );
                }
            }
            this.stateIsDirty = false;
        }
    }

    update(deltaTime, runningTime)
    {
        if( this.framework == null )
            return;

        this.scene.update( deltaTime, runningTime );

        this.scene.entities[1].position.x = Math.cos( runningTime );
        this.scene.entities[1].position.y = Math.sin( runningTime );
        this.scene.entities[1].rotation.z = -runningTime * (180 / Math.PI);
        if( this.cubeRotates )
        {
            this.scene.entities[2].rotation.x += deltaTime * 50;
            this.scene.entities[2].rotation.y += deltaTime * 100;
        }

        let keyStates = this.framework.keyStates;

        let dir = new vec3(0);
        if( keyStates['a'] || keyStates['ArrowLeft'] )
            dir.x += -1;
        if( keyStates['d'] || keyStates['ArrowRight'] )
            dir.x += 1;
        if( keyStates['s'] || keyStates['ArrowDown'] )
            dir.y += -1;
        if( keyStates['w'] || keyStates['ArrowUp'] )
            dir.y += 1;
        if( keyStates['q'] || keyStates['ArrowUp'] )
            dir.z += 1;
        if( keyStates['z'] || keyStates['ArrowUp'] )
            dir.z += 1;

        if( dir.length() != 0 )
        {
            this.framework.refresh();
        }

        this.scene.entities[2].position.x += dir.x * deltaTime;
        this.scene.entities[2].position.y += dir.y * deltaTime;
        this.scene.entities[2].position.z += dir.z * deltaTime;

        this.framework.drawImGuiTestWindow();

        let imgui = this.framework.imgui;
        imgui.window( "ImGui Test" );
        if( imgui.checkbox( "Auto refresh", this.framework.autoRefresh ) )
        {
            this.framework.autoRefresh = !this.framework.autoRefresh;
            if( this.framework.autoRefresh == true )
                this.framework.maxDeltaTime = 1.0/10.0;
            else
                this.framework.maxDeltaTime = 1.0/60.0;
        }
        if( imgui.checkbox( "Follow mouse", this.objectFollowsMouse ) )
        {
            this.objectFollowsMouse = !this.objectFollowsMouse;
        }
        if( imgui.checkbox( "Rotate cube", this.cubeRotates ) )
        {
            this.cubeRotates = !this.cubeRotates;
        }        
        [this.scene.lights[0].position.x] = imgui.dragNumber( "LightX:", this.scene.lights[0].position.x, 0.01, 2 );
        [this.scene.lights[0].position.y] = imgui.dragNumber( "LightY:", this.scene.lights[0].position.y, 0.01, 2 );
        [this.scene.lights[0].position.z] = imgui.dragNumber( "LightZ:", this.scene.lights[0].position.z, 0.01, 2 );

        imgui.window( "Camera" );
        if( imgui.checkbox( "isOrtho", this.scene.camera.isOrtho ) )
        {
            this.scene.camera.isOrtho = !this.scene.camera.isOrtho;
            this.scene.camera.recalculateProjection();
            this.stateIsDirty = true;
        }
        [this.scene.orthoHeight] = imgui.dragNumber( "OrthoHeight:", this.scene.orthoHeight, 0.01, 2 );
        [this.scene.camera.position.z] = imgui.dragNumber( "Z:", this.scene.camera.position.z, 0.01, 2 );
        this.stateIsDirty = true;
        //imgui.endWindow( true );

        // Testing particle rendering.
        this.framework.resources.meshes["particles"].removeAllVerts();
        for( let i=0; i<this.maxParticles; i++ )
        {
            this.particles[i].pos.x += this.particles[i].vel.x * deltaTime;
            this.particles[i].pos.y += this.particles[i].vel.y * deltaTime;
            this.framework.resources.meshes["particles"].addSpriteF( this.particles[i].pos.x, this.particles[i].pos.y,
                                                                     0.01, 0.01, 0, 0, 1, 1 );
        }
        this.framework.resources.meshes["particles"].endShape();
    }

    draw()
    {
        this.scene.draw( this.scene.camera );

        // Draw the particles.
        this.particleObject.draw( this.scene.camera, null );
    }

    onResize()
    {
        this.scene.onResize();
    }

    onBeforeUnload()
    {
        this.saveState();
    }

    onMouseMove(x, y)
    {
        if( this.objectFollowsMouse )
        {
            let worldPos = this.scene.camera.convertScreenToWorld( this.framework.canvas, x, y );

            this.scene.entities[0].position.x = worldPos.x;
            this.scene.entities[0].position.y = worldPos.y;
        }

        this.stateIsDirty = this.scene.camera.onMouseMove( x, y );
        this.framework.refresh();
    }

    onMouseDown(buttonID, x, y)
    {
        this.stateIsDirty = this.scene.camera.onMouseDown( buttonID, x, y );
        this.framework.refresh();
    }

    onMouseUp(buttonID, x, y)
    {
        this.stateIsDirty = this.scene.camera.onMouseUp( buttonID, x, y );
        this.framework.refresh();
    }

    onMouseWheel(direction)
    {
        this.stateIsDirty = this.scene.camera.onMouseWheel( direction );
        this.framework.refresh();
    }

    onKeyDown(key, keyCode, modifierKeys)
    {
        this.framework.refresh();
    }

    onKeyUp(key, keyCode, modifierKeys)
    {
        this.framework.refresh();
    }

    shutdown()
    {
        this.scene.shutdown();
    }
}

function main()
{
    let framework = new FrameworkMain();
    let runnable = new MainProject( framework );
    
    //framework.init();
    runnable.init();
    framework.run( runnable );
}

main()
