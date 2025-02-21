class Pos {
    constructor(x, y) 
    {
        this.x = x;
        this.y = y;
    }
}//a position in 2d space

class Dim {
    constructor(w, h) 
    {
        this.w = w;
        this.h = h;
    }
}//2d dimensions

class Area 
{
    static collisionCheck(area1, area2)
    {
        if (
            ((area1.pos.x < area2.pos.x) ? area2.pos.x : area1.pos.x)
            //the farthest right left edge
                >=
            ((area1.pos.x + area1.dim.w < area2.pos.x + area2.dim.w) ?
                area1.pos.x + area1.dim.w : area2.pos.x + area2.dim.w)
            //the farthest left right edge
        ) 
        {//if this is true, the areas do not collide on the x axis
            return false;
        }
        
        if (
            ((area1.pos.y < area2.pos.y) ? area2.pos.y : area1.pos.y)
            //the heighest bottom edge
                >=
            ((area1.pos.y + area1.dim.h < area2.pos.y + area2.dim.h) ?
                area1.pos.y + area1.dim.h : area2.pos.y + area2.dim.h)
            //the lowest top edge
        ) 
        {//if this is true, the areas do not collide on the y axis
            return false;
        }

        return true;
        //if both of the previous if statements are false, then the areas 
        //collide of both axes

    }//checks if 2 areas collide

    constructor(x, y, w, h)
    {
        this.pos = new Pos(x, y);
        this.dim = new Dim(w, h);
    }
}
//an area in 2dspace with a position and dimensions, the position is the upper
//left corner