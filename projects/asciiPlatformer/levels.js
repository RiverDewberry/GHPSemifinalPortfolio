const levels = [];
let level;//this is cursed, but it works and I'm lazy
let loadedLevel;
let levelCounter = 1;

class Level {
    constructor(spawn, platforms, spikes, goal) {
        this.spikes = spikes;
        this.spawn = spawn;
        this.platforms = platforms;
        this.goal = goal;
        this.loaded = false;
        this.interval;
        levels.push(this);
    }

    load() {
        if (this.loaded) return;
        this.loaded = true;

        for(let i = this.platforms.length; i-- > 0;){
            addPlatform(
                this.platforms[i][0],
                this.platforms[i][1],
                this.platforms[i][2],
                this.platforms[i][3],
                this.platforms[i][4],
            );
        }

        for(let i = this.spikes.length; i-- > 0;){
            addSpike(
                this.spikes[i][0],
                this.spikes[i][1],
                this.spikes[i][2],
                this.spikes[i][3],
                this.spikes[i][4]
            );
        }

        for(let i = 3; i-- > 0;){
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

    unload() {
        if (!this.loaded) return;
        this.loaded = false;
        platformLayer.removeAsciiObject("platform");
        spikeLayer.removeAsciiObject("spike");
        playerLayer.display = false;
        platformLayer.display = false;
        spikeLayer.display = false;
        display.drawChars();
        maxCameraX = display.width;
        maxCameraY = display.height;
        clearInterval(this.interval);
    }

    levelBehavior() {

        if (keysDown.includes("r")) {
            for(let i = 3; i-- > 0;){
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
        ) loadLevel(++levelCounter);

        movePlayerJump(keysDown.includes("w") || keysDown.includes("ArrowUp"));
        if (keysDown.includes("d")|| keysDown.includes("ArrowRight")) movePlayerRight();
        if (keysDown.includes("a")|| keysDown.includes("ArrowLeft")) movePlayerLeft();
        chechSpikes(level.spawn);

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

function pseudoLoad(lvl){

    if(loadedLevel !== undefined)
        levels[loadedLevel].unload();

    playerLayer.display = true;
    platformLayer.display = true;
    spikeLayer.display = true;

    makeLevelObjects(levels[lvl].platforms, levels[lvl].spikes);

    for (let i = 3; i-- > 0;) {
         player[i].x = levels[lvl].spawn.x;
         player[i].y = levels[lvl].spawn.y;
         goal[i].x = levels[lvl].goal[i].x;
         goal[i].y = levels[lvl].goal[i].y;
    }

    display.drawChars();
}

function loadLevel(lvl) {
    if(loadedLevel !== undefined)
        levels[loadedLevel].unload();
    for(let i = 3; i-- > 0;){
        platforms[i] = [];
        spikes[i] = [];
    }
    if(lvl >= levels.length)return;
    levels[lvl].load();
    loadedLevel = lvl;
}