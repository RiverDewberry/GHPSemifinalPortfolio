let highlight = 0;//controls highlighted colors
let targetX = 0;
let targetY = 0;
let oldHighlight = 0;

function draw()
{
    let currentPos;
    let checkPos = [0, 0, 0];
    let keepChar = false;

    if(oldHighlight !== highlight)
    {
        for(let i = 0; i < previousChars.length; i++)
        {
            previousChars[i] = 0;
        }
        for (let i = 0; i < imgData.data.length; i += 4)
        {
            imgData.data[i] = 0;
            imgData.data[i | 1] = 0;
            imgData.data[i | 2] = 0;
        }
    }
    
    oldHighlight = highlight;

    for(let i = 0; i < displayArea.dim.w; i++)
    {
        for(let j = 0; j < displayArea.dim.h; j++)
        {
            checkPos[0] = (i + j * displayArea.dim.w);
            checkPos[1] = (i + j * displayArea.dim.w) + (displayArea.dim.w * displayArea.dim.h);
            checkPos[2] = (i + j * displayArea.dim.w) + 
                (2 * displayArea.dim.w * displayArea.dim.h);

            keepChar = (previousChars[checkPos[0]] === charArray[checkPos[0]]) &&
            (previousChars[checkPos[1]] === charArray[checkPos[1]]) &&
            (previousChars[checkPos[2]] === charArray[checkPos[2]]);

            if(keepChar)continue;
            else 
            {
                for(let y = 0; y < 8; y++)
                {
                    for(let x = 0; x < 5; x++)
                    {
                        imgData.data[
                            ((((i * 6) + (4 - x)) + imgData.width * ((j * 9) + y)) << 2)] = 0;
                        imgData.data[
                            ((((i * 6) + (4 - x)) + imgData.width * ((j * 9) + y)) << 2) | 1] = 0;
                        imgData.data[
                            ((((i * 6) + (4 - x)) + imgData.width * ((j * 9) + y)) << 2) | 2] = 0;
                    }
                }
            }

            for(let k = 0; k < 3; k++)
            {
                currentPos = (i + j * displayArea.dim.w) + (k * displayArea.dim.w * displayArea.dim.h);

                if(keepChar) continue;

                addLetter (
                    imgData,
                    6 * i,
                    9 * j,
                    charArray[currentPos],
                    k
                );
            }
        }
    }//draws the leters in charArray to imgData

    for(let i = 0; i < charArray.length; i++)
    {
        previousChars[i] = charArray[i];
        charArray[i] = 0;
    }

    if(highlight !== 0)//highlights colors
    {
        for (let i = 0; i < imgData.data.length; i += 4)
        {
            if(((highlight & 1) === 0) && (imgData.data[i] === 255))imgData.data[i] = 50;
            if(((highlight & 2) === 0) && (imgData.data[i | 1] === 255))imgData.data[i | 1] = 50;
            if(((highlight & 4) === 0) && (imgData.data[i | 2] === 255))imgData.data[i | 2] = 50;
        }
    } else 
    {
        for (let i = 0; i < imgData.data.length; i += 4)
        {
            if(
                (imgData.data[i] === 0) && 
                (imgData.data[i | 1] === 255) && 
                (imgData.data[i | 2] === 0))
            {
                imgData.data[i | 1] = 150;
            }
            if(
                (imgData.data[i] === 255) &&
                (imgData.data[i | 1] === 0) &&
                (imgData.data[i | 2] === 0))
            {
                imgData.data[i] = 200;
            }
            if(
                (imgData.data[i] === 0) && 
                (imgData.data[i | 1] === 0) && 
                (imgData.data[i | 2] === 255))
            {
                imgData.data[i] = 10;
                imgData.data[i | 1] = 20;
            }
            if(
                (imgData.data[i] === 255) &&
                (imgData.data[i | 1] === 255) &&
                (imgData.data[i | 2] === 0))
            {
                imgData.data[i | 1] = 200;
                imgData.data[i] = 200;
            }
        }//color correction
    }

    if(editor)
    {
        for(let x = 0; x < imgData.width; x++)
        {
            for(let y = 0; y < imgData.height; y++)
            {
                if((((x + 1) % 6) === 0) || (((y + 1) % 9) === 0))
                {
                    if(highlightObj)
                    {
                        imgData.data[((imgData.width * y + x) << 2)] = 0;
                        imgData.data[((imgData.width * y + x) << 2) | 1] = 0;
                        imgData.data[((imgData.width * y + x) << 2) | 2] = 0;
                        if(
                            ((x / 6 + displayArea.pos.x) >= currentTypeArray[objIndex][0]) &&
                            ((y / 9 + displayArea.pos.y) >= currentTypeArray[objIndex][1]) &&
                            ((x / 6 + displayArea.pos.x) < currentTypeArray[objIndex][0] + 
                            currentTypeArray[objIndex][2]) &&
                            ((y / 9 + displayArea.pos.y) < currentTypeArray[objIndex][1] + 
                            currentTypeArray[objIndex][3])
                        )
                        {
                            imgData.data[((imgData.width * y + x) << 2) | editColor] = 255;
                        }
                    } else 
                    {
                        imgData.data[((imgData.width * y + x) << 2)] = 0;
                        imgData.data[((imgData.width * y + x) << 2) | 1] = 0;
                        imgData.data[((imgData.width * y + x) << 2) | 2] = 0;
                    }
                }
            }
        }
    }
    ctx.putImageData(imgData, 0, 0);//draws image data
}//draws the ascii to the screen

function addLetter(imgd, x, y, letter, color)
{
    if((letter < 33) || (letter > 126))letter = 32;

    letter -= 32;

    for(let i = 0; i < 8; i++)
    {
        for(let j = 0; j < 5; j++)
        {
            if((ASCIIBitData[(letter * 8) + i] & (1 << j)) === (1 << j))
                imgd.data[(((x + (4 - j)) + imgd.width * (y + i)) << 2) | color] = 255;
            //finds the bit associated with each pixel in a character to then draw that character
        }
    }
}//adds a letter to the image data

function transferCharData(x1, y1, width1, height1, chars1, x2, y2, width2, height2, chars2, color)
{
    //this function takes 2 arrays of characters that exist in 2d space, and transfers data from
    //the first to the second where they intersect, however it does not copy the value 0

    const minX = ((x1 < x2) ? x2 : x1);
    const minY = ((y1 < y2) ? y2 : y1);
    const maxX = (x1 + width1 < x2 + width2) ? x1 + width1 : x2 + width2;
    const maxY = (y1 + height1 < y2 + height2) ? y1 + height1 : y2 + height2;

    color = (color === undefined) ? 0 : color * width2 * height2;

    for (let i = minX; i < maxX; ++i) {
        for (let j = minY; j < maxY; ++j) {

            if (chars1[i - x1 + (j - y1) * width1] !== 0);
                chars2[i - x2 + (j - y2) * width2 + color] =
                    chars1[i - x1 + (j - y1) * width1];

        }
    }
}