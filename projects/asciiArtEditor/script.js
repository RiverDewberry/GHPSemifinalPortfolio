//made by River Dewberry
const AGL = {
    keysDown: [],
    view: { x: 0, y: 0 },
    rooms: {},
    room: "",

    setupCanvas: function (info) {
        this.canvas = document.getElementById(info.canvasID);
        this.displayWidth = info.width;
        this.displayHeight = info.height;
        this.charSize = Math.round(info.charSize);
        this.canvas.width = (this.charSize * 10 / 16) * this.displayWidth;
        this.canvas.height = this.charSize * this.displayHeight;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = this.charSize + "px monospace";
        this.displayArray = new Int32Array(this.displayHeight * this.displayWidth);
        this.preShaderArray = new Int32Array(this.displayHeight * this.displayWidth);
        this.hasShader = false;

        this.keysDownAdd = this.keysDownAdd.bind(this);
        this.keysDownRemove = this.keysDownRemove.bind(this);

        window.addEventListener('keydown', this.keysDownAdd);
        window.addEventListener('keyup', this.keysDownRemove);
    },

    keysDownAdd: function (e) {
        if (!this.keysDown.includes(e.key))
            this.keysDown.push(e.key);
    },

    keysDownRemove: function (e) {
        if (this.keysDown.includes(e.key)) {
            if (e.key == "Shift")
                this.keysDown = this.keysDown.slice(0, this.keysDown.indexOf("Shift"));
            this.keysDown.splice(this.keysDown.indexOf(e.key), 1);
        };
    },

    displayCharArray: function () {
        this.ctx.clearRect(0, 0, this.displayWidth * (this.charSize * 10 / 16), this.displayHeight * this.charSize);
        if(this.hasShader === true)this.displayArray = this.shader(this.displayArray);
        for (let i = this.displayHeight - 1; i > -1; --i) {
            for (let j = this.displayWidth - 1; j > -1; --j) {

                this.ctx.fillStyle = `rgb(
                ${(this.displayArray[i * this.displayWidth + j] & (0XFF << 16)) >> 16}
                ${(this.displayArray[i * this.displayWidth + j] & (0XFF << 8)) >> 8}
                ${(this.displayArray[i * this.displayWidth + j] & 0XFF)}
                )`//sets fillStyle to the color data from each index in the array

                this.ctx.fillText(
                    String.fromCharCode(
                        ((this.displayArray[i * this.displayWidth + j] & (0XFF << 24)) >>> 24)
                    ),
                    j * (this.charSize * 10 / 16),
                    i * this.charSize + (this.charSize * 14 / 16)
                );//draws each character at its position
            }
        }
        for (let i = this.displayWidth * this.displayHeight - 1; i > -1; --i) {
            this.displayArray[i] = 0;
        }
    },

    addToCharArray: function (x, y, w, h, array, rel) {

        if (rel) {
            x -= this.view.x;
            y -= this.view.y;
        }

        let width = w;
        let height = h;
        let startX = 0;
        let startY = 0;

        if (x < 0) startX = -x;
        if (y < 0) startY = -y;

        if (w + x <= 0 || h + y <= 0) return;

        if (width + x > this.displayWidth) width = this.displayWidth - x;
        if (height + y > this.displayHeight) height = this.displayHeight - y;

        for (let i = startY; i < height; ++i) {
            for (let j = startX; j < width; ++j) {
                if ((array[i * w + j] & (0XFF << 24)) !== 0)
                    this.displayArray[(i + y) * this.displayWidth + (j + x)] = array[i * w + j];
            }
        }
    },

    addRoom: function (info) {
        this.rooms[info.roomName] = {
            roomWidth: info.width,
            roomHeight: info.height,
            ASCIIObjects: [],
        };

        if (this.rooms[info.roomName].roomWidth < this.displayWidth)
            this.rooms[info.roomName].roomWidth = this.displayWidth;
        if (this.rooms[info.roomName].roomHeight < this.displayHeight)
            this.rooms[info.roomName].roomHeight = this.displayHeight;
    },

    addToRoom: function (ASCII, room) {
        this.rooms[room].ASCIIObjects.push(ASCII);
        this.rooms[room].ASCIIObjects.sort(function (a, b) {
            return b.displayLayer - a.displayLayer;
        })
    },

    drawRoom: function () {
        for (let i = 0; i < this.rooms[this.room].ASCIIObjects.length; ++i) {
            let e = this.rooms[this.room].ASCIIObjects[i];
            if (e.display)
                this.addToCharArray(e.x, e.y, e.width, e.height, e.charArray, e.rel);
        }

        for (let i = this.displayArray.length - 1; i > -1; --i) {
            this.preShaderArray[i] = this.displayArray[i];
            this.displayArray[i] = 0;
        }

        for (let i = 0; i < this.rooms[this.room].ASCIIObjects.length; ++i) {
            let e = this.rooms[this.room].ASCIIObjects[i];
            if (e.display)
                this.addToCharArray(e.x, e.y, e.width, e.height, ((e.hasShader) ? e.shader(e.charArray) : e.charArray), e.rel);
        }
        this.displayCharArray();
    },

    ASCIIObject: function (info) {
        (info.shader === undefined) ? info.hasShader = false : info.hasShader = true;
        if (info.relativePosition === undefined) info.relativePosition = true;
        if (info.display === undefined) info.display = true;
        if (info.charArray === undefined) info.charArray = [];
        let charArray = new Int32Array(info.width * info.height);
        for (let i = 0; i < info.charArray.length; ++i) {
            charArray[i] = info.charArray[i];
        }
        const temp = {
            x: info.x || 0,
            y: info.y || 0,
            rel: info.relativePosition,
            width: info.width,
            height: info.height,
            charArray: info.charArray,
            display: info.display,
            displayLayer: info.displayLayer,
            shader: info.shader,
            hasShader: info.hasShader
        };
        this.addToRoom(temp, info.room);
        return temp;
    },

    toCharArray: function (text, color) {
        let charArray = new Int32Array(text.length);
        for (let i = 0; i < text.length; ++i) {
            charArray[i] = (text.charCodeAt(i) << 24) | color;
        }
        return charArray;
    },

    centerViewOn: function (ASCIIObject) {
        this.view.x = Math.round(ASCIIObject.x + (ASCIIObject.width * 0.5) - (this.displayWidth * 0.5));
        this.view.y = Math.round(ASCIIObject.y + (ASCIIObject.height * 0.5) - (this.displayHeight * 0.5));
        if (this.view.x < 0) this.view.x = 0;
        if (this.view.y < 0) this.view.y = 0;
        if (this.view.x + this.displayWidth > this.rooms[this.room].roomWidth)
            this.view.x = this.rooms[this.room].roomWidth - this.displayWidth;
        if (this.view.y + this.displayHeight > this.rooms[this.room].roomHeight)
            this.view.y = this.rooms[this.room].roomHeight - this.displayHeight;
    },

    collisionCheck: function (ASCIIObject1, ASCIIObject2) {
        return ((Math.abs((ASCIIObject1.x + ASCIIObject1.width * 0.5) - (ASCIIObject2.x + ASCIIObject2.width * 0.5)) <= (ASCIIObject1.width + ASCIIObject2.width) * 0.5 - 1) &&
            (Math.abs((ASCIIObject1.y + ASCIIObject1.height * 0.5) - (ASCIIObject2.y + ASCIIObject2.height * 0.5)) <= (ASCIIObject1.height + ASCIIObject2.height) * 0.5 - 1))
    },

    addShader: function (shader){
        this.hasShader = true;
        this.shader = shader;
    },

    removeShader: function () {
        this.hasShader = false;
    }
};

