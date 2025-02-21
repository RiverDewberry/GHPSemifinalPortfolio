let currentTypeArray = false;
let currentType;
let objIndex = 0;

function makeLevelText()
{
    levelData[8] = document.getElementById("levelText").value;
    currentLevel.levelInfo = new Int8Array(displayArea.dim.w * 4);

    for(let i = 0; i < displayArea.dim.w; i++)
    {
        currentLevel.levelInfo[i] = 95;
    }

    for(let i = 0; i < levelData[8].length; i++)
    {
        currentLevel.levelInfo[displayArea.dim.w + i] = levelData[8].charCodeAt(i);
    }

    Level.drawLevel();
    draw();
}

function makeSpawn()
{
    if((inputingSpawn & 1) === 1)levelData[2][0] = [
        mousePos.x + displayArea.pos.x,
        mousePos.y + displayArea.pos.y,
        4, 4, 0];
    if((inputingSpawn & 2) === 2)levelData[2][1] = [
        mousePos.x + displayArea.pos.x,
        mousePos.y + displayArea.pos.y,
        4, 4, 1];
    if((inputingSpawn & 4) === 4)levelData[2][2] = [
        mousePos.x + displayArea.pos.x,
        mousePos.y + displayArea.pos.y,
        4, 4, 2];
    inputingSpawn = 0;

    addObjects(LevelObject.SPAWN);

    for(let i = 0; i < 3; i++)
    {
        currentLevel.player[i].area.pos.x = currentLevel.spawn[i].area.pos.x;
        currentLevel.player[i].area.pos.y = currentLevel.spawn[i].area.pos.y;
    }

    Level.drawLevel();
    draw();
}

function addObjects(i)
{
    switch(i)
    {
        case LevelObject.SPIKES:
            currentLevel.spikes = [];
            break;
        case LevelObject.SOLID_PLATFORM:
            currentLevel.solidPlatforms = [];
            break;
        case LevelObject.SEMI_PLATFORM:
            currentLevel.semiPlatforms = [];
            break;
            case LevelObject.GOAL:
            currentLevel.goal = [];
            break;
        case LevelObject.LADDER:
            currentLevel.ladders = [];
            break;
        case LevelObject.PLAYER:
            currentLevel.player = [];
            break;
        case LevelObject.PORTAL:
            currentLevel.portals = [];
            break;
        case LevelObject.SPAWN:
            currentLevel.spawn = [];
            break;
        default:
            break;
    }

    for(let j = 0; j < levelData[i].length; j++)
    {
        const newObj = new LevelObject
        (
            levelData[i][j][0],
            levelData[i][j][1],
            levelData[i][j][2],
            levelData[i][j][3],
            levelData[i][j][4],
            i
        );

        switch(i)
        {
            case LevelObject.SPIKES:
                currentLevel.spikes.push(newObj);
                break;
            case LevelObject.SOLID_PLATFORM:
                currentLevel.solidPlatforms.push(newObj);
                break;
            case LevelObject.SEMI_PLATFORM:
                currentLevel.semiPlatforms.push(newObj);
                break;
            case LevelObject.GOAL:
                currentLevel.goal.push(newObj);
                break;
            case LevelObject.LADDER:
                currentLevel.ladders.push(newObj);
                break;
            case LevelObject.PLAYER:
                currentLevel.player.push(newObj);
                break;
            case LevelObject.PORTAL:
                currentLevel.portals.push(newObj);
                break;
            case LevelObject.SPAWN:
                currentLevel.spawn.push(newObj);
                break;
            default:
                break;
        }
    }
}

function testLevel()
{
    localStorage.setItem("test", btoa(JSON.stringify(levelData)));
    document.getElementById("test").click();
}

function changeType(i)
{
    switch(i)
    {
        case "spikes":
            currentType = LevelObject.SPIKES;
            currentTypeArray = levelData[LevelObject.SPIKES];
            break;
        case "solid":
            currentType = LevelObject.SOLID_PLATFORM;
            currentTypeArray = levelData[LevelObject.SOLID_PLATFORM];
            break;
        case "semi":
            currentType = LevelObject.SEMI_PLATFORM;
            currentTypeArray = levelData[LevelObject.SEMI_PLATFORM];
            break;
        case "portal":
            currentType = LevelObject.PORTAL;
            currentTypeArray = levelData[LevelObject.PORTAL];
            break;
        case "ladder":
            currentType = LevelObject.LADDER;
            currentTypeArray = levelData[LevelObject.LADDER];
            break;
        case "goal":
            currentType = LevelObject.GOAL;
            currentTypeArray = levelData[LevelObject.GOAL];
            break;
        default:
            break;
    }
    highlightObj = currentTypeArray.length > 0;
    objSelect(document.getElementById("obj select"));
}

function currentTypeAddObj()
{
    currentTypeArray.push([0, 0, 1, 1, 0]);
    addObjects(currentType);
    objSelect(document.getElementById("obj select"));
    highlightObj = currentTypeArray.length > 0;
    Level.drawLevel();
    draw();
}

function currentTypeRemoveObj()
{
    currentTypeArray.splice(document.getElementById("obj select").value, 1);
    addObjects(currentType);
    objSelect(document.getElementById("obj select"));
    highlightObj = currentTypeArray.length > 0;
    Level.drawLevel();
    draw();
}

function currentTypeInsertObj()
{
    currentTypeArray.splice(document.getElementById("obj select").value, 0, [0, 0, 1, 1, 0]);
    addObjects(currentType);
    objSelect(document.getElementById("obj select"));
    highlightObj = currentTypeArray.length > 0;
    Level.drawLevel();
    draw();
}

function currentTypeCopyObj()
{
    currentTypeArray.splice(document.getElementById("obj select").value, 0,
        JSON.parse(JSON.stringify(currentTypeArray[objIndex]))
    );
    addObjects(currentType);
    objSelect(document.getElementById("obj select"));
    highlightObj = currentTypeArray.length > 0;
    Level.drawLevel();
    draw();
}

objSelect(document.getElementById("obj select"));
highlightObj = currentTypeArray.length > 0;