function log(str)
{
    var newElem = document.createElement( 'p' ); 
    newElem.appendChild( document.createTextNode( str ) );
    document.body.appendChild( newElem );
}

class MainProject
{
    constructor(framework)
    {
        this.framework = framework;
    }

    init()
    {
        var resources = this.framework.resources;

        // Set up some entities.
        this.entities = [];

        this.entities.push( new Entity( new vec3(0), new vec3(0), resources.meshes["circle"], resources.materials["red"] ) );
        this.entities.push( new Entity( new vec3(0), new vec3(0), resources.meshes["triangle"], resources.materials["green"] ) );
        this.entities.push( new Entity( new vec3(0), new vec3(0), resources.meshes["cube"], resources.materials["vertexColor"] ) );
    }

    update(deltaTime, currentTime)
    {
        this.entities[1].position.x = Math.cos( currentTime/1000 );
        this.entities[1].position.y = Math.sin( currentTime/1000 );
        this.entities[1].rotation.z = -currentTime / 1000 * (180 / Math.PI);
        this.entities[2].rotation.x += deltaTime * 50;
        this.entities[2].rotation.y += deltaTime * 100;

        var keyStates = this.framework.keyStates;

        var dir = new vec3(0);
        if( keyStates['a'] || keyStates['ArrowLeft'] )
            dir.x += -1;
        if( keyStates['d'] || keyStates['ArrowRight'] )
            dir.x += 1;
        if( keyStates['s'] || keyStates['ArrowDown'] )
            dir.y += -1;
        if( keyStates['w'] || keyStates['ArrowUp'] )
            dir.y += 1;

        this.entities[2].position.x += dir.x * deltaTime;
        this.entities[2].position.y += dir.y * deltaTime;
    }

    draw(camera)
    {
        this.entities.forEach( entity => entity.draw( camera ) );
    }

    onMouseMove(x, y, orthoX, orthoY)
    {
        this.entities[0].position.x = orthoX;
        this.entities[0].position.y = orthoY;
    }

    shutdown()
    {
        this.entities.forEach( entity => entity.free() );
        this.entities.length = 0;
        this.entities = null;
    }
}

function main()
{
    var framework = new FrameworkMain();
    var runnable = new MainProject( framework );
    
    //framework.init();
    runnable.init();
    framework.run( runnable );
}

main()
