class AsciiDisplay {

    #width;
    #height;
    #canvasWidth;
    #canvasHeight;
    #charSize;
    #ctx;
    #chars;
    #shader;
    #hasShader;

    constructor(width, height, charSize, canvasID) {

        this.#width = width;  //sets width and height.
        this.#height = height;//these can not be changed after they are set to a value.

        this.#chars = new Int32Array(width * height);
        //creates an array that stores display data.
        //each index is a character with the following format:
        //most significant byte = ascii value,
        //next byte = red color value,
        //next byte = green color value,
        //next byte = blue color value.

        this.#charSize = charSize;//the size in pixels of each character's height.

        this.#canvasWidth = document.getElementById(canvasID).width = (charSize * 10 / 16) * width;
        //the width of the canvas is the 10 16ths of charSize multiplied the width in characters.

        this.#canvasHeight = document.getElementById(canvasID).height = charSize * height;
        //the height of the canvas is the height in characters multiplied by charSize.

        this.#ctx = document.getElementById(canvasID).getContext("2d");
        //gets context of the canvas with the specified ID.

        this.#ctx.font = this.#charSize + "px monospace";
        //stes the font to monospace and the size of the font to charSize.

        this.displayLayers = [];
        //stores the display layers.

        this.#hasShader = false;//if this is false, shaders are
        //ignored when rendering the ascii.

        this.shaderInfo = {};//any info passed to the shader other than chars

        this.camera = { x: 0, y: 0 };//this is the camera vector. 
        //(note: this only effects layers with a relative position)
    }

    get width() {
        return this.#width;
    }//gets width.

    get height() {
        return this.#height;
    }//gets height.