AGL.setupCanvas(
    {
        charSize: 16,
        width: 100,
        height: 30,
        canvasID: "Canvas"
    }
);

AGL.addRoom({
    roomName: "room1",
    width: 100,
    height: 30,
})

AGL.room = "room1";

let mouse = AGL.ASCIIObject({
    room: "room1",
    x: 10,
    y: 10,
    width: 1,
    height: 1,
    charArray: [(43 << 24) | (255 << 16) | (255 << 8) | 255],
    displayLayer: 0
})

let drawTo = AGL.ASCIIObject({
    room: "room1",
    x: 2,
    y: 6,
    width: 20,
    height: 10,
    displayLayer: 1
})

let drawContainer = AGL.ASCIIObject({
    room: "room1",
    x: drawTo.x - 1,
    y: drawTo.y - 1,
    width: drawTo.width + 2,
    height: drawTo.height + 2,
    displayLayer: 2,
    shader: function (charArray) {
        let returnArray = new Int32Array(charArray.length);
        for (let i = charArray.length; i-- > 0;) {
            if (charArray[i] >>> 24 !== 35) {
                let x = drawContainer.x + (i % drawContainer.width);
                let y = drawContainer.y + ((i - (i % drawContainer.width)) / drawContainer.width);
                let dist = [
                    255 - Math.round(Math.sqrt((((y - mouse.y - 5) * 1.6) * ((y - mouse.y - 5) * 1.6)) + (x - mouse.x) * (x - mouse.x)) * 20),
                    255 - Math.round(Math.sqrt((((y - mouse.y) * 1.6) * ((y - mouse.y) * 1.6)) + (x - mouse.x - 8) * (x - mouse.x - 8)) * 20),
                    255 - Math.round(Math.sqrt((((y - mouse.y) * 1.6) * ((y - mouse.y) * 1.6)) + (x - mouse.x + 8) * (x - mouse.x + 8)) * 20),
                    255 - Math.round(Math.sqrt((((y - mouse.y + 5) * 1.6) * ((y - mouse.y + 5) * 1.6)) + (x - mouse.x) * (x - mouse.x)) * 20)
                ];
                dist[0] = (dist[0] < 0) ? 0 : dist[0] >> 2;
                dist[1] = (dist[1] < 0) ? 0 : dist[1] >> 2;
                dist[2] = (dist[2] < 0) ? 0 : dist[2] >> 2;
                dist[3] = (dist[3] < 0) ? 0 : dist[3] >> 3;
                returnArray[i] = 0X23000000 | ((dist[0] + dist[3]) << 16) | ((dist[1] + dist[3]) << 8) | (dist[2] + dist[3]);
            } else returnArray[i] = charArray[i];
        }
        return returnArray;
    }
})

