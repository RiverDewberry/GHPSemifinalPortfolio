var settings = {
  difficulty: ["very easy", "easy", "medium", "hard", "very hard"],
  mines: [5, 10, 20, 30, 40],
  timeLimit: [-1, -1, -1, 7200, 5400],
  finishPoints: [100, 500, 1500, 2500, 4000],
  bonusPointsTime: [900, 1800, 2700, 3600, 4500]
};

var keysDown = [];// a variable that is a list of all keys down

var gameData = {//an object that stores game data
  position: {x: 0, y: 0},
  drawLine: [undefined, undefined, undefined, undefined],
  start: function (difficulty){
    
    this.gameRunning = true;//becomes false when game ends
    
    var index = settings.difficulty.indexOf(difficulty);
    //gets the index of the settings to use based on difficulty
    
    this.mines = generateMines(256, settings.mines[index]);
    //stores which cells are mines
    
    this.hiddenCells = [];
    for(var i = 0; i < 256; ++i){
      this.hiddenCells.push(true);
    }//stores which cells are hidden
    
    this.hiddenAmount = 256;//the amount of hidden cells
    
    this.adjacentCells = getAdjacentCells();
    //each position in this list is the cells that are adjacent to the cell in 4d space represented by that position
    
    this.minesAdjacent = getMinesAdjacent();//gets the mines adjacent to each cell
    
    this.time = 0;//sets the time to 0
    
    this.timeLimit = settings.timeLimit[index];
    //gets the time limit
    
    this.bonusPointsTime = settings.bonusPointsTime[index];
    //gets the amount of time where you can earn bonus points
    
    this.finishPoints = settings.finishPoints[index];
    //gets the amount of points for finishing a game
    
    for(var j = 0; j < 256; ++j){
      textLabel("cell" + j, "");
      var x = j & 15;
      var y = (j & (15 << 4)) >> 4;
      setProperty("cell" + j, "border-radius", 0);
      setProperty("cell" + j, "background-color", rgb(0,0,0,0));
      setPosition("cell" + j, x * 20 - 10, y * 20 + 65, 20, 20);
      setProperty("cell" + j, "font-family", "Courier");
      setText("cell" + j, "?");
    }//creates cells in the user interface
        
    setText("cellBackground", "");
    
    createCanvas("canvas", 320, 320);
    setActiveCanvas("canvas");
    setPosition("canvas", 0, 65);
    setFillColor("black");
    
    timedLoop(1000, function(){
      ++gameData.time;
      if(gameData.time === gameData.timeLimit)gameData.lose();
      setText("time", "TIME: " + toTime(gameData.time));
      setText("limit", "LIMIT: " + toTime(gameData.timeLimit));
    });//creates a timed loop that stops if the time limit is reached, if the time limit is -1, it can not be reached, so there is no limit
    
    updateCells();//what do you think this does?
  },
  
  lose: function(){//this function is called when the game is lost
    stopTimedLoop();
    this.gameRunning = false;
    
    for(var i = 0; i < 256; ++i){
      setProperty("cell" + i, "text-color", "rgb(150, 175, 175)");
      setText("cell" + i, gameData.minesAdjacent[i] + "");
      if(getProperty("cell" + i, "text") === "0")setProperty("cell" + i, "text", " ");
      if(gameData.mines[i]){
        setText("cell" + i, "X");
        setProperty("cell" + i, "text-color", "red");
      }
    }
    
    this.position = {x: 0, y: 0};
  },
  
  win: function () {
    stopTimedLoop();
    setText("cellBackground", "CONGRADULATIONS! YOU HAVE WON WITH " + this.getPoints() + " POINTS!");
  },//this function is called when the game is won
  
  getPoints: function () {
    if(this.bonusPointsTime - this.time > 0)return Math.round(this.finishPoints * (1 + ((this.bonusPointsTime - this.time) / this.bonusPointsTime)));
    return this.finishPoints;
  }
};

