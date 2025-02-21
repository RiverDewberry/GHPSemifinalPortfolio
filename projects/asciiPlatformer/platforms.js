const platformLayer = display.addDisplayLayer("platforms", 3);
platformLayer.shader = platformShader;
const spikeLayer = display.addDisplayLayer("spikes", 3);
spikeLayer.shader = mergeColorsShader;
const goal = [
    spikeLayer.addAsciiObject(0, 0, 2, 2, "goalR",
        [0X23FF0000, 0X23FF0000, 0X23FF0000, 0X23FF0000], 1),
    spikeLayer.addAsciiObject(0, 0, 2, 2, "goalG",
        [0X2300FF00, 0X2300FF00, 0X2300FF00, 0X2300FF00], 2),
    spikeLayer.addAsciiObject(0, 0, 2, 2, "goalB",
        [0X230000FF, 0X230000FF, 0X230000FF, 0X230000FF], 3)
]

const platforms = [[], [], []];//arrays that stores platforms
const spikes = [[], [], []];//an array that stores spikes

const BLUE = 1, GREEN = 2, CYAN = 3, RED = 4, MAGENTA = 5, YELLOW = 6, WHITE = 7;

function platformChars(w, h, color) {
    const temp = new Int32Array(w * h);

    for (let i = w; i-- > 0;) {
        temp[i] |= 0X2000000 | color;
        temp[i + (h - 1) * w] |= 0X2000000 | color;
    }//makes sides

    for (let i = h; i-- > 0;) {
        temp[i * w] |= 0X1000000 | color;
        temp[w - 1 + i * w] |= 0X1000000 | color;
    }//makes top and bottom and corners

    for (let i = w - 1; --i > 0;) {
        for (let j = h - 1; --j > 0;) {
            temp[j * w + i] = 0X4000000;
        }
    }//fills center

    return temp;
}//makes characters for a platform

function spikeChars(w, h, color) {
    const temp = new Int32Array(w * h);

    for (let i = w * h; i-- > 0;) {
        temp[i] = 0X5E000000 | color;
    }

    return temp;
}

function addPlatform(x, y, w, h, color) {

    if(maxCameraX < x + w) maxCameraX = x + w;
    if(maxCameraY < y + h) maxCameraY = y + h;

    if ((color & 4) === 4) {
        platforms[0].push({ x: x, y: y, w: w, h: h });
        platformLayer.addAsciiObject(x, y, w, h, "platform",
            platformChars(w, h, 0XFF0000), 1);
    }

    if ((color & 2) === 2) {
        platforms[1].push({ x: x, y: y, w: w, h: h });
        platformLayer.addAsciiObject(x, y, w, h, "platform",
            platformChars(w, h, 0X00FF00), 2);
    }

    if ((color & 1) === 1) {
        platforms[2].push({ x: x, y: y, w: w, h: h });
        platformLayer.addAsciiObject(x, y, w, h, "platform",
            platformChars(w, h, 0X0000FF), 3);
    }
}

function collidesWithPlatforms(x, y, w, h, platforms) {
    for (let i = platforms.length; i-- > 0;) {
        if (
            (platforms[i].x + platforms[i].w > x) &&
            (x + w > platforms[i].x) && (y + h > platforms[i].y) &&
            (platforms[i].y + platforms[i].h > y) && h > 0 && w > 0
        ) return true;
    }
    return false;
}

function addSpike(x, y, w, h, color) {

    if(maxCameraX < x + w) maxCameraX = x + w;
    if(maxCameraY < y + h) maxCameraY = y + h;

    if ((color & 4) === 4) {
        spikes[0].push({ x: x, y: y, w: w, h: h });
        spikeLayer.addAsciiObject(x, y, w, h, "spike",
            spikeChars(w, h, 0XFF0000), 1);
    }

    if ((color & 2) === 2) {
        spikes[1].push({ x: x, y: y, w: w, h: h });
        spikeLayer.addAsciiObject(x, y, w, h, "spike",
            spikeChars(w, h, 0X00FF00), 2);
    }

    if ((color & 1) === 1) {
        spikes[2].push({ x: x, y: y, w: w, h: h });
        spikeLayer.addAsciiObject(x, y, w, h, "spike",
            spikeChars(w, h, 0X000FF), 3);
    }
}