function log(str)
{
    let newElem = document.createElement( 'p' ); 
    newElem.appendChild( document.createTextNode( str ) );
    document.body.appendChild( newElem );
}

class MainProject
{
    constructor(framework)
    {
        this.framework = framework;
        this.scene = null;
        this.objectFollowsMouse = true;
        this.cubeRotates = true;
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

        this.scene.camera.isOrtho = false;
    }

    update(deltaTime, currentTime)
    {
        this.scene.update(deltaTime, currentTime);

        this.scene.entities[1].position.x = Math.cos( currentTime/1000 );
        this.scene.entities[1].position.y = Math.sin( currentTime/1000 );
        this.scene.entities[1].rotation.z = -currentTime / 1000 * (180 / Math.PI);
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

        this.scene.entities[2].position.x += dir.x * deltaTime;
        this.scene.entities[2].position.y += dir.y * deltaTime;
        this.scene.entities[2].position.z += dir.z * deltaTime;

        this.framework.drawImGuiTestWindow();

        let imgui = this.framework.imgui;
        imgui.window( "ImGui Test" );
        if( imgui.checkbox( "Follow mouse", this.objectFollowsMouse ) )
        {
            this.objectFollowsMouse = !this.objectFollowsMouse;
        }
        if( imgui.checkbox( "Rotate cube", this.cubeRotates ) )
        {
            this.cubeRotates = !this.cubeRotates;
        }        
        this.scene.lights[0].position.x = imgui.dragNumber( "LightX:", this.scene.lights[0].position.x, 0.01, 2 );
        this.scene.lights[0].position.y = imgui.dragNumber( "LightY:", this.scene.lights[0].position.y, 0.01, 2 );
        this.scene.lights[0].position.z = imgui.dragNumber( "LightZ:", this.scene.lights[0].position.z, 0.01, 2 );

        imgui.window( "Camera" );
        if( imgui.checkbox( "isOrtho", this.scene.camera.isOrtho ) )
        {
            this.scene.camera.isOrtho = !this.scene.camera.isOrtho;
        }
        this.scene.orthoHeight = imgui.dragNumber( "OrthoHeight:", this.scene.orthoHeight, 0.01, 2 );
        this.scene.camera.position.z = imgui.dragNumber( "Z:", this.scene.camera.position.z, 0.01, 2 );
        //imgui.endWindow( true );
    }

    draw()
    {
        this.scene.draw( this.scene.camera );
    }

    onMouseMove(buttonID, x, y, orthoX, orthoY)
    {
        if( this.objectFollowsMouse )
        {
            let [orthoX, orthoY] = this.scene.camera.convertMouseToOrtho( this.framework.canvas, x, y );

            this.scene.entities[0].position.x = orthoX;
            this.scene.entities[0].position.y = orthoY;
        }

        this.scene.camera.onMouseMove( buttonID, x, y, orthoX, orthoY );
    }

    onMouseDown(buttonID, x, y, orthoX, orthoY)
    {
        this.scene.camera.onMouseDown( buttonID, x, y, orthoX, orthoY );
    }

    onMouseUp(buttonID, x, y, orthoX, orthoY)
    {
        this.scene.camera.onMouseUp( buttonID, x, y, orthoX, orthoY );
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
