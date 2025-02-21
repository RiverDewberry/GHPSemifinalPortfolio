new Level(
    { x: 0, y: 0 },
    [], [],
    [{ x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }]
);

const editorPosition = { x: 0, y: 0 };
const selectedColors = { colors: 0, input: 0 };
const editorInput = { platform: false, spike: false, position: { x: 0, y: 0 } };
let editMode = true;

levels[0].load = function () {
    if (this.loaded) return;
    this.loaded = true;

    this.editLayer = display.addDisplayLayer("editLayer", 0);
    this.cursor = this.editLayer.addAsciiObject(0, 0, 1, 1, "cursor",
        [0X4F444444], 0);

    this.cursor.shader = function () {
        return [0X4F444444 +
            (((selectedColors.colors & 4) === 4) ? 0XBB0000 : 0) +
            (((selectedColors.colors & 2) === 2) ? 0XBB00 : 0) +
            (((selectedColors.colors & 1) === 1) ? 0XBB : 0)];
    }

    for (let i = this.platforms.length; i-- > 0;) {
        addPlatform(
            this.platforms[i][0],
            this.platforms[i][1],
            this.platforms[i][2],
            this.platforms[i][3],
            this.platforms[i][4],
        );
    }

    for (let i = this.spikes.length; i-- > 0;) {
        addSpike(
            this.spikes[i][0],
            this.spikes[i][1],
            this.spikes[i][2],
            this.spikes[i][3],
            this.spikes[i][4]
        );
    }

    for (let i = 3; i-- > 0;) {
        goal[i].x = this.goal[i].x;
        goal[i].y = this.goal[i].y;
        player[i].x = this.spawn.x;
        player[i].y = this.spawn.y;
    }

    playerLayer.display = true;
    platformLayer.display = true;
    spikeLayer.display = true;

    level = this;//holy shit this is cursed
    this.interval = setInterval(this.levelBehavior, 50);
}

levels[0].unload = function () {
    if (!this.loaded) return;
    this.loaded = false;

    display.removeDisplayLayer("editLayer");

    for(let i = 3; i-- > 0;){
        platforms[i] = [];
        spikes[i] = [];
    }

    platformLayer.removeAsciiObject("platform");
    spikeLayer.removeAsciiObject("spike");
    playerLayer.display = false;
    platformLayer.display = false;
    spikeLayer.display = false;
    display.drawChars();
    clearInterval(this.interval);
}