    drawChars() {//draws characters to the canvas.

        this.#ctx.clearRect(0, 0, this.#canvasWidth, this.#canvasHeight);
        //clears the canvas

        for (let i = this.#width * this.#height; i-- > 0;) {
            //I understand that this for loop is cursed.

            this.#chars[i] = 0;
        }//clears chars of previous values.

        for (let i = this.displayLayers.length; i-- > 0;) {

            if (this.displayLayers[i].display)
                transferCharData(
                    0, 0, this.#width, this.#height, this.displayLayers[i].shadedChars,
                    0, 0, this.#width, this.#height, this.#chars
                );//transfers the char data in each layer to this.#chars.

        }

        if (this.#hasShader) this.#chars = this.#shader(this.#chars, this.shaderInfo);
        //applies shader if one exists.
        //(note: the shader function should return an Int32Array of the
        //length this.#width * this.#heigth)

        for (let i = this.#width; i-- > 0;) {     //
            for (let j = this.#height; j-- > 0;) {//loops through each index in chars

                this.#ctx.fillStyle = "rgb(" +
                ((this.#chars[i + j * this.#width] & 0XFF0000) >> 16) + ", " +
                ((this.#chars[i + j * this.#width] & 0XFF00) >> 8) + ", " +
                (this.#chars[i + j * this.#width] & 0XFF) + ")";
                //sets the fill style to the color data of the index

                this.#ctx.fillText(
                    String.fromCharCode(
                        (this.#chars[i + j * this.#width] & 0XFF000000) >>> 24
                    ),
                    i * (this.#charSize * 10 / 16),
                    j * this.#charSize + (this.#charSize * 14 / 16)
                );//draws the character at its position
            }
        }
    }

    addDisplayLayer(name, buffers) {
        const layer = new DisplayLayer(this.#width, this.#height, this.camera, name, buffers);
        this.displayLayers.push(layer);
        return layer;
    }//this adds a layer and returns that layer

    addUiLayer(navWidth, navHeight, name) {
        const layer = new UiLayer(this.#width, this.#height, navWidth, navHeight, name);
        this.displayLayers.push(layer);
        return layer;
    }//this adds a ui layer and returns that layer

    removeDisplayLayer(layerName) {
        for (let i = this.displayLayers.length; i-- > 0;) {
            if (this.displayLayers[i].name === layerName)
                this.displayLayers.splice(i, 1);
        }
    }//this removes a layer

    set shader(shaderFunction) {
        if (typeof shaderFunction === "function") {
            this.#shader = shaderFunction;
        };
        this.#hasShader = true;
    }//sets the shader

    removeShader() {
        this.#hasShader = false;
    }//removes the shader

}

class DisplayLayer {

    #chars;
    #shader;
    #hasShader;
    #width;
    #height;
    #camera;
    #name;

    constructor(width, height, camera, name, buffers) {
        this.#name = name;

        this.#width = width;  //sets the width and heigth to the width and height of the 
        this.#height = height;//instance of AsciiDisplay that created the layer.

        this.#chars = new Int32Array(width * height * (buffers + 1));
        //creates an array of 32 bit integers to store display data.

        this.#shader = undefined;//
        this.#hasShader = false; //same as AsciiDisplay, but applied to the layer.
        this.shaderInfo = {};//any info passed to the shader other than chars

        this.asciiObjects = [];//stores ascii objects in the layer.

        this.display = true;//if this is false, the layer is hidden.

        this.#camera = camera;
        //this sets the camera to the camera of the AsciiDiaplay that
        //created the layer.

        this.relativePosition = true;
        //this controls if objects are displayed from the point of
        ///the camera or from (0, 0).
    }

    get width() {
        return this.#width;
    }//gets width.

    get height() {
        return this.#height;
    }//gets height.

    get name() {
        return this.#name;
    }

    set shader(shaderFunction) {
        if (typeof shaderFunction === "function") {
            this.#shader = shaderFunction;
        };
        this.#hasShader = true;
    }//sets shader

    removeShader() {
        this.#hasShader = false;
    }//removes shader

    addAsciiObject(x, y, width, height, name, chars, buffer) {
        if(buffer === undefined)buffer = 0;
        const asciiObject = new AsciiObject(x, y, width, height, name, chars, buffer);
        this.asciiObjects.push(asciiObject);
        return asciiObject;
    }//adds ascii objects to the layer and returns the object

    removeAsciiObject(objectName) {
        for (let i = this.asciiObjects.length; i-- > 0;) {
            if (this.asciiObjects[i].name === objectName)
                this.asciiObjects.splice(i, 1);
        }
    }//removes ascii objects from the layer

    get layerAscii() {//gets the display data from ascii objects in the layer,
        //and transfers that data to the layer

        for (let i = this.#chars.length; i-- > 0;) {
            this.#chars[i] = 0;
        }//clears previous data stored in chars

        for (let i = 0; i < this.asciiObjects.length; ++i) {
            //loops through each asciiObject

            const temp = this.asciiObjects[i];
            //stores the current asciiObject as "temp"

            if (temp.display)
                transferCharData(
                    temp.x, temp.y,
                    temp.width, temp.height, temp.shadedChars,
                    ((this.relativePosition) ? this.#camera.x : 0),
                    ((this.relativePosition) ? this.#camera.y : 0),
                    this.#width, this.#height, this.#chars, temp.buffer
                );//transfers the char data from the ascii object to the layer
        }
    }

    get shadedChars() {
        this.layerAscii;
        return (this.#hasShader) ? this.#shader(this.#chars, this.shaderInfo) : this.#chars;
    }//gets the char data of the layer and if it has a shader, applies a shader to the chars
}

class AsciiObject {

    #shader;
    #hasShader;
    #chars;
    #width;
    #height;
    #name;

    constructor(x, y, width, height, name, chars, buffer) {
        this.buffer = buffer;
        
        this.#name = name;

        this.display = true;

        this.x = x;//
        this.y = y;//x and y positions

        this.#width = width;  //
        this.#height = height;//width and height

        this.#hasShader = false;

        this.shaderInfo = {};//any info passed to the shader other than chars

        if (typeof chars === "function") {
            chars = chars();
        }//this allows chars to be created by a function

        if (chars.length === (width * height))
            this.#chars = new Int32Array(chars);
        else
            this.#chars = new Int32Array(width * height);
        //creates the array that stores chars in the asciiObject,
        //and if a valid array is provided, it is used.
    }

    get name() {
        return this.#name;
    }//gets the name given to the object

    get width() {
        return this.#width;
    }//gets width

    get height() {
        return this.#height;
    }//gets height

    set shader(shaderFunction) {
        if (typeof shaderFunction === "function") {
            this.#shader = shaderFunction;
        };
        this.#hasShader = true;
    }//sets the shader

    removeShader() {
        this.#hasShader = false;
    }//removes the shader

    get shadedChars() {
        return (this.#hasShader) ? this.#shader(this.#chars, this.shaderInfo) : this.#chars;
    }//gets chars and applies a shader if one exists.

    get chars() {
        return this.#chars;
    }//gets chars

    setChars(charArray) {
        if(charArray.length === this.#chars.length)this.#chars = new Int32Array(charArray);
    }//sets chars if a valid value is given
}

class UiLayer {

    #displayLayer;
    #navArray;
    #navWidth;
    #navHeight;
    #name;
    #highlightedElement;

    constructor(width, height, navWidth, navHeight, name) {
        this.display = true;

        this.#navArray = new Uint16Array(navWidth * navHeight);
        //an array used to represent navigation across the UI

        this.#navWidth = navWidth;
        this.#navHeight = navHeight;
        //dimensions of the navArray

        this.#name = name;

        this.#displayLayer = new DisplayLayer(width, height, { x: 0, y: 0 }, "", 0);
        //the display layer

        this.navPosition = { x: 0, y: 0 };
    }

    get name() {
        return this.#name;
    }

    set shader(shaderFunction) {
        this.#displayLayer.shader = shaderFunction;
    }//sets the shader

    removeShader() {
        this.#displayLayer.removeShader();
    }//removes shader

    get shadedChars() {
        return this.#displayLayer.shadedChars;
    }//gets chars

    addAsciiObject(x, y, width, height, navX, navY, navWidth, navHeight, chars, selectFn) {
        const asciiObject = new AsciiObject(x, y, width, height, "", chars, 0);
        this.#displayLayer.asciiObjects.push(asciiObject);
        asciiObject.shaderInfo.highlighted = false;
        asciiObject.selectFn = selectFn;

        const temp = new Int16Array(navWidth * navHeight);

        for (let i = navWidth * navHeight; i-- > 0;) {
            temp[i] = this.#displayLayer.asciiObjects.length;
        }

        transferCharData(navX, navY, navWidth, navHeight, temp, 0, 0,
            this.#navWidth, this.#navHeight, this.#navArray);

        return asciiObject;
    }//adds ascii objects to the layer and returns the object

    #navDirection(direction) {
        let ignoreVal = this.#navArray[this.navPosition.x + this.navPosition.y * this.#navWidth];

        while (
            this.#navArray[this.navPosition.x + this.navPosition.y * this.#navWidth] ===
            ignoreVal ||
            this.#navArray[this.navPosition.x + this.navPosition.y * this.#navWidth] === 0
        ) {
            switch (direction) {
                case 0:
                    --this.navPosition.y;
                    break
                case 1:
                    ++this.navPosition.y;
                    break
                case 2:
                    --this.navPosition.x;
                    break
                case 3:
                    ++this.navPosition.x;
                    break
            }

            if (this.navPosition.y === -1 || this.navPosition.y === this.#navHeight) {
                ignoreVal = 0;
                direction ^= 1;
                switch (direction) {
                    case 0:
                        --this.navPosition.y;
                        break
                    case 1:
                        ++this.navPosition.y;
                        break
                }
            }

            if (this.navPosition.x === -1 || this.navPosition.x === this.#navWidth) {
                ignoreVal = 0;
                direction ^= 1;
                switch (direction) {
                    case 2:
                        --this.navPosition.x;
                        break
                    case 3:
                        ++this.navPosition.x;
                        break
                }
            }
        }

        if(this.#highlightedElement !== undefined)
            this.#displayLayer.asciiObjects[this.#highlightedElement].shaderInfo.highlighted = false;
        this.#highlightedElement = 
            this.#navArray[this.navPosition.x + this.navPosition.y * this.#navWidth] - 1;
        this.#displayLayer.asciiObjects[this.#highlightedElement].shaderInfo.highlighted = true;

    }//navigates the UI based on the direction given

    highlight(index){
        if(this.#highlightedElement !== undefined)
            this.#displayLayer.asciiObjects[this.#highlightedElement].shaderInfo.highlighted = false;
        this.#highlightedElement = index;
        this.#displayLayer.asciiObjects[this.#highlightedElement].shaderInfo.highlighted = true;
    }//highlights the object at your current nav position

    select(){
        this.#displayLayer.asciiObjects[this.#highlightedElement].selectFn(
            this.#displayLayer.asciiObjects[this.#highlightedElement]
        );
    }//calls the select function of the highlighted object

    navUp(){
        this.#navDirection(0)
    }//moves up

    navDown(){
        this.#navDirection(1)
    }//moves down

    navLeft(){
        this.#navDirection(2)
    }//moves left

    navRight(){
        this.#navDirection(3)
    }//moves right

}

function transferCharData(x1, y1, width1, height1, chars1, x2, y2, width2, height2, chars2, buffer)
{
    //this function takes 2 arrays of characters with color data that exist in 2d space,
    //and transfers data from the first to the second where they intersect, however it 
    //does not copy the value 0

    const minX = ((x1 < x2) ? x2 : x1);
    const minY = ((y1 < y2) ? y2 : y1);
    const maxX = (x1 + width1 < x2 + width2) ? x1 + width1 : x2 + width2;
    const maxY = (y1 + height1 < y2 + height2) ? y1 + height1 : y2 + height2;

    buffer = (buffer === undefined) ? 0 : buffer * width2 * height2;

    for (let i = minX; i < maxX; ++i) {
        for (let j = minY; j < maxY; ++j) {

            if (chars1[i - x1 + (j - y1) * width1] !== 0)
                chars2[i - x2 + (j - y2) * width2 + buffer] =
                    chars1[i - x1 + (j - y1) * width1];

        }
    }
}