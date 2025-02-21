const menuLayer = display.addDisplayLayer("menu", 0);
const menuText = menuLayer.addAsciiObject(0, 0, 100, 1, "menu", [], 0);

let inMenu = true

menuText.shader = menuChars;

function menuChars() {
    const temp = new Int32Array(100);
    const text = 
`"p" to play level <-${levelCounter}-> | "w" "a" "d" or arrow keys to move | "m" to go back to menu | "r" to reset`

    for(let i = text.length; i-- > 0;){
        temp[i] = (text.charCodeAt(i) << 24) | 0XFFFFFF;
    }

    return temp;
}


window.addEventListener("keydown", (e) => {
    if(inMenu && e.key === "p"){
        menuLayer.display = false;
        loadLevel(levelCounter);
    }

    if(e.key === "m" && !inMenu){
        if(levelCounter = levels.length)levelCounter = 1;
        pseudoLoad(levelCounter)
        menuLayer.display = true;
    };

    if(e.key === "m")inMenu = true;
    if(e.key === "p")inMenu = false;

    if(!inMenu)return;

    if(e.key === "ArrowRight"){
        ++levelCounter;
        if(levelCounter >= levels.length)levelCounter = 0;
        pseudoLoad(levelCounter)
    }

    if(e.key === "ArrowLeft"){
        --levelCounter;
        if(levelCounter < 0)levelCounter = levels.length - 1;
        pseudoLoad(levelCounter)
    }

    display.drawChars();
});