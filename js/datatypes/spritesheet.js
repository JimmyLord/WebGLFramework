class SpriteSheet
{
    constructor(jsonUrl, shader, texture)
    {
        this.shader = shader;
        this.texture = texture;
        this.jsonUrl = jsonUrl;
        this.defaultMaterial = new Material( shader, new color(1,1,1,1), texture );
        this.materials = {};
        this.loaded = false;

        this.load();
    }

    load()
    {
        // Create a series of materials from a JSON file.        
        return new Promise( (resolve, reject) =>
        {
            // Load the JSON file
            fetch( this.jsonUrl )
                .then( response => response.json() )
                .then( data =>
                {
                    let texWidth = data.size[0];
                    let texHeight = data.size[1];

                    // Parse the JSON data and create sprites
                    for( let spriteData of data.sprites )
                    {
                        let scaleX = spriteData.size[0] / texWidth;
                        let scaleY = spriteData.size[1] / texHeight;
                        let offsetX = spriteData.pos[0] / texWidth;
                        let offsetY = spriteData.pos[1] / texHeight;

                        // Create a new material for each sprite.
                        // or
                        // if this sprite was requested before the sheet was loaded,
                        //     update the material with the new UV transform.
                        if( !this.materials[spriteData.name] )
                        {
                            // Create a new material.
                            this.materials[spriteData.name] = new Material(
                                this.shader,
                                new color( 1, 1, 1, 1 ),
                                this.texture,
                                new vec4( scaleX, scaleY, offsetX, offsetY )
                            );
                        }
                        else
                        {
                            // Update the old material with the correct values.
                            this.materials[spriteData.name].uvTransform.setF32( scaleX, scaleY, offsetX, offsetY );
                        }
                    }

                    this.loaded = true;
                })
                .catch( error =>
                {
                    reject( `Failed to load JSON: ${this.jsonUrl}` );
                });
        });
    }

    getMaterial(spriteName)
    {
        // If the spriteName doesn't exist, create a new material for each requested sprite.
        // The correct UV transform will be set once the spritesheet is loaded, if ever.
        if( !this.materials[spriteName] )
        {
            this.materials[spriteName] = new Material( this.shader, new color(1,1,1,1), this.texture, new vec4(1,1,0,0) );
        }

        return this.materials[spriteName];
    }
}