//------------------ these events 1: make keysDown a list of all keys down and 2: update the screen
onEvent("gameScreen", "keydown", function (e) {
  if (keysDown.indexOf(e.key) === -1)
    keysDown.push(e.key);
  //if key is not in keysDown, it is added
  
  if(gameData.gameRunning && ((keysDown[0] !== "1") && (keysDown[0] !== "2")))updateCells();//what do you think this does?
  
});
onEvent("gameScreen", "keyup", function (e) {
  if (keysDown.indexOf(e.key) !== -1) {
    if (e.key == "Shift")
      keysDown = keysDown.slice(0, keysDown.indexOf("Shift"));
      //if shift unpressed, the keys effected by the shift are removed from keysDown
      
    keysDown.splice(keysDown.indexOf(e.key), 1);
    //if key is in keysDown, it is removed
  }
});
//------------------

onEvent("start", "click", function( ) {
  var difficulty = getProperty("difficulty", "value");
  setScreen("gameScreen");
  gameData.start(difficulty);
});//starts a game of the specified difficulty

onEvent("restart", "click", function( ) {
  gameData.lose();
  setText("time", "TIME: ");
  setText("limit", "LIMIT: ");
  for(var i = 0; i < 256; ++i){
    deleteElement("cell" + i);
  }
  deleteElement("canvas");
  setText("cellBackground", "LOADING...");
  setScreen("startScreen");
});//restarts on click

onEvent("continueToGame", "click", function( ) {
	setScreen("startScreen");
});//sets the screen to start screen

onEvent("startButton", "click", function( ) {
	setScreen("explanationScreen");
});//sets the screen to explanation screen

onEvent("gameScreen", "mousemove", function(event) {
  if((gameData.drawLine[0] !== event.x) || (gameData.drawLine[1] !== (event.y - 65))){
    gameData.drawLine[2] = gameData.drawLine[0] || event.x;
    gameData.drawLine[3] = gameData.drawLine[1] || event.y - 65;
    gameData.drawLine[0] = event.x;
    gameData.drawLine[1] = event.y - 65;
  }
  if(keysDown.indexOf("1") !== -1){
    setStrokeColor("white");
    line(gameData.drawLine[0], gameData.drawLine[1], gameData.drawLine[2], gameData.drawLine[3]);
  }
  if(keysDown.indexOf("2") !== -1){
    setStrokeColor("black");
    rect(gameData.drawLine[0] - 10, gameData.drawLine[1] - 10, 20, 20);
  }

});

function generateMines(totalCells, totalMines, cells){
  //this function generates an array of a specified length with a specified amount of positions in the array set to true
  //this will be used to select random cells to be mines
  
  //totalCells is the amount of cells that can become mines
  //totalMines is the number of cells that will become mines
  //cells is an array of where each position in th array is a cell, and if that position is set to true, that cell is a mine
  
  if(cells === undefined){
    cells = [];
    while(cells.length < totalCells){
      cells.push(false);
    }
  }//cells is set to an array of length totalCells if cells is undefined

  if((totalCells == 0) || (totalMines == 0))return cells;
  //returns the cells when either every position up to totalCells has been selected, or when totalMines positions have been selected

  var mineIndex = Math.floor(Math.random() * totalCells);
  //generates an integer between 0 (inclusive) and totalCells (exclusive)
  
  for(var i = 0; i <= mineIndex; ++i){
    if(cells[i] === true)++mineIndex;
  }//sets mineIndex to one of the remaining positions in cells
  
  cells[mineIndex] = true;//cells at index mineIndex is set to true
  
  return generateMines(totalCells - 1, totalMines - 1, cells);
  //uses recursion to generate the specified amount of mines
}

function getAdjacentCells(){
  
  var returnList = [];//stores all adjacent cells
  
  for(var i = 0; i < 256; ++i){
    
    var loopData = [];//stores data that will be used in for loops to find adjacent cells
    
    var adjacentCells = [];//stores cells adjacent to cell i
    for (var j = 0; j < 4; j++) {
      switch((i & (3 << j * 2)) >> (j * 2)){
        case 0:
          loopData.push(0);
          loopData.push(2);
          break;
        case 1:
          loopData.push(0);
          loopData.push(3);
          break;
        case 2:
          loopData.push(1);
          loopData.push(4);
          break;
        case 3:
          loopData.push(2);
          loopData.push(4);
          break;
      }
    }//creates data that for loops will use. it is hard to explain
    
    for (var l1 = loopData[0]; l1 < loopData[1]; ++l1) {
      for (var l2 = loopData[2]; l2 < loopData[3]; ++l2) {
        for (var l3 = loopData[4]; l3 < loopData[5]; ++l3) {
          for (var l4 = loopData[6]; l4 < loopData[7]; ++l4) {
            adjacentCells.push(l1 | (l2 << 2) | (l3 << 4) | (l4 << 6));
          }
        }
      }
    }//this is completely normal code
    
    returnList.push(adjacentCells);//adds the list of adjacent cells to the returnList
  }
  
  return returnList;
}//I dont know what to say about this function. it just works. it makes a list of which cells are adjacent to which other cells