let enterColor = AGL.ASCIIObject({
    room: "room1",
    x: 1,
    y: 1,
    width: 12,
    height: 3,
    charArray: [2097151999, 764805120, 764805120, 1392443392, 1174339584, 1157562368, 986237128, 0, 0, 0, 764805120, 2097151999, 2097151999, 1191247616, 1375796992, 1157693184, 1157693184, 1308688128, 986237128, 0, 0, 0, 755013120, 2097151999, 2097151999, 754974870, 1107296511, 1275068671, 1426063615, 1157628159, 986237128, 0, 0, 0, 754974870, 2097151999],
    displayLayer: 1
})

let enterDimensions = AGL.ASCIIObject({
    room: "room1",
    x: enterColor.x + enterColor.width + 1,
    y: 1,
    width: 13,
    height: 3,
    charArray: [2097151999, 768133320, 1476395007, 1241513983, 1157627903, 1426063359, 1224736767, 986237128, 0, 0, 0, 768133320, 2097151999, 2097151999, 1224736767, 1174405119, 1241513983, 1207959551, 1224736767, 1426063359, 986237128, 0, 0, 0, 768133320, 2097151999, 2097151999, 768133320, 768133320, 768133320, 1174405119, 1325400063, 1426063359, 1174405119, 1392508927, 768133320, 768133320, 768133320, 2097151999],
    displayLayer: 1
})

let inputCommands = AGL.ASCIIObject({
    room: "room1",
    x: enterDimensions.x + enterDimensions.width + 1,
    y: 1,
    width: 4,
    height: 1,
    charArray: [1241513983, 1325400063, 989855743, 1610612735],
    displayLayer: 1
})

let enterCommands = AGL.ASCIIObject({
    room: "room1",
    x: enterDimensions.x + enterDimensions.width + 1,
    y: 2,
    width: 5,
    height: 1,
    charArray: [1174405119, 1325400063, 1426063359, 1174405119, 1392508927],
    displayLayer: 1
})

let outputCommands = AGL.ASCIIObject({
    room: "room1",
    x: enterDimensions.x + enterDimensions.width + 1,
    y: 3,
    width: 4,
    height: 1,
    charArray: [1342177279, 1442840575, 1426063359, 989855743],
    displayLayer: 1
})

