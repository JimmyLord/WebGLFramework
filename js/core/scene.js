class Scene
{
    constructor(framework)
    {
        this.framework = framework;
        this.entities = [];
        this.lights = [];
        this.camera = null;
        this.orthoHeight = 0;
    }

    init(loadDefaultResources)
    {
        // Create a default camera if one isn't made before the call to init.
        if( this.camera === null )
        {
            this.orthoHeight = 2;
            this.camera = new Camera( new vec3(0, 0, -3), true, this.orthoHeight, this.framework );
        }

        if( loadDefaultResources )
        {
            let resources = this.framework.resources;
            let gl = this.framework.gl;

            resources.meshes["triangle"] = new Mesh( gl );
            resources.meshes["triangle"].createTriangle( new vec3( 0.5, 0.5 ) );
            resources.meshes["circle"] = new Mesh( gl );
            resources.meshes["circle"].createCircle( 200, 0.2 );
            resources.meshes["cube"] = new Mesh( gl );
            resources.meshes["cube"].createCube( new vec3( 1, 1, 1 ) );
            resources.meshes["rectangle"] = new Mesh( gl );
            resources.meshes["rectangle"].createBox( new vec2( 1, 1 ) );

            //resources.textures["testTexture"] = new Texture( gl );
            //resources.textures["testTexture"].loadFromFile( "data/textures/test.png" );

            resources.materials["red"] = new Material( resources.shaders["uniformColor"], new color( 1, 0, 0, 1 ), null );
            resources.materials["green"] = new Material( resources.shaders["uniformColor"], new color( 0, 1, 0, 1 ), null );
            resources.materials["blue"] = new Material( resources.shaders["uniformColor"], new color( 0, 0, 1, 1 ), null );
            resources.materials["white"] = new Material( resources.shaders["uniformColor"], new color( 1, 1, 1, 1 ), null );
            //resources.materials["testTexture"] = new Material( resources.shaders["texture"], new color( 0, 0, 0, 1 ), resources.textures["testTexture"] );
            resources.materials["vertexColor"] = new Material( resources.shaders["vertexColor"], new color( 1, 1, 1, 1 ), null );

            resources.materials["redLit"] = new Material( resources.shaders["uniformColorLit"], new color( 1, 0, 0, 1 ), null );
            resources.materials["greenLit"] = new Material( resources.shaders["uniformColorLit"], new color( 0, 1, 0, 1 ), null );
            resources.materials["blueLit"] = new Material( resources.shaders["uniformColorLit"], new color( 0, 0, 1, 1 ), null );
            resources.materials["whiteLit"] = new Material( resources.shaders["uniformColorLit"], new color( 1, 1, 1, 1 ), null );
            resources.materials["vertexColorLit"] = new Material( resources.shaders["vertexColorLit"], new color( 1, 1, 1, 1 ), null );
        }
    }

    shutdown()
    {
        this.entities.forEach( entity => entity.free() );
        this.entities.length = 0;
        this.entities = null;

        this.camera.free();
        this.camera = null;
    }

    update(deltaTime, currentTime)
    {
        this.camera.desiredHeight = this.orthoHeight;

        this.camera.update();
    }

    draw(camera)
    {
        this.entities.forEach( entity => entity.draw( camera, this.lights ) );
    }

    add(entity)
    {
        this.entities.push( entity );
    }

    onResize()
    {
        this.camera.onResize();
    }
}