function getMinesAdjacent(){
  var returnList = [];
  for(var i = 0; i < 256; ++i){
    returnList.push(0);
    for(var j = 0; j < gameData.adjacentCells[i].length; ++j){
      if(gameData.mines[gameData.adjacentCells[i][j]])++returnList[i];
    }
  }
    return returnList;
}//gets the mines adjacent to each cell

function updateCells(){
  if(keysDown.indexOf("d") !== -1)++gameData.position.x;//
  if(keysDown.indexOf("a") !== -1)--gameData.position.x;//
  if(keysDown.indexOf("s") !== -1)++gameData.position.y;//
  if(keysDown.indexOf("w") !== -1)--gameData.position.y;//
  gameData.position.y &= 15;                            //
  gameData.position.x &= 15;                            //
  //movement logic--------------------------------------//
  
  for(var i = 0; i < 256; ++i){
      setProperty("cell" + i, "text-color", "rgb(150, 175, 175)");
      if(getProperty("cell" + i, "text") === "0")setProperty("cell" + i, "text", " ");
  }
  
  for(var j = 0; j < gameData.adjacentCells[gameData.position.x | (gameData.position.y << 4)].length; ++j){
    setProperty("cell" + gameData.adjacentCells[gameData.position.x | (gameData.position.y << 4)][j], "text-color", "orange");
  }
  setProperty("cell" + (gameData.position.x | (gameData.position.y << 4)), "text-color", "red");
  if(getProperty("cell" + (gameData.position.x | (gameData.position.y << 4)), "text") === " ")setProperty("cell" + (gameData.position.x | (gameData.position.y << 4)), "text", "0");
  //highlights cells
  
  if(keysDown.indexOf("Backspace") !== -1){
    showCell(gameData.position.x | (gameData.position.y << 4));
  }//shows cells
  if(keysDown.indexOf("Enter") !== -1){
    removeMine(gameData.position.x | (gameData.position.y << 4));
  }//removes mines
}

function showCell(cell){
  if(gameData.hiddenCells[cell]){
    if(gameData.mines[cell]){
      gameData.lose();
      return;
    }
    gameData.hiddenCells[cell] = false;
    --gameData.hiddenAmount;
    setText("cell" + cell, gameData.minesAdjacent[cell] + "");
    if(getProperty("cell" + cell, "text") === "0"  && (cell !== (gameData.position.x | (gameData.position.y << 4))))
    setProperty("cell" + cell, "text", " ");
    if(gameData.minesAdjacent[cell] === 0){
      for(var i = 0; i < gameData.adjacentCells[cell].length; ++i){
        showCell(gameData.adjacentCells[cell][i]);
      }
    }
  }
  if(gameData.hiddenAmount === 0)gameData.win();
}//shows cells and ends the game if a mine is shown

function removeMine(cell){
  if(gameData.hiddenCells[cell]){
    if(gameData.mines[cell]){
      gameData.mines[cell] = false;
      for(var i = 0; i < gameData.adjacentCells[cell].length; ++i){
        --gameData.minesAdjacent[gameData.adjacentCells[cell][i]];
        if(!gameData.mines[gameData.adjacentCells[cell][i]])
        setProperty("cell" + gameData.adjacentCells[cell][i], "text", gameData.minesAdjacent[gameData.adjacentCells[cell][i]]);
        if(gameData.minesAdjacent[gameData.adjacentCells[cell][i]] === 0){
          setProperty("cell" + gameData.adjacentCells[cell][i], "text", " ");
        }
      }
      showCell(cell);
    } else gameData.lose();
  }
}//removes mines

function toTime(time){
  if(time === -1)return "NONE";
  var seconds = time % 60;
  var minutes = ((time - seconds) / 60) % 60;
  var hours = (time - (minutes * 60) - seconds) / 3600;
  return hours + ":" + minutes + ":" + seconds;
}//takes an amount of time in seconds and formats it
