class LevelObject
{
    //object types
    static PLAYER = 0;
    static GOAL = 1;
    static SPAWN = 2;
    static LADDER = 3;
    static PORTAL = 4;
    static SOLID_PLATFORM = 5;
    static SEMI_PLATFORM = 6;
    static SPIKES = 7;

    static addChars(obj)
    {
        transferCharData(
            obj.area.pos.x,
            obj.area.pos.y,
            obj.area.dim.w,
            obj.area.dim.h,
            obj.chars,
            displayArea.pos.x,
            displayArea.pos.y,
            displayArea.dim.w,
            displayArea.dim.h,
            charArray,
            obj.color
        );
    }//this transfers char data to the char array

    static makeChars(type, dim)
    {
        const returnChars = new Int8Array(dim.w * dim.h);

        switch(type)
        {
            case LevelObject.SOLID_PLATFORM:
                for(let i = 0; i < dim.w; i++)
                {
                    for(let j = 0; j < dim.h; j++)
                    {
                        returnChars[i + j * dim.w] = 0X23;
                    }
                }
                break;
            case LevelObject.SEMI_PLATFORM:
                for(let i = 0; i < dim.w; i++)
                {
                    for(let j = 0; j < dim.h; j++)
                    {
                        returnChars[i + j * dim.w] = 0X58;
                    }
                }
                break;
            case LevelObject.SPIKES:
                for(let i = 0; i < dim.w; i++)
                {
                    for(let j = 0; j < dim.h; j++)
                    {
                        returnChars[i + j * dim.w] = 0X5E;
                    }
                }
                break;
            case LevelObject.GOAL:
                for(let i = 0; i < dim.w; i++)
                {
                    for(let j = 0; j < dim.h; j++)
                    {
                        returnChars[i + j * dim.w] = 0X2E;
                    }
                }
                break;
            case LevelObject.LADDER:
                for(let i = 0; i < dim.w; i++)
                {
                    for(let j = 0; j < dim.h; j++)
                    {
                        returnChars[i + j * dim.w] = 0X5B + ((j & 1) << 1);
                    }
                }
                break;
            case LevelObject.PLAYER:
                dim.w = 4;//this makes PLAYER type objects be of uniform size
                dim.h = 4;//
                return new Int8Array(
                    [
                        0X2B, 0X2D, 0X2D, 0X2B,
                        0X7C, 0X2A, 0X2A, 0X7C,
                        0X7C, 0X20, 0X20, 0X7C,
                        0X2B, 0X2D, 0X2D, 0X2B
                    ]
                );//this avoids the need to set the length and width of a PLAYER type object
            case LevelObject.SPAWN:
                dim.w = 4;//this makes SPAWN type objects be of uniform size
                dim.h = 4;//
                return new Int8Array(
                    [
                        0X00, 0X2F, 0X5C, 0X00,
                        0X2F, 0X00, 0X00, 0X5C,
                        0X5C, 0X00, 0X00, 0X2F,
                        0X00, 0X5C, 0X2F, 0X00
                    ]
                );
            case LevelObject.PORTAL:
                dim.w = 4;//this makes SPAWN type objects be of uniform size
                dim.h = 4;//
                return new Int8Array(
                    [
                        0X00, 0X2F, 0X5C, 0X00,
                        0X3C, 0X00, 0X00, 0X3E,
                        0X3C, 0X00, 0X00, 0X3E,
                        0X00, 0X5C, 0X2F, 0X00
                    ]
                );
            default:
                break;
        }

        return returnChars;
    }//makes an array of characters that corresponds to the object

    constructor(x, y, w, h, color, type, active)
    {
        this.area = new Area(x, y, w, h);
        this.color = color;
        this.active = active;
        this.type = type;
        this.chars = LevelObject.makeChars(type, this.area.dim);
    }
}