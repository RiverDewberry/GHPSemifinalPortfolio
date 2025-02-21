let inputingText = false;
let inputingSpawn = 0;
let inputingAreaData = {x: 0, y: 0, w: 0, h: 0};
let editColor = 0;
let highlightObj = false;

window.addEventListener('keydown', (e) => 
    {
        if(inputingText)return;
        if(e.key === "w")displayArea.pos.y--;
        if(e.key === "s")displayArea.pos.y++;
        if(e.key === "a")displayArea.pos.x--;
        if(e.key === "d")displayArea.pos.x++;
        if(e.key === "r")highlight ^= 1;
        if(e.key === "g")highlight ^= 2;
        if(e.key === "b")highlight ^= 4;
        Level.drawLevel();
        draw();
    }
);

let mousePos = {x:0, y:0};

document.getElementById("display").addEventListener("mousemove", (e) => 
    {
        Level.drawLevel();

        mousePos.x = Math.floor(e.offsetX / 6);
        mousePos.y = Math.floor(e.offsetY / 9);

        if(mousePos.x === displayArea.dim.w)return;
        if(mousePos.y === displayArea.dim.h)return;
        if(mousePos.x === -1)return;
        if(mousePos.y === -1)return;

        charArray[
            mousePos.x + (mousePos.y * displayArea.dim.w)
        ] = 64;

        charArray[
            (displayArea.dim.w * displayArea.dim.h) +
            mousePos.x + (mousePos.y * displayArea.dim.w)
        ] = 64;

        charArray[
            (displayArea.dim.w * displayArea.dim.h * 2) + 
            mousePos.x + (mousePos.y * displayArea.dim.w)
        ] = 64;

        draw();
    }
);

document.getElementById("display").addEventListener("click", (e) => 
    {
        if(inputingSpawn !== 0)makeSpawn();
        if(inputingAreaData.x === 1)
        {
            inputingAreaData.x = 0;
            setValue(0, {value: mousePos.x + displayArea.pos.x});
        }
        if(inputingAreaData.y === 1)
        {
            inputingAreaData.y = 0;
            setValue(1, {value: mousePos.y + displayArea.pos.y});
        }
        if(inputingAreaData.w === 1)
        {
            inputingAreaData.w = 0;
            setValue(2, {value: mousePos.x + displayArea.pos.x - 
                currentTypeArray[objIndex][0] + 1
            });
        }
        if(inputingAreaData.h === 1)
        {
            inputingAreaData.h = 0;
            setValue(3, {value: mousePos.y + displayArea.pos.x - 
                currentTypeArray[objIndex][1] + 1
            });
        }
        objSelect(document.getElementById("obj select"));
    }
);

function objSelect(e)
{
    if(currentTypeArray === false)return;
    if(e.value < 0)e.value = 0;
    if(e.value >= currentTypeArray.length)e.value = currentTypeArray.length - 1;
    if(currentTypeArray.length === 0)return;
    objIndex = Number(e.value);
    document.getElementById("X val").value = currentTypeArray[objIndex][0];
    document.getElementById("Y val").value = currentTypeArray[objIndex][1];
    document.getElementById("width").value = currentTypeArray[objIndex][2];
    document.getElementById("height").value = currentTypeArray[objIndex][3];
    document.getElementById("color").value = currentTypeArray[objIndex][4];
    editColor = currentTypeArray[objIndex][4];
    Level.drawLevel();
    draw();
}

function setValue(val, e)
{

    if((e.value < 1) && (val > 1) && (val !== 4))e.value = 1;
    if((val === 4) && (e.value < 0))e.value = 0;
    if((val === 4) && (e.value > 2))e.value = 2;
    currentTypeArray[objIndex][val] = Number(e.value);
    editColor = currentTypeArray[objIndex][4];
    addObjects(currentType);
    Level.drawLevel();
    draw();
}