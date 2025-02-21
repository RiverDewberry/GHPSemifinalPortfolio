//this is mostly just the same as scripts
const displayArea = new Area(0, 0, 200, 69);//the area of the display measured in characters
const charSize = 8;
const canvas = document.getElementById("display");
//declares constants

canvas.width = (charSize * 10 / 16) * displayArea.dim.w + displayArea.dim.w;
canvas.height = charSize * displayArea.dim.h + displayArea.dim.h;
//sets height and width

const ctx = canvas.getContext("2d");
const imgData = ctx.createImageData(canvas.width, canvas.height);
//creates context and gets imageData from it

for (let i = 0; i < imgData.data.length; i += 4)
{
    imgData.data[i + 3] = 255;
}//sets all alpha values in imgData to 255

const charArray = new Int8Array(displayArea.dim.w * displayArea.dim.h * 3);
const previousChars = new Int8Array(displayArea.dim.w * displayArea.dim.h * 3);
//stores characters

const editor = true;

let levelData = 
[
    [[0, 0, 4, 4, 0], [0, 0, 4, 4, 1], [0, 0, 4, 4, 2]],
    [],
    [[0, 0, 4, 4, 0], [0, 0, 4, 4, 1], [0, 0, 4, 4, 2]],
    [],
    [],
    [],
    [],
    [],
    ""
];

Level.loadLevel(new Level(btoa(JSON.stringify(levelData))));
Level.drawLevel();
draw();