function movePlayer(direction)
{
    for(let i = 0; i < 3; i++)
    {
        const currentPlayer = currentLevel.player[i];
        
        let oldX = currentPlayer.area.pos.x;
        let oldY = currentPlayer.area.pos.y;

        let nonSolidGround = false;

        switch(direction)
        {
            case 0://up

                if((collidesWithPlayer(currentPlayer, currentLevel.ladders) !== -1))
                {
                    currentPlayer.area.pos.y--;
                    break;
                }

                if(currentLevel.extraPlayerData[i].jumping === 10)
                    currentLevel.extraPlayerData[i].jumping = -10;
                //stops the player from jumping too high

                if(
                    ((currentLevel.extraPlayerData[i].jumping < 1) &&
                    (currentLevel.extraPlayerData[i].onGround < 1)) || 
                    (currentLevel.extraPlayerData[i].jumping < 0)
                )break;//cases where the player can't jump

                currentLevel.extraPlayerData[i].jumping++;//marks the player as jumping

                currentPlayer.area.pos.y--;
                currentLevel.extraPlayerData[i].onGround = 0;
                break;
            case 1://down

                currentPlayer.area.dim.h = 5;
                if(
                    (collidesWithPlayer(currentPlayer, currentLevel.ladders) !== -1) &&
                    (!(keysDown.includes("s") || keysDown.includes("ArrowDown")))
                )
                {
                    nonSolidGround = true;
                    currentPlayer.area.dim.h = 4;
                    currentLevel.extraPlayerData[i].onGround = 3;
                    currentLevel.extraPlayerData[i].jumping = 0;
                    break;
                }
                currentPlayer.area.dim.h = 1;
                currentPlayer.area.pos.y += 4;
                if(
                    (collidesWithPlayer(currentPlayer, currentLevel.semiPlatforms) !== -1) &&
                    (!(keysDown.includes("s") || keysDown.includes("ArrowDown")))
                )
                {
                    nonSolidGround = true;
                    currentPlayer.area.dim.h = 4;
                    currentPlayer.area.pos.y -= 4;
                    currentLevel.extraPlayerData[i].onGround = 3;
                    currentLevel.extraPlayerData[i].jumping = 0;
                    break;
                }
                currentPlayer.area.dim.h = 4;
                currentPlayer.area.pos.y -= 4;

                if(
                    (currentLevel.extraPlayerData[i].jumping !== -1) &&
                    (currentLevel.extraPlayerData[i].jumping !== 0)
                )//cases where the player shouldn't fall
                {
                    if(currentLevel.extraPlayerData[i].jumping < -1)
                        currentLevel.extraPlayerData[i].jumping++;
                    break;
                }
                currentPlayer.area.pos.y++;
                break;
            case 2://left
                currentPlayer.area.pos.x--;
                break;
            case 3://right
                currentPlayer.area.pos.x++;
                break;
            default:
                break;
        }

        if(collidesWithPlayer(currentPlayer, currentLevel.solidPlatforms) !== -1)//stops collisions
        {
            currentPlayer.area.pos.x = oldX;
            currentPlayer.area.pos.y = oldY;
            if(direction === 1)
            {
                currentLevel.extraPlayerData[i].onGround = 3;
                currentLevel.extraPlayerData[i].jumping = 0;
            }
            if(direction === 0)currentLevel.extraPlayerData[i].jumping *= -1;
        } else if(
            (direction === 1) && (currentLevel.extraPlayerData[i].onGround > 0) && !nonSolidGround
        )
        {
            currentLevel.extraPlayerData[i].onGround--;
            currentPlayer.area.pos.y--;
        }

        if(currentLevel.extraPlayerData[i].portal === -1)
        {
            let currentPortal = collidesWithPlayer(currentPlayer, currentLevel.portals);

            if(currentPortal !== -1)
                {
                    currentLevel.extraPlayerData[i].portal = currentPortal;

                    currentPlayer.area.pos.x += 
                        currentLevel.portals[currentPortal ^ 1].area.pos.x - 
                        currentLevel.portals[currentPortal].area.pos.x;

                    currentPlayer.area.pos.y += 
                        currentLevel.portals[currentPortal ^ 1].area.pos.y - 
                        currentLevel.portals[currentPortal].area.pos.y;
                };
        } else if(collidesWithPlayer(currentPlayer, currentLevel.portals) === -1)
        {
            currentLevel.extraPlayerData[i].portal = -1;
        }//moves players through portals

        if(collidesWithPlayer(currentPlayer, currentLevel.spikes) !== -1)
        {
            killPlayer();
            return;
        }//makes spikes kill
    }
}//moves the player

function collidesWithPlayer(player, levelObjectArray)
{
    for(let i = 0; i < levelObjectArray.length; i++)
    {
        if(
            (levelObjectArray[i].color === player.color) && 
            Area.collisionCheck(player.area, levelObjectArray[i].area))
        {
            return i;
        }
    }

    return -1;
}

function killPlayer()
{
    for(let i = 0; i < 3; i++)
    {
        currentLevel.player[i].area.pos.x = currentLevel.spawn[i].area.pos.x;
        currentLevel.player[i].area.pos.y = currentLevel.spawn[i].area.pos.y;
        currentLevel.extraPlayerData[i].portal = -1;
        currentLevel.extraPlayerData[i].onGround = 0;
        currentLevel.extraPlayerData[i].jumping = -1;
    }
}

function winCheck()
{
    for(let i = 0; i < 3; i++)
    {
        if(collidesWithPlayer(currentLevel.player[i], currentLevel.goal) === -1)return false;
    }
    return true;
}