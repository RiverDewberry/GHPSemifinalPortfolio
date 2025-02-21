Level.drawLevel();

let start = true;
let interval = undefined;

const startCardText = [
	"",
	"  /=\\\\  "+"|| ||  "+"|===\\  "  +" /==\\   " +"|\\  /|  " +"  /\\   " +"======  "+"==== "+
    "  /=\\\\",
    " //     "  +"|| ||  "+"|| ||  "   +"//  \\\\  "+"|\\\\//|  "+" //\\\\  "+"  ||    "+" ||  "+
    " //    ",
    " ||     "  +"|===|  "+"|\\==/  "  +"||  ||  "  +"||  ||  "  +"//  \\\\ "+"  ||    "+" ||  "+
    " ||    ",
    " \\\\     "+"|| ||  "+"||\\\\   " +"\\\\  //  "+"||  ||  "  +"||==|| "  +"  ||    "+" ||  "+
    " \\\\  ",
    "  \\=//  " +"|| ||  "+"|| \\\\  " +" \\==/   " +"||  ||  "  +"||  || "  +"  ||    "+"==== "+
    "  \\=//",
	" CHROMATIC - A game by River Dewberry",
    "",
    " Press \"Enter\" to start game",
    " Press \"Escape\" to return to this screen",
    " Press \"e\" for level editor",
    " Use \">\" and \"<\" for level select"

];

for(let i = 0; i < charArray.length; i++)
{
    charArray[i] = previousChars[i];
}

drawStartCard();
draw();

window.addEventListener('keydown',
    (e) => {
        if (start === true) {
            if (e.key === 'ArrowRight') {
                levelIndex++;
                levelIndex %= levels.length
                Level.loadLevel(levels[levelIndex]);
            }
            if (e.key === 'ArrowLeft') {
                if (levelIndex === 0) levelIndex = levels.length;
                --levelIndex;
                Level.loadLevel(levels[levelIndex % levels.length]);
            }

            Level.drawLevel();

            for(let i = 0; i < charArray.length; i++)
            {
                charArray[i] = previousChars[i];
            }

            drawStartCard();
            draw();

            if (e.key === 'Enter') {
                start = false;
                interval = setInterval(gameLoop, 20);
            }

            if (e.key === "e")document.getElementById("test").click();
        }
        else {
            if(e.key === "Escape"){
                displayArea.pos.x = 0;
                displayArea.pos.y = 0;

                for(let i = 0; i < levelData.length; i++)
                {
                    levels[i] = new Level(levelData[i]);
                }

                killPlayer();
                Level.drawLevel();
                for(let i = 0; i < charArray.length; i++)
                {
                    charArray[i] = previousChars[i];
                }        
                drawStartCard();
                draw();
                start = true;
                clearInterval(interval);
            }
        }
    }
);

function drawStartCard() {
	for(let i = 0; i < startCardText.length; i++)
	{
		for(let j = 0; j < startCardText[i].length; j++)
		{
            if(i < 6){
                const offset = [0, 0, 0];

                offset[0] = Math.floor(Math.random() * 3);
                offset[1] = Math.floor(Math.random() * 2);
                if(offset[0] === offset[1])offset[1]++;
                if(offset[0] === 0 || offset[1] === 0){
                    offset[2]++;
                    if(offset[0] === 1 || offset[1] === 1)offset[2]++;
                }
                charArray[i * displayArea.dim.w + offset[0] + j] = startCardText[i].charCodeAt(j);
                charArray[
                    i * displayArea.dim.w + j + offset[1] + displayArea.dim.h * displayArea.dim.w
                ] = startCardText[i].charCodeAt(j);
                charArray[
                    i * displayArea.dim.w + j + offset[2] + displayArea.dim.h * displayArea.dim.w *
                    2
                ] = startCardText[i].charCodeAt(j);
            } else {
                charArray[i * displayArea.dim.w + j] = startCardText[i].charCodeAt(j);
                charArray[
                    i * displayArea.dim.w + j + displayArea.dim.h * displayArea.dim.w
                ] = startCardText[i].charCodeAt(j);
                charArray[
                    i * displayArea.dim.w + j + displayArea.dim.h * displayArea.dim.w * 2
                ] = startCardText[i].charCodeAt(j);
            }
		}
	}
}
