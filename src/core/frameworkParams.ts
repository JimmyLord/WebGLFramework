// Params:
//    canvasName="MainCanvas"
//    width=600                       // Defaults to canvas size.
//    height=400                      // Defaults to canvas size.
//    focus="true"                    // Defaults to true. // Keyboard focus, useful for multi-canvas.
//    fullFrame="true"/"false" or 1/0 // Defaults to false.

export class FrameworkParams
{
    canvasName: string | null = null;
    focus: boolean = true;
    fullFrame: boolean = false;
    width = 1280;
    height = 720;

    constructor(metaTagScriptID: string)
    {
        var metaTags = document.getElementsByTagName( "meta" );
        for( var i = 0; i < metaTags.length; ++i )
        {
            var scriptID = metaTags[i].getAttribute("scriptID");
            if( scriptID === metaTagScriptID )
            {
                this.canvasName = metaTags[i].getAttribute("canvasName");
                let focusStr = metaTags[i].getAttribute("focus");
                let fullFrameStr = metaTags[i].getAttribute("fullFrame");
                if( focusStr == "false" || focusStr == "0" ) this.focus = false;
                if( fullFrameStr == "true" || fullFrameStr == "1" ) this.fullFrame = true;
                this.width = Number( metaTags[i].getAttribute("width") );
                this.height = Number( metaTags[i].getAttribute("height") );
                break;
            }
        }
    }
}
