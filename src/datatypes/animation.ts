class SingleAnimationData
{
    spriteSheet: SpriteSheet;
    frames: Material[] = [];
    frameTime: number = 0;
    loop: boolean = false;

    constructor(spriteSheet: SpriteSheet, frames: Material[], frameTime: number, loop: boolean)
    {
        this.spriteSheet = spriteSheet;
        this.frames = frames;
        this.frameTime = frameTime;
        this.loop = loop;
    }

    free()
    {
        this.frames = [];
    }
}

class AnimationSetData
{
    animations: { [key: string]: SingleAnimationData} = {};

    constructor() {}

    addAnimation(name: string, spriteSheet: SpriteSheet, frames: Material[], frameTime: number, loop: boolean): void
    {
        let animation = new SingleAnimationData( spriteSheet, frames, frameTime, loop );
        this.animations[name] = animation;
    }
    
    free(): void
    {
        for( let key in this.animations )
        {
            this.animations[key].free();
        }
        this.animations = {};
    }
}

class AnimationPlayer
{
    animationSet: AnimationSetData;

    currentAnimation: SingleAnimationData;
    currentFrame: number = 0;
    frameTimeLeft: number = 0;
    finished: boolean = false;

    constructor(animationSet: AnimationSetData, animationName: string)
    {
        this.animationSet = animationSet;
        this.currentAnimation = this.animationSet.animations[animationName];
        this.setAnimation( animationName );
    }

    resetCurrentAnimation(): void
    {
        this.currentFrame = 0;
        this.frameTimeLeft = this.currentAnimation.frameTime;
        this.finished = false;
    }

    update(deltaTime: number): void
    {
        if( this.finished ) return;

        this.frameTimeLeft -= deltaTime;
        if( this.frameTimeLeft <= 0 )
        {
            this.frameTimeLeft = this.currentAnimation.frameTime;
            this.currentFrame++;
            if( this.currentFrame >= this.currentAnimation.frames.length )
            {
                if( this.currentAnimation.loop )
                {
                    this.currentFrame = 0;
                }
                else
                {
                    this.currentFrame = this.currentAnimation.frames.length - 1;
                    this.finished = true;
                }
            }
        }
    }

    getCurrentFrame(): Material
    {
        return this.currentAnimation.frames[this.currentFrame];
    }

    setAnimation(animationName: string): void
    {
        let newAnim = this.animationSet.animations[animationName];
        if( this.currentAnimation == newAnim ) return;

        this.currentAnimation = newAnim;

        if( this.currentAnimation == null )
        {
            alert( "Invalid Animation: " + animationName );
            debugger;
        }

        this.resetCurrentAnimation();
    }
}