levels[0].levelBehavior = () => {

    if (editMode) {

        if (keysDown.includes("t")) {
            editMode = false;
            level.editLayer.display = false;
        }

        if (keysDown.includes("w")) --editorPosition.y;
        if (keysDown.includes("a")) --editorPosition.x;
        if (keysDown.includes("s")) ++editorPosition.y;
        if (keysDown.includes("d")) ++editorPosition.x;
        level.cursor.x = editorPosition.x;
        level.cursor.y = editorPosition.y;

        if (keysDown.includes("r") && (selectedColors.input & 4) === 0) {
            selectedColors.input |= 4;
            selectedColors.colors ^= 4;
        } else if (!keysDown.includes("r")) selectedColors.input &= 3;

        if (keysDown.includes("g") && (selectedColors.input & 2) === 0) {
            selectedColors.input |= 2;
            selectedColors.colors ^= 2;
        } else if (!keysDown.includes("g")) selectedColors.input &= 5;

        if (keysDown.includes("b") && (selectedColors.input & 1) === 0) {
            selectedColors.input |= 1;
            selectedColors.colors ^= 1;
        } else if (!keysDown.includes("b")) selectedColors.input &= 6;

        if (keysDown.includes("ArrowLeft")) {
            level.spawn.x = editorPosition.x;
            level.spawn.y = editorPosition.y;
            player[0].x = editorPosition.x;
            player[0].y = editorPosition.y;
            player[1].x = editorPosition.x;
            player[1].y = editorPosition.y;
            player[2].x = editorPosition.x;
            player[2].y = editorPosition.y;
        }

        if (keysDown.includes("ArrowRight")) {
            if ((selectedColors.colors & 4) === 4) {
                goal[0].x = editorPosition.x;
                goal[0].y = editorPosition.y;
                level.goal[0].x = editorPosition.x;
                level.goal[0].y = editorPosition.y;
            }
            if ((selectedColors.colors & 2) === 2) {
                goal[1].x = editorPosition.x;
                goal[1].y = editorPosition.y;
                level.goal[1].x = editorPosition.x;
                level.goal[1].y = editorPosition.y;
            }
            if ((selectedColors.colors & 1) === 1) {
                goal[2].x = editorPosition.x;
                goal[2].y = editorPosition.y;
                level.goal[2].x = editorPosition.x;
                level.goal[2].y = editorPosition.y;
            }
        }

        if (keysDown.includes("ArrowUp") && selectedColors.colors > 0) {
            if (!editorInput.platform) {
                editorInput.platform = true;
                level.platforms.push(
                    [editorPosition.x, editorPosition.y,
                        1, 1, selectedColors.colors
                    ]
                );
                editorInput.position.x = editorPosition.x;
                editorInput.position.y = editorPosition.y;
            }
            else {
                if (editorInput.position.x > editorPosition.x)
                    editorPosition.x = editorInput.position.x;
                level.platforms[level.platforms.length - 1][2] =
                    editorPosition.x - level.platforms[level.platforms.length - 1][0] + 1;

                if (editorInput.position.y > editorPosition.y)
                    editorPosition.y = editorInput.position.y;
                level.platforms[level.platforms.length - 1][3] =
                    editorPosition.y - level.platforms[level.platforms.length - 1][1] + 1;
            }
            makeLevelObjects(level.platforms, level.spikes);
        } else editorInput.platform = false;

        if (keysDown.includes("ArrowDown") && selectedColors.colors > 0) {
            if (!editorInput.spike) {
                editorInput.spike = true;
                level.spikes.push(
                    [editorPosition.x, editorPosition.y,
                        1, 1, selectedColors.colors
                    ]
                );
                editorInput.position.x = editorPosition.x;
                editorInput.position.y = editorPosition.y;
            }
            else {
                if (editorInput.position.x > editorPosition.x)
                    editorPosition.x = editorInput.position.x;
                level.spikes[level.spikes.length - 1][2] =
                    editorPosition.x - level.spikes[level.spikes.length - 1][0] + 1;

                if (editorInput.position.y > editorPosition.y)
                    editorPosition.y = editorInput.position.y;
                level.spikes[level.spikes.length - 1][3] =
                    editorPosition.y - level.spikes[level.spikes.length - 1][1] + 1;
            }
            makeLevelObjects(level.platforms, level.spikes);
        } else editorInput.spike = false;
        
        if(keysDown.includes("Backspace")){
            for(let i = level.platforms.length; i-- > 0;){
                if (
                    (level.platforms[i][0] + level.platforms[i][2] > editorPosition.x) &&
                    (editorPosition.x + 1 > level.platforms[i][0]) && 
                    (editorPosition.y + 1 > level.platforms[i][1]) &&
                    (level.platforms[i][1] + level.platforms[i][3] > editorPosition.y)
                ) level.platforms.splice(i, 1);
            }

            for(let i = level.spikes.length; i-- > 0;){
                if (
                    (level.spikes[i][0] + level.spikes[i][2] > editorPosition.x) &&
                    (editorPosition.x + 1 > level.spikes[i][0]) && 
                    (editorPosition.y + 1 > level.spikes[i][1]) &&
                    (level.spikes[i][1] + level.spikes[i][3] > editorPosition.y)
                ) level.spikes.splice(i, 1);
            }

            makeLevelObjects(level.platforms, level.spikes);
        }

        //calculates the camera position
        display.camera.x = Math.round(editorPosition.x + 1 - (display.width * 0.5));
        display.camera.y = Math.round(editorPosition.y + 1 - (display.height * 0.5));
        display.camera.y = (display.camera.y > maxCameraY - display.height) ?
            maxCameraY - display.height : display.camera.y;
        display.camera.y = (display.camera.y < 0) ? 0 : display.camera.y;
        display.camera.x = (display.camera.x > maxCameraX - display.width) ?
            maxCameraX - display.width : display.camera.x;
        display.camera.x = (display.camera.x < 0) ? 0 : display.camera.x;
        //------------------------------

        display.drawChars();
    } else {

        movePlayerJump(keysDown.includes("w"));
        if (keysDown.includes("d")) movePlayerRight();
        if (keysDown.includes("a")) movePlayerLeft();
        chechSpikes(level.spawn);

        if (keysDown.includes("e")) {
            for (let i = 3; i-- > 0;) {
                player[i].x = level.spawn.x;
                player[i].y = level.spawn.y;
            }
            editMode = true;
            level.editLayer.display = true;
        }

        if (keysDown.includes("r")) {
            for (let i = 3; i-- > 0;) {
                player[i].x = level.spawn.x;
                player[i].y = level.spawn.y;
            }
        }

        if (
            level.goal[0].x === player[0].x &&
            level.goal[0].y === player[0].y &&
            level.goal[1].x === player[1].x &&
            level.goal[1].y === player[1].y &&
            level.goal[2].x === player[2].x &&
            level.goal[2].y === player[2].y
        ) {
            for (let i = 3; i-- > 0;) {
                player[i].x = level.spawn.x;
                player[i].y = level.spawn.y;
            }
            editMode = true;
            level.editLayer.display = true;

            navigator.clipboard.writeText(
                `new Level(
                {x: ${level.spawn.x}, y: ${level.spawn.y}},
                ${JSON.stringify(level.platforms)},${JSON.stringify(level.spikes)},
                [{x: ${level.goal[0].x}, y: ${level.goal[0].y}},
                {x: ${level.goal[1].x}, y: ${level.goal[1].y}},
                {x: ${level.goal[2].x}, y: ${level.goal[2].y}}]
                );`
            )
        }

        //calculates the camera position
        display.camera.x = Math.round((player[0].x + player[1].x + player[2].x) *
            0.3333333333333333 +
            ((player[0].width + player[1].width + player[2].width) * 0.16666666666666666) -
            (display.width * 0.5));
        display.camera.y = Math.round((player[0].y + player[1].y + player[2].y) *
            0.3333333333333333 +
            ((player[0].height + player[1].height + player[2].height) * 0.16666666666666666) -
            (display.height * 0.5));
        display.camera.y = (display.camera.y > maxCameraY - display.height) ?
            maxCameraY - display.height : display.camera.y;
        display.camera.y = (display.camera.y < 0) ? 0 : display.camera.y;
        display.camera.x = (display.camera.x > maxCameraX - display.width) ?
            maxCameraX - display.width : display.camera.x;
        display.camera.x = (display.camera.x < 0) ? 0 : display.camera.x;
        //------------------------------

        display.drawChars();
    }
}

function makeLevelObjects(levelPlatforms, levelSpikes) {

    platformLayer.removeAsciiObject("platform");
    spikeLayer.removeAsciiObject("spike");

    for(let i = 3; i-- > 0;){
        platforms[i] = [];
        spikes[i] = [];
    }

    maxCameraX = display.width;
    maxCameraY = display.height;

    for (let i = levelPlatforms.length; i-- > 0;) {
        addPlatform(
            levelPlatforms[i][0],
            levelPlatforms[i][1],
            levelPlatforms[i][2],
            levelPlatforms[i][3],
            levelPlatforms[i][4]
        );
    }

    for (let i = levelSpikes.length; i-- > 0;) {
        addSpike(
            levelSpikes[i][0],
            levelSpikes[i][1],
            levelSpikes[i][2],
            levelSpikes[i][3],
            levelSpikes[i][4]
        );
    }

}