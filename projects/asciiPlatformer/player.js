const playerLayer = display.addDisplayLayer("playerLayer", 3);
const player = [
    playerLayer.addAsciiObject(0, 0, 2, 2, "playerR",
        [0X1FF0000, 0X2FF0000, 0X2FF0000, 0X1FF0000], 1),
    playerLayer.addAsciiObject(0, 0, 2, 2, "playerG",
        [0X100FF00, 0X200FF00, 0X200FF00, 0X100FF00], 2),
    playerLayer.addAsciiObject(0, 0, 2, 2, "playerB",
        [0X10000FF, 0X20000FF, 0X20000FF, 0X10000FF], 3),
];
playerLayer.shader = playerShader;
const jumpTime = [0, 0, 0];
const canJump = [true, true, true];
//creates the player

function movePlayerUp(color) {
    if (!collidesWithPlatforms(player[color].x, player[color].y - 1,
        player[color].width, player[color].height,
        platforms[color])) {
        --player[color].y;
        return true;
    }
    else return false;
}

function movePlayerDown(color) {
    if (!collidesWithPlatforms(player[color].x, player[color].y + 1,
        player[color].width, player[color].height,
        platforms[color]))
        ++player[color].y;
}

function movePlayerRight() {
    for (let i = 3; i-- > 0;) {
        if (!collidesWithPlatforms(player[i].x + 1, player[i].y, player[i].width, player[i].height,
            platforms[i]))
            ++player[i].x;
    }
}

function movePlayerLeft() {
    for (let i = 3; i-- > 0;) {
        if (!collidesWithPlatforms(player[i].x - 1, player[i].y, player[i].width, player[i].height,
            platforms[i]))
            --player[i].x;
    }
}

function chechSpikes(spawn) {
    if (
        collidesWithPlatforms(
            player[0].x, player[0].y, player[0].width, player[0].height, spikes[0]) || 
        collidesWithPlatforms(
            player[1].x, player[1].y, player[1].width, player[1].height, spikes[1]) || 
        collidesWithPlatforms(
            player[2].x, player[2].y, player[2].width, player[2].height, spikes[2]) ||
        player[0].x === maxCameraX || player[0].y === maxCameraY || 
        player[1].x === maxCameraX || player[1].y === maxCameraY || 
        player[2].x === maxCameraX || player[2].y === maxCameraY ||
        player[0].x === -2 || player[0].y === -2 || player[1].x === -2 ||
        player[1].y === -2 || player[2].x === -2 || player[2].y === -2
    ){
        for(let i = 3; i-- > 0;){
            player[i].x = spawn.x;
            player[i].y = spawn.y;
            jumpTime[i] = 0;
            canJump[i] = true;
        }
    }
}

function movePlayerJump(jumpInput) {
    for (let i = 3; i-- > 0;) {
       if (jumpInput && (jumpTime[i] === 0) &&
            collidesWithPlatforms(player[i].x, player[i].y + 1, player[i].width, player[i].height,
                platforms[i])
            && canJump[i]
        ) {
            jumpTime[i] = 5;
            canJump[i] = false;
        };

        if (!jumpInput) {
            if (!canJump[i] &&
                !collidesWithPlatforms(player[i].x, player[i].y + 1, player[i].width, 
                    player[i].height, platforms[i])
                && (jumpTime[i] > 0)
            )
                jumpTime[i] -= 5;
            else if (jumpTime[i] > 0) jumpTime[i] = 0;
            canJump[i] = true;
        };
 
        if (jumpTime[i] > 0) {
            --jumpTime[i]
            if (!movePlayerUp(i)) jumpTime[i] -= 5;
            if (jumpTime[i] === 0) jumpTime[i] = -5;
        } else if (0 > jumpTime[i]) {
            ++jumpTime[i];
        }
        else movePlayerDown(i);
    }
}