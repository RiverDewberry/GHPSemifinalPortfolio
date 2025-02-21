//creates the display
const display = new AsciiDisplay(
    100,
    35,
    16,
    "Canvas"
);

//creates bounds for the camera
let maxCameraX = display.width;
let maxCameraY = display.height;
//-----------------------------

function platformShader(chars) {
    const temp = new Int32Array(chars);
    let adjacentChars;

    for (let b = 0; b++ < 3;) {
        for (let i = this.width; i-- > 0;) {
            for (let j = this.height; j-- > 0;) {
                if (!(temp[i + j * this.width + (b * this.height * this.width)] === 0)) {
                    adjacentChars = findAdjacentChars(chars, this.width, this.height, i, j, b);
                    let isBorder = false;
                    for (let k = 8; k-- > 0;) {
                        isBorder = isBorder || ((adjacentChars[k] & 0XFF000000) === 0);
                    }
                    if (!isBorder) temp[i + j * this.width + (b * this.height * this.width)] = 0;
                }
            }
        }

        for (let i = this.width; i-- > 0;) {
            for (let j = this.height; j-- > 0;) {
                adjacentChars = findAdjacentChars(chars, this.width, this.height, i, j, b);
                if ((adjacentChars[3] & 0XFF000000) === 0X1000000)
                    temp[i + j * this.width + (b * this.height * this.width)] |= 0X1000000;
                if ((adjacentChars[7] & 0XFF000000) === 0X1000000)
                    temp[i + j * this.width + (b * this.height * this.width)] |= 0X1000000;
                if ((adjacentChars[1] & 0XFF000000) === 0X2000000)
                    temp[i + j * this.width + (b * this.height * this.width)] |= 0X2000000;
                if ((adjacentChars[5] & 0XFF000000) === 0X2000000)
                    temp[i + j * this.width + (b * this.height * this.width)] |= 0X2000000;
                temp[i + j * this.width] |=
                    temp[i + j * this.width + (b * this.height * this.width)];
            }
        }
    }

    for (let i = this.width; i-- > 0;) {
        for (let j = this.height; j-- > 0;) {
            switch (temp[i + j * this.width] & 0X03000000) {
                case 0X01000000:
                    temp[i + j * this.width] &= 0XFFFFFF;
                    temp[i + j * this.width] |= 0X7C000000;
                    break;
                case 0X02000000:
                    temp[i + j * this.width] &= 0XFFFFFF;
                    temp[i + j * this.width] |= 0X2D000000;
                    break;
                case 0X03000000:
                    temp[i + j * this.width] &= 0XFFFFFF;
                    temp[i + j * this.width] |= 0X2B000000;
                    break;
                default:
                    temp[i + j * this.width] &= 0XFFFFFF;
                    break;
            }
        }
    }

    return temp;

}

function findAdjacentChars(chars, w, h, x, y, buffer) {
    return [
        ((x > 0 && y > 0) ? chars[(y - 1) * w + (x - 1) + (w * h * buffer)] : -1),
        ((x > 0) ? chars[y * w + (x - 1) + (w * h * buffer)] : -1),
        ((x > 0 && y < h) ? chars[(y + 1) * w + (x - 1) + (w * h * buffer)] : -1),
        ((y < h) ? chars[(y + 1) * w + x + (w * h * buffer)] : -1),
        ((x < w && y < h) ? chars[(y + 1) * w + (x + 1) + (w * h * buffer)] : -1),
        ((x < w) ? chars[y * w + (x + 1) + (w * h * buffer)] : -1),
        ((x < w && y > 0) ? chars[(y - 1) * w + (x + 1) + (w * h * buffer)] : -1),
        ((y > 0) ? chars[(y - 1) * w + x + (w * h * buffer)] : -1)
    ];
}

function playerShader(chars) {
    const temp = new Int32Array(chars);

    for (let i = this.width * this.height; i-- > 0;) {
        temp[i] = temp[i + this.width * this.height * 1] | temp[i + this.width * this.height * 2] |
            temp[i + this.width * this.height * 3];
        if (temp[i] !== 0) {
            switch (temp[i] & 0XF000000) {
                case 0X1000000:
                    temp[i] &= 0XFFFFFF;
                    temp[i] |= 0X2F000000;
                    break;
                case 0X2000000:
                    temp[i] &= 0XFFFFFF;
                    temp[i] |= 0X5C000000;
                    break;
                case 0X3000000:
                    temp[i] &= 0XFFFFFF;
                    temp[i] |= 0X58000000;
                    break;
            }
        }
    }

    return temp;
}

function mergeColorsShader(chars) {
    const temp = new Int32Array(chars);
    for (let i = this.width * this.height; i-- > 0;) {
        temp[i] = temp[i + this.width * this.height * 1] | temp[i + this.width * this.height * 2] |
            temp[i + this.width * this.height * 3];
    }
    return temp;
}