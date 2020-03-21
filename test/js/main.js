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
    }

    init()
    {
        let resources = this.framework.resources;

        this.scene = new Scene( this.framework );

        this.scene.init( true );
        
        // Set up some entities.
        this.scene.add( new Entity( new vec3(0), new vec3(0), resources.meshes["circle"], resources.materials["redLit"] ) );
        this.scene.add( new Entity( new vec3(0), new vec3(0), resources.meshes["triangle"], resources.materials["greenLit"] ) );
        this.scene.add( new Entity( new vec3(0), new vec3(0), resources.meshes["cube"], resources.materials["vertexColorLit"] ) );

        this.lights = [];
        this.lights.push( new Light( new vec3(0,3,-3), new color(1,1,1,1) ) );
    }

    update(deltaTime, currentTime)
    {
        this.scene.update(deltaTime, currentTime);

        this.scene.entities[1].position.x = Math.cos( currentTime/1000 );
        this.scene.entities[1].position.y = Math.sin( currentTime/1000 );
        this.scene.entities[1].rotation.z = -currentTime / 1000 * (180 / Math.PI);
        this.scene.entities[2].rotation.x += deltaTime * 50;
        this.scene.entities[2].rotation.y += deltaTime * 100;

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

        this.scene.entities[2].position.x += dir.x * deltaTime;
        this.scene.entities[2].position.y += dir.y * deltaTime;

        this.framework.drawImGuiTestWindow();

        this.framework.imgui.window( "ImGui Test" );
        if( this.framework.imgui.checkbox( "Follow mouse", this.objectFollowsMouse ) )
        {
            this.objectFollowsMouse = !this.objectFollowsMouse;
        }
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
