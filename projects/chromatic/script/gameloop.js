function gameLoop()
{
    movePlayer(1);
    if(keysDown.includes("a") || keysDown.includes("ArrowLeft"))movePlayer(2);
    if(keysDown.includes("d") || keysDown.includes("ArrowRight"))movePlayer(3);
    if(keysDown.includes("w") || keysDown.includes("ArrowUp"))movePlayer(0);
    else
    {
        for(let i = 0; i < 3; i++)
        {
            if(currentLevel.extraPlayerData[i].jumping > 0)
                currentLevel.extraPlayerData[i].jumping *= -1;
        }
    }

    if(keysDown.includes("k"))killPlayer();

    if(keysDown.includes("r"))highlight |= 1;
    else highlight &= 6;
    if(keysDown.includes("g"))highlight |= 2;
    else highlight &= 5;
    if(keysDown.includes("b"))highlight |= 4;
    else highlight &= 3;


    targetX = Math.round(
        (
            (
                currentLevel.player[0].area.pos.x + 
                currentLevel.player[1].area.pos.x + 
                currentLevel.player[2].area.pos.x
            ) * 0.333
        ) - ((displayArea.dim.w - 4) * 0.5)
    );

    targetY = Math.round(
        (
            (
                currentLevel.player[0].area.pos.y + 
                currentLevel.player[1].area.pos.y + 
                currentLevel.player[2].area.pos.y
            ) * 0.333
        ) - ((displayArea.dim.h - 8) * 0.5)
    );

    if(targetX > displayArea.pos.x + 5)displayArea.pos.x++;
    if(targetX < displayArea.pos.x - 5)displayArea.pos.x--;
    if(targetY > displayArea.pos.y + 5)displayArea.pos.y++;
    if(targetY < displayArea.pos.y - 5)displayArea.pos.y--;
    if(targetX > displayArea.pos.x + 25)displayArea.pos.x = 
        Math.round((targetX + displayArea.pos.x * 7) * 0.125);
    if(targetX < displayArea.pos.x - 25)displayArea.pos.x =
        Math.round((targetX + displayArea.pos.x * 7) * 0.125);
    if(targetY > displayArea.pos.y + 25)displayArea.pos.y =
        Math.round((targetY + displayArea.pos.y * 7) * 0.125);
    if(targetY < displayArea.pos.y - 25)displayArea.pos.y =
        Math.round((targetY + displayArea.pos.y * 7) * 0.125);

    Level.drawLevel();

    if(winCheck())
    {
        levelIndex++;
        if(levelIndex < levelData.length)Level.loadLevel(levels[levelIndex]);
        else {
            levelIndex = 0;
            displayArea.pos.x = 0;
            displayArea.pos.y = 0;
            killPlayer();
	    Level.loadLevel(levels[levelIndex]);
            Level.drawLevel();
            for(let i = 0; i < charArray.length; i++)
            {
                charArray[i] = previousChars[i];
            } 
            drawStartCard();
            draw();
            start = true;
            clearInterval(interval);
	};
        keysDown = [];
        console.log(levelIndex);
    }

    for(let i = 0; i < 3; i++)
    {
        if(currentLevel.lowestY < currentLevel.player[i].area.pos.y)killPlayer(); 
    }

    return;
}
