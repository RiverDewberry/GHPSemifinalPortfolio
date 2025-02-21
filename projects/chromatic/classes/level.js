let currentLevel;
class Level
{
    static loadLevel(level)
    {
        currentLevel = level;
    }//sets a level as the current one

    static drawLevel()//draws the level
    {
        for(let i = 0; i < currentLevel.solidPlatforms.length; i++)
        {
            LevelObject.addChars(currentLevel.solidPlatforms[i]);
        }
        for(let i = 0; i < currentLevel.semiPlatforms.length; i++)
        {
            LevelObject.addChars(currentLevel.semiPlatforms[i]);
        }
        for(let i = 0; i < currentLevel.ladders.length; i++)
        {
            LevelObject.addChars(currentLevel.ladders[i]);
        }
        for(let i = 0; i < currentLevel.spikes.length; i++)
        {
            LevelObject.addChars(currentLevel.spikes[i]);
        }
        for(let i = 0; i < currentLevel.portals.length; i++)
        {
            LevelObject.addChars(currentLevel.portals[i]);
        }
        for(let i = 0; i < currentLevel.spawn.length; i++)
        {
            LevelObject.addChars(currentLevel.spawn[i]);
        }
        for(let i = 0; i < currentLevel.goal.length; i++)
        {
            LevelObject.addChars(currentLevel.goal[i]);
        }
        for(let i = 0; i < currentLevel.player.length; i++)
        {
            LevelObject.addChars(currentLevel.player[i]);
        }

        for(let i = 0; i < currentLevel.levelInfo.length; i++)
        {
            charArray[i + (displayArea.dim.w * 65)] = currentLevel.levelInfo[i];
            charArray[i + (displayArea.dim.w * 134)] = currentLevel.levelInfo[i];
            charArray[i + (displayArea.dim.w * 203)] = currentLevel.levelInfo[i];
        }

        if(!editor)draw();
    }

    constructor(levelData)//uses a level data array to make a level with that data
    {
        levelData = JSON.parse(atob(levelData));

        this.solidPlatforms = [];
        this.semiPlatforms = [];
        this.ladders = [];
        this.spikes = [];
        this.portals = [];
        this.spawn = [];
        this.goal = [];
        this.player = [];
        this.extraPlayerData = [];
        this.levelInfo = new Int8Array(displayArea.dim.w * 4);
        this.lowestY = 0;

        for(let i = 0; i < displayArea.dim.w; i++)
        {
            this.levelInfo[i] = 95;
        }

        for(let i = 0; i < levelData[8].length; i++)
        {
            this.levelInfo[displayArea.dim.w + i] = levelData[8].charCodeAt(i);
        }

        for(let i = 0; i < 3; i++)
        {
            this.extraPlayerData.push(
                {
                    portal: -1,
                    onGround: 0,//the player is not on the ground if this is less than 1
                    jumping: -1//above -1 the player can jump. above 0 the player is jumping
                }
            );
        }

        for(let i = 0; i < 8; i++)
        {
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

                if(levelData[i][j][3] + levelData[i][j][1] > this.lowestY)
                    this.lowestY = levelData[i][j][3] + levelData[i][j][1];

                switch(i)
                {
                    case LevelObject.SPIKES:
                        this.spikes.push(newObj);
                        break;
                    case LevelObject.SOLID_PLATFORM:
                        this.solidPlatforms.push(newObj);
                        break;
                    case LevelObject.SEMI_PLATFORM:
                        this.semiPlatforms.push(newObj);
                        break;
                    case LevelObject.GOAL:
                        this.goal.push(newObj);
                        break;
                    case LevelObject.LADDER:
                        this.ladders.push(newObj);
                        break;
                    case LevelObject.PLAYER:
                        this.player.push(newObj);
                        break;
                    case LevelObject.PORTAL:
                        this.portals.push(newObj);
                        break;
                    case LevelObject.SPAWN:
                        this.spawn.push(newObj);
                        break;
                    default:
                        break;
                }
            }
        }

        for(let i = 0; i < 3; i++)
        {
            this.player[i].area.pos.x = this.spawn[i].area.pos.x;
            this.player[i].area.pos.y = this.spawn[i].area.pos.y;
        }
    }
}