resizeDrawTo(15, 10, 0, 0);
//drawTo.charArray = [0X000000,0X000000,0X000000,0X4CFFFFFF,0X41FFFFFF,0X59FFFFFF,0X4CFFFFFF,0X41FFFFFF,0X2EFFFFFF,0X54FFFFFF,0X58FFFFFF,0X54FFFFFF,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X5F967D64,0X5F967D64,0X5F967D64,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X2F967D64,0X20000000,0X2D967D64,0X20000000,0X5C967D64,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X28967D64,0X20000000,0X2F967D64,0X20000000,0X5C967D64,0X20000000,0X29967D64,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X29967D64,0X28967D64,0X6FC8C8C8,0X20000000,0X6FC8C8C8,0X29967D64,0X28967D64,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X2F967D64,0X28967D64,0X5CD7B48C,0X20000000,0X5FC86464,0X20000000,0X2FD7B48C,0X29967D64,0X5C967D64,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X28967D64,0X20000000,0X7C967D64,0X5CD7B48C,0X2ED7B48C,0X2FD7B48C,0X7C967D64,0X20000000,0X29967D64,0X000000,0X000000,0X000000,0X000000,0X000000,0X000000,0X2F646464,0X5C967D64,0X29967D64,0X5C646464,0X5F646464,0X2F646464,0X28967D64,0X2F967D64,0X5C646464,0X000000,0X000000,0X000000,0X000000,0X000000,0X2F646464,0X20000000,0X20000000,0X20000000,0X20000000,0X20000000,0X20000000,0X20000000,0X20000000,0X20000000,0X5C646464,0X000000,0X000000,0X000000,0X000000,0X7C646464,0X7C646464,0X5C646464,0X20000000,0X20000000,0X20000000,0X20000000,0X20000000,0X2F646464,0X7C646464,0X7C646464,0X000000,0X000000];

enterColor.r = 255;
enterColor.g = 255;
enterColor.b = 255;
enterDimensions.w = drawTo.width;
enterDimensions.h = drawTo.height;

let drawColor = (enterColor.r << 16) | (enterColor.g << 8) | enterColor.b;
let lastKey = "";
let lastKeyPressed = "";
let numberKey = undefined;
let output = 0;
let colorList = [];
mouse.count = 0;
mouse.movecheck = true;
mouse.enterCheck = true;
mouse.slow = true;
inputCommands.text = "";

for (let i = 0; i < 3; ++i) {
    enterColor.charArray[i + 7] = AGL.toCharArray((enterColor.r + "").padStart(3, "0"), 255 << 16)[i];
}
for (let i = 0; i < 3; ++i) {
    enterColor.charArray[i + 19] = AGL.toCharArray((enterColor.g + "").padStart(3, "0"), 255 << 8)[i];
}
for (let i = 0; i < 3; ++i) {
    enterColor.charArray[i + 31] = AGL.toCharArray((enterColor.b + "").padStart(3, "0"), 255)[i];
}
for (let i = 0; i < 3; ++i) {
    enterDimensions.charArray[i + 8] = AGL.toCharArray((enterDimensions.w + "").padStart(3, "0"), (255 << 16) | (255 << 8) | (255))[i];
}
for (let i = 0; i < 3; ++i) {
    enterDimensions.charArray[i + 21] = AGL.toCharArray((enterDimensions.h + "").padStart(3, "0"), (255 << 16) | (255 << 8) | (255))[i];
}

//everything in this function is what runs each frame--------------------------
let frameInterval = setInterval(frame, 50);
function frame() {

    if (AGL.keysDown.includes("Enter")) {
        if (mouse.enterCheck) mouse.slow = !mouse.slow;
        mouse.enterCheck = false;
    } else {
        mouse.enterCheck = true;
    }

    if (mouse.movecheck || !mouse.slow) {
        if (AGL.keysDown.includes("ArrowUp")) {
            --mouse.y;
        }
        if (AGL.keysDown.includes("ArrowLeft")) {
            --mouse.x;
        }
        if (AGL.keysDown.includes("ArrowDown")) {
            ++mouse.y;
        }
        if (AGL.keysDown.includes("ArrowRight")) {
            ++mouse.x;
        }
    }

    if (AGL.keysDown.includes("ArrowRight") || AGL.keysDown.includes("ArrowUp") ||
        AGL.keysDown.includes("ArrowLeft") || AGL.keysDown.includes("ArrowDown"))
        mouse.movecheck = false;
    else mouse.movecheck = true;

    AGL.centerViewOn(mouse);

    if (lastKey !== AGL.keysDown[0] && lastKey !== "") {
        if (!Number.isNaN(Number(lastKey)))
            numberKey = Number(lastKey);
        else
            numberKey = undefined;
    } else
        numberKey = undefined;

    if (AGL.keysDown[0] !== "Shift") {
        if (lastKey !== (AGL.keysDown[0] || ""))
            lastKeyPressed = AGL.keysDown[0] || "";
        else
            lastKeyPressed = undefined;
    }
    else
        if (lastKey !== (AGL.keysDown[1] || ""))
            lastKeyPressed = AGL.keysDown[1] || "";
        else
            lastKeyPressed = undefined;

    if (AGL.keysDown[0] !== "Shift")
        lastKey = AGL.keysDown[0] || "";
    else lastKey = AGL.keysDown[1] || "";

    if (AGL.collisionCheck(mouse, drawTo)) {
        ++mouse.count;
        if (mouse.count % 10 === 5) {
            switch (Math.floor(mouse.count * 0.1) % 4) {
                case 0:
                    mouse.display = true;
                    mouse.charArray[0] = (43 << 24) | drawColor;
                    break;
                case 1:
                    mouse.charArray[0] = (32 << 24);
                    break;
                case 2:
                    mouse.charArray[0] = (43 << 24) | drawColor;
                    break;
                case 3:
                    mouse.display = false;
                    break;
            }
        }

        if ((Math.floor(mouse.count * 0.1) % 4 === 1 || Math.floor(mouse.count * 0.1) % 4 === 3) && !mouse.movecheck) {
            mouse.charArray[0] = (43 << 24) | ~(drawColor | (255 << 24));
            mouse.display = true;
            mouse.count = 0;
        }

        if (lastKey.length === 1) {
            drawTo.charArray[(mouse.y - drawTo.y) * drawTo.width + (mouse.x - drawTo.x)] = (lastKey.charCodeAt(0) << 24) | drawColor;
        }
        else if ("Backspace" === lastKey)
            drawTo.charArray[(mouse.y - drawTo.y) * drawTo.width + (mouse.x - drawTo.x)] = 0;
    }
    else {
        mouse.charArray[0] = (43 << 24) | (255 << 16) | (255 << 8) | 255;
        mouse.display = true;
    }

    if (AGL.collisionCheck(enterColor, mouse)) {
        switch ((enterColor.y + enterColor.height) - mouse.y) {
            case 3:
                if (numberKey !== undefined) {
                    enterColor.r *= 10;
                    enterColor.r += numberKey;
                    enterColor.r -= Math.floor(enterColor.r * 0.001) * 1000;
                };
                break;
            case 2:
                if (numberKey !== undefined) {
                    enterColor.g *= 10;
                    enterColor.g += numberKey;
                    enterColor.g -= Math.floor(enterColor.g * 0.001) * 1000;
                }
                break;
            case 1:
                if (numberKey !== undefined) {
                    enterColor.b *= 10;
                    enterColor.b += numberKey;
                    enterColor.b -= Math.floor(enterColor.b * 0.001) * 1000;
                }
                break;
        }

        enterColor.r = limitDigitValues(enterColor.r);
        enterColor.g = limitDigitValues(enterColor.g);
        enterColor.b = limitDigitValues(enterColor.b);

        drawColor = (enterColor.r << 16) | (enterColor.g << 8) | enterColor.b;

        for (let i = 0; i < 3; ++i) {
            enterColor.charArray[i + 7] = AGL.toCharArray((enterColor.r + "").padStart(3, "0"), 255 << 16)[i];
        }

        for (let i = 0; i < 3; ++i) {
            enterColor.charArray[i + 19] = AGL.toCharArray((enterColor.g + "").padStart(3, "0"), 255 << 8)[i];
        }

        for (let i = 0; i < 3; ++i) {
            enterColor.charArray[i + 31] = AGL.toCharArray((enterColor.b + "").padStart(3, "0"), 255)[i];
        }
    }

    if (AGL.collisionCheck(enterDimensions, mouse)) {
        switch ((enterDimensions.y + enterDimensions.height) - mouse.y) {
            case 3:
                if (numberKey !== undefined) {
                    enterDimensions.w *= 10;
                    enterDimensions.w += numberKey;
                    enterDimensions.w -= Math.floor(enterDimensions.w * 0.001) * 1000;
                };
                break;
            case 2:
                if (numberKey !== undefined) {
                    enterDimensions.h *= 10;
                    enterDimensions.h += numberKey;
                    enterDimensions.h -= Math.floor(enterDimensions.h * 0.001) * 1000;
                }
                break;
            case 1:
                resizeDrawTo(enterDimensions.w, enterDimensions.h, 0, 0);
                break;
        }

        for (let i = 0; i < 3; ++i) {
            enterDimensions.charArray[i + 8] = AGL.toCharArray((enterDimensions.w + "").padStart(3, "0"), (255 << 16) | (255 << 8) | (255))[i];
        }
        for (let i = 0; i < 3; ++i) {
            enterDimensions.charArray[i + 21] = AGL.toCharArray((enterDimensions.h + "").padStart(3, "0"), (255 << 16) | (255 << 8) | (255))[i];
        }
    }

    if (AGL.collisionCheck(mouse, inputCommands)) {
        if (lastKeyPressed !== undefined) {
            if (lastKeyPressed.length === 1)
                inputCommands.text += lastKeyPressed;
            if (lastKeyPressed === "Backspace") {
                inputCommands.text = inputCommands.text.slice(0, -1);
            }
        }
        inputCommands.width = 4 + inputCommands.text.length;
        inputCommands.charArray = AGL.toCharArray("IN:" + inputCommands.text + "_", 16777215);
    }

    if (AGL.collisionCheck(mouse, enterCommands)) {
        parseCommandChain(inputCommands.text);
        inputCommands.text = "";
        inputCommands.width = 4 + inputCommands.text.length;
        inputCommands.charArray = AGL.toCharArray("IN:" + inputCommands.text + "_", 16777215);
    }

    if (AGL.keysDown.includes("Alt")) {
        let temp = `[${Array.from(drawTo.charArray).map((e) => {return "0X" + e.toString(16).toUpperCase().padEnd(8, "0")}).join(",")}]`;
        navigator.clipboard.writeText(temp);
        AGL.keysDown.splice(AGL.keysDown.indexOf("Alt"), 1);
    }

    AGL.drawRoom();
}
//-----------------------------------------------------------------------------

function limitDigitValues(int) {
    if (int > 255) { int -= (Math.floor(int * 0.01) * 100) - 200 };
    if (int > 255) { int -= (Math.floor(int * 0.1) * 10) - 250 };
    if (int > 255) int = 255;
    return int;
};

function resizeDrawTo(w, h, x, y) {
    drawContainer.width = w + 2;
    drawContainer.height = h + 2;
    drawContainer.charArray = new Int32Array((w + 2) * (h + 2));
    for (let i = 0; i < drawContainer.height; ++i) {
        for (let j = 0; j < drawContainer.width; ++j) {
            if (i === 0 || i === drawContainer.height - 1 || j === 0 || j === drawContainer.width - 1)
                drawContainer.charArray[i * drawContainer.width + j] = [(35 << 24) | (255 << 16) | (255 << 8) | 255];
        }
    }

    let tempCharArray = new Int32Array(w * h);

    let width = w;
    let height = h;
    let startX = 0;
    let startY = 0;

    if (x < 0) startX = -x;
    if (y < 0) startY = -y;

    if (w + x <= 0 || h + y <= 0) return;

    if (width + x > drawTo.width) width = drawTo.width - x;
    if (height + y > drawTo.height) height = drawTo.height - y;

    for (let i = startY; i < height; ++i) {
        for (let j = startX; j < width; ++j) {
            tempCharArray[(i + y) * w + (j + x)] = drawTo.charArray[i * drawTo.width + j];
        }
    }

    drawTo.width = w;
    drawTo.height = h;

    drawTo.charArray = tempCharArray;
    AGL.rooms[AGL.room].roomWidth = drawContainer.x + drawContainer.width;
    AGL.rooms[AGL.room].roomHeight = drawContainer.y + drawContainer.height;

    if (AGL.rooms[AGL.room].roomWidth < AGL.displayWidth)
        AGL.rooms[AGL.room].roomWidth = AGL.displayWidth;
    if (AGL.rooms[AGL.room].roomHeight < AGL.displayHeight)
        AGL.rooms[AGL.room].roomHeight = AGL.displayHeight;
}

function parseCommandChain(commands) {
    let err = false;
    outputCommands.text = "";
    commands = commands.split(" ");
    if (!commands.includes("op")) commands.push("oc");
    for (let i = 0; (i < commands.length) && !err; ++i) {
        switch (commands[i]) {
            case "n":
                ++i;
                if (i < commands.length && !Number.isNaN(Number(commands[i])))
                    output = Number(commands[i]);
                break;
            case "r":
                ++i;
                if (i < commands.length && !Number.isNaN(Number(commands[i])))
                    output &= ~(255 << 16); output |= (Number(commands[i]) & 255) << 16;
                break;
            case "g":
                ++i;
                if (i < commands.length && !Number.isNaN(Number(commands[i])))
                    output &= ~(255 << 8); output |= (Number(commands[i]) & 255) << 8;
                break;
            case "b":
                ++i;
                if (i < commands.length && !Number.isNaN(Number(commands[i])))
                    output &= ~255; output |= Number(commands[i]) & 255;
                break;
            case "l":
                ++i;
                if (i < commands.length && !Number.isNaN(Number(commands[i])))
                    colorList[Number(commands[i])] = output;
                break;
            case "d":
                drawColor = output;
                enterColor.r = (output & (255 << 16)) >> 16;
                enterColor.g = (output & (255 << 8)) >> 8;
                enterColor.b = output & 255;
                break;
            case "w":
                ++i;
                if (i < commands.length && !Number.isNaN(Number(commands[i])))
                    enterDimensions.w = Number(commands[i]);
                break;
            case "h":
                ++i;
                if (i < commands.length && !Number.isNaN(Number(commands[i])))
                    enterDimensions.h = Number(commands[i]);
                break;
            case "gd":
                output = drawColor;
                break;
            case "gw":
                output = enterDimensions.w;
                break;
            case "gh":
                output = enterDimensions.h;
                break;
            case "gl":
                ++i;
                output = colorList[Number(commands[i])];
                break;
            case "pl":
                break;
            case "oc":
                output = 0;
                break;
            case "op":
                break;
            case "p":
                outputCommands.width = 4 + output;
                outputCommands.charArray = AGL.toCharArray("OUT:" + output, 16777215);
                break;
            case ">":
                commands.splice(i + 2, 0, output);
                break;
            case "+":
                ++i;
                output += Number(commands[i]);
                break;
            case "-":
                ++i;
                output -= Number(commands[i]);
                break;
            case "*":
                ++i;
                output *= Number(commands[i]);
                break;
            case "/":
                ++i;
                if (i < commands.length && !Number.isNaN(Number(commands[i])))
                    output = Math.round(output / Number(commands[i]));
                break;
            case "c":
                navigator.clipboard.writeText(drawTo.charArray);
                break;
            case "ms":
                mouse.slow = true;
                break;
            case "mq":
                mouse.slow = false;
                break;
            default:
                err = true;
                break;
        }
    }

    for (let i = 0; i < 3; ++i) {
        enterDimensions.charArray[i + 8] = AGL.toCharArray((enterDimensions.w + "").padStart(3, "0"), (255 << 16) | (255 << 8) | (255))[i];
    }
    for (let i = 0; i < 3; ++i) {
        enterDimensions.charArray[i + 21] = AGL.toCharArray((enterDimensions.h + "").padStart(3, "0"), (255 << 16) | (255 << 8) | (255))[i];
    }
    for (let i = 0; i < 3; ++i) {
        enterColor.charArray[i + 7] = AGL.toCharArray((enterColor.r + "").padStart(3, "0"), 255 << 16)[i];
    }
    for (let i = 0; i < 3; ++i) {
        enterColor.charArray[i + 19] = AGL.toCharArray((enterColor.g + "").padStart(3, "0"), 255 << 8)[i];
    }
    for (let i = 0; i < 3; ++i) {
        enterColor.charArray[i + 31] = AGL.toCharArray((enterColor.b + "").padStart(3, "0"), 255)[i];
    }
    resizeDrawTo(enterDimensions.w, enterDimensions.h, 0, 0);
}