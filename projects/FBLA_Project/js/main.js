import { factories } from "./factory.js";
import { upgradeData } from "./upgrades.js";
import { NewsReal } from "./newReal.js";
import {Shaders} from "./Shaders.js";


let captureX, captureY, captureW, captureH, overzoom;
const PUICount = (3 +1)
const VarsToChange = [10,7,8,12]
const StatsToDisplay = [0,1,5,6,7,8,9]
let SellectedFactory = -1;
let SellectedFactoryPos = -1;
let SelctedBuyType = 1;
let indent = 0;

const StatUICount = (4 +1);
function factoryAt(x, y) {
    x = Math.round(x * captureW / canvas.width + captureX);
    y = Math.round(y * captureH / canvas.height + captureY);

    let yOff;
    let xOff;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            yOff = Math.abs(y - (16 * (i - (7 - j)) + 297));
            xOff = Math.abs(x - (64 * i + 32 * ((7 - j) - i) + 32.5));
            if (xOff + (yOff << 1) < 30.5) return (i << 3) + j;
        }
    }
    return -1;
};

let factoryLinks = [];
const upgradeNumbers = new Uint8Array(factories.upgradeData.names.length << 6); // creates an array of 0s for num of factorys * 64
//DISPLAY
//creating and setting up canvas
const canvas = document.getElementById("canvas")

let displayCtx = canvas.getContext("bitmaprenderer");
const display = new Worker("../js/display.js");
display.postMessage([0, canvas.width, canvas.height]);
canvasSetup();
NewsRealSetUp();

//Set up Html ellements
for (let i = 0; i < upgradeData.names.length; i++) {
    CreateUpgradeUI(i,upgradeData.names[i],IntToRomanNumeral(1),upgradeData.costs[i])
    
}
for (let i = 1; i < StatUICount; i++) {
    CreateStatUI(factories.NamesOfData[i],IntToPlaceValue(100000) + "", i)
    
}
for (let i = 1; i < PUICount; i++) {
    CreatePolicyUI(i,false);
    
}
for (let i = 1; i < 16; i++) {
    let t = document.createElement("button");
    t.classList.add("BoxButton");
    t.style.backgroundImage = "url('../sprites/factory" + (i) + ".png')";
    t.addEventListener("click",SwitchSelcted);
    t.addEventListener("mouseover",HoverText);
    t.addEventListener("mouseout",function(){document.getElementById("HoverTextDisplay").style.display = "none";});
    t.id = "FacButton:" +i;
    t.name = i;
    document.getElementById("THING").appendChild(t);
}
CreatePolicyUI(PUICount,true);
//End of set up
DisplayMesage("Welcome to Factory sim","Place a factory by clicking on a space");
setInterval(ScrollText,1);
setInterval(gameLogicTick,500);
document.getElementById("SaveButton").addEventListener("click",getSave);
document.getElementById("LoadButton").addEventListener("click",DefaultLoad);

//Game VARS

let boughtFactories = [];
//this array exists to load bought factories

function getSave() {
	let factoryData = [];

	let tl = factories.factoryArray.types.length;
	let fl = factories.factoryArray.usedLength;

	for(let i = 0; i < fl; i++)
	{
		factoryData.push([]);
		for(let j = 0; j < tl; j++)
		{
			factoryData[i].push(factories.factoryArray.getVal(i, j));
		}
	}

	const currSave = [
		gameState,
		EconomyVars,
		factoryData,
		boughtFactories,
		upgradeNumbers,
		factoryLinks
	];
    navigator.clipboard.writeText(btoa(JSON.stringify(currSave)));
}
function DefaultLoad(){
    loadSave(prompt("Please enter your save: ", ""), true);
}
function loadSave(save,IsString) {//WHYYYYYYYYYYY

    let currSave;
    if (IsString === true) {
        currSave = JSON.parse(atob(save));
    }
    else{
        currSave = save;
    }

	gameState = currSave[0];
	
	display.postMessage([9, gameState.hour + (gameState.day * 8)]);


	EconomyVars = currSave[1];
	let factoryData = currSave[2];

	factoryLinks = currSave[5];

	let tl = factories.factoryArray.types.length;
	let fl = factories.factoryArray.usedLength;

	for(let i = 0; i < fl; i++)
	{
		factories.factoryArray.removeInstance(0);
	}

	for(let i = 0; i < factoryData.length; i++)
	{
		factories.makePresetFactory(i, 0);
		for(let j = 0; j < factoryData[i].length; j++)
		{
			factories.factoryArray.setVal(i, j, factoryData[i][j]);
		}
	}

	for(let i = 0; i < fl; i++)
	{
		factoryData.push([]);
		for(let j = 0; j < tl; j++)
		{
			factoryData[i].push(factories.factoryArray.getVal(i, j));
		}
	}


	boughtFactories = currSave[3];
	for(let x in currSave[4])
	{
		upgradeNumbers[Number(x)] = currSave[4][x];
	}
	for(let i = 0; i < 64; i++)
	{
		if(typeof boughtFactories[i] === "string")
		{
			display.postMessage([7, i, boughtFactories[i]]);
	
		}
	}
}
function PlayAudio( FileName )
{
    let au = new Audio ("/AudioFlies/" + FileName)
    au.play();

}
let gameState = {
    funds: 10500,//how much money the player has
    Debt: -1000000,
    Goodsheld: 0,
    CostPerGood: 1,// how much each good is sold for
    Marketablity: .00001, //precent of people who will buy ur product
    hour: 8,//the current in-game hour (24 hour format)
    day: 1,//the current in-game day
    inflation: 1,//the amount of inflation, this effects all prices 
    goods: 0,//the amount of goods the player has, which they can sell for money
    HourlyProduction:0 //DOOOOO NOT USE THIS FOR CALCULATIONS THIS IS FOR UI OLNLY
}
let EconomyVars ={
    InflationRate: .03,
    ValueOfDollar: 1,
    DebtInfaltionRate: .03,//this was WAY too high
    living: 8.5, //Cost of livving calulated form ((avg monthly cost)/(avg days in month))/(hours in day)
                                                        //(6k/30.437)/24
    MinimumWage: 7,
    population:(331.9 * 1000000),//us population
    DailyPopInc: 19,
    PreferdHours: 8,
    sewcost: 10000,
}
UpdateUI();
//END OF GAME VARS
let loadedNum = 0;


//images



const imgs = [];
const imgbmps = [];
const srcs = [
    "grass1", "grass2", "grass3", "grass4", "grass5", "boxFront", "boxBack", "factory1", "factory2",
    "factory3", "factory4", "factory5", "factory6", "factory7", "factory8", "factory9", "factory10",
    "factory11", "factory12", "factory13", "factory14", "factory15", "border","SunZenith_Gradient",
    "ViewZenith_Gradient", "ground","Road", "Marketing", "Gradiant", "splendor128",
];

for(let i = 0; i < srcs.length; i++){
    imgs[i] = new Image();
    imgs[i].src = "../sprites/" + srcs[i] + ".png";
    imgs[i].onload = sendSpriteBitmaps;
}

function sendSpriteBitmaps() {
    loadedNum++;
    if(srcs.length !== loadedNum)return;

    for(let i = 0; i < srcs.length; i++){
	    imgbmps[i] = createImageBitmap(imgs[i]);
    }

    Promise.all(imgbmps).then((sprites) => {
        display.postMessage([5, srcs, sprites, srcs.length]);
        display.postMessage([1]);
    });
}

display.onmessage = (e) => {
    //RENDING CODE

    if(e.data.length === undefined){
        //console.log(e.data);
        displayCtx.transferFromImageBitmap(e.data);
        //displayCtx.transferFromImageBitmap(Shaders.RunShader(e.data));
        display.postMessage([6]);
        return;
    }
    captureX = e.data[0];
    captureY = e.data[1];
    captureW = e.data[2];
    captureH = e.data[3];
}

//events
let mouseDownX = 0;
let mouseDownY = 0;
canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    display.postMessage([2, e.deltaY]);
});
canvas.addEventListener("mousemove", (e) => {
    display.postMessage([4, e.offsetX, e.offsetY]);
}
);
canvas.addEventListener("mousedown", (e) => {
    display.postMessage([3, true]);
    mouseDownX = e.offsetX;
    mouseDownY = e.offsetY;
});
canvas.addEventListener("mouseup", (e) => {
    display.postMessage([3, false]);
    if(mouseDownX === e.offsetX && mouseDownY === e.offsetY){
	    if(factoryAt(e.offsetX, e.offsetY) === -1)return; // exit ealy 
        
        buyFactory(factoryAt(e.offsetX, e.offsetY), SelctedBuyType);
    }
});
document.addEventListener("keydown", (e) => {
    for(let i = 1; i < 9; i++){
        if(e.key === i + ""){
            SelctedBuyType = i;
            return;
        }
    }
    if(e.key === "Escape"){
        const canvas = document.querySelector("canvas");
        const allElements = document.body.children;
    
        for (let element of allElements) {
            if (element !== canvas) {
                if (element.style.display === "none") {
                    element.style.display = "inherit";
                    
                }
                else{
                    element.style.display = "none";
                }
                
            }
        }
        
    }
    
});
window.addEventListener("resize", (e) => {
    canvasSetup();
    display.postMessage([1]);
});
//Game DISPLAY END



//UI DisplayStart
//
function NewsRealSetUp(){
    let Comb = "";
    let temp =[];
    let R;
    for (let i = 0; i < NewsReal.Headlines.length; i++) {
        temp.push(i);
        
    }
    let Gap  = "";
    for (let i = 0; i < 10; i++) {
        Gap += " " ;
        
    }
    for (let i = 0; i < NewsReal.Headlines.length; i++) {
        R = Math.round(Math.random() * (temp.length -1))
        Comb = Comb+Gap +"BREAKING: " + NewsReal.Headlines[temp[R]];   
        temp.splice(R,1); 
    }
    document.getElementById("NewsReal").textContent = Comb;
    indent = 1000;
}
function ScrollText(){
    const Text = document.getElementById("NewsReal");
    indent -= 1;
    //Text.textContent = NewsReal.Headlines[0];
    Text.style.textIndent = indent+"px";
}
function UpdateUI(){
    document.getElementById("DelButon").addEventListener("click",delCurFac)
    document.getElementById("MoneyText").textContent         = "Money:$"     + IntToPlaceValue(gameState.funds);
    document.getElementById("FactoryCountText").textContent  = "Factorys:"   + factories.length;
    document.getElementById("DebtDisplay").textContent       = "Debt:"       + IntToPlaceValue(gameState.Debt);
    document.getElementById("GoodsDisplay").textContent      = "Goods:"      + IntToPlaceValue(gameState.goods);
    document.getElementById("ProductionDisplay").textContent = "Production:" + gameState.HourlyProduction +"";
    if (SellectedFactory !== -1) {
        document.getElementById("FactoryName").children[0].textContent = factories.presetNames[factories.getFactoryType(SellectedFactory)];  
    }
    
    document.getElementById("PayDebt").addEventListener("click",PayDebts)

    if (gameState.hour % 24 < 12) {
        document.getElementById("TimeDisplay").textContent = (((gameState.hour -1) % 12) +1) + " AM"
    }
    else{
        document.getElementById("TimeDisplay").textContent = (((gameState.hour-1) % 12) +1) + " PM"
    }
    
    
    let Cur2;
    let holder;
    if (SellectedFactory !== -1) {
        
        
        for (let i = 0; i < PUICount; i++) {
            UpdatePolicyUI(i,factories.NamesOfData[VarsToChange[i]],factories.factoryArray.getVal(SellectedFactory,VarsToChange[i]),true);  
        }
        UpdatePolicyUI(PUICount,"Goods Price",gameState.CostPerGood + "",false);

        for (let i = 0; i < StatUICount; i++) {
            Cur2 = document.getElementById("StatsRef " + i)
            Cur2.children[0].children[0].textContent = factories.NamesOfData[StatsToDisplay[i]];
            Cur2.children[1].children[0].textContent = factories.factoryArray.getVal(SellectedFactory,StatsToDisplay[i]);
            
        }
        for (let i = 0; i < upgradeData.names.length; i++) {
            holder = document.getElementById("UpgradeRef " + i);
            holder.children[1].children[0].textContent = (IntToRomanNumeral(upgradeNumbers[SellectedFactory + i] +1) + "");
            //console.log(upgradeNumbers[SellectedFactory + i]);
            holder.children[2].textContent = "$"+ IntToPlaceValue(GetUpgradeCost(SellectedFactory,i)) + "";
            holder.children[2].name = i + "";
            holder.children[2].addEventListener("click",BULLLLL);
        }
    }
    else{
        let Cur;
        for (let i = 0; i < PUICount + 1; i++) {
            Cur = document.getElementById("PolicyHolder " + i);
            Cur.style.display = 'none';
        }
    }
}
function SwitchSelcted(){
        document.getElementById("FacButton:" + SelctedBuyType).style.border = "solid 2px black";
        SelctedBuyType = (this.name -0);
        this.style.border = "solid 2px red";
}
function HoverText(){
    let h= document.getElementById("HoverTextDisplay");
    console.log(this.name);
    h.style.display = "inherit";
    h.style.left = (this.offsetLeft) + "px";
    h.style.top = (this.offsetTop + (this.clientHeight * .75)) + "px";
    h.style.zIndex = "9000000"
    h.children[0].textContent = factories.presetNames[this.name -0] + '\n' + factories.presetDescriptions[this.name -0] + '\n' + "Cost: $" + IntToPlaceValue(factories.presetCosts[this.name -0]);
}
function PayDebts(){
    gameState.Debt += gameState.funds;
    gameState.funds = 0;
}
function DisplayMesage (tital,subtital){
    const MsgD = document.getElementById("EventDisplay");
    MsgD.style.display = "inherit";
    MsgD.children[0].children[0].textContent = tital +"";
    MsgD.children[1].children[0].textContent = subtital +"";
    MsgD.children[2].children[0].addEventListener("click",HideDisp)
}
function HideDisp(){
    document.getElementById("EventDisplay").style.display = "none";
}
function UpdatePolicyUI (ind,LabelName,CurValue,IsFactory){
    let Cur = document.getElementById("PolicyHolder " + ind);
    Cur.style.display = 'flex';
    Cur.children[0].textContent = LabelName + "";
    Cur.children[1].children[1].textContent = CurValue;

    if (IsFactory) {
        Cur.children[1].children[0].id = VarsToChange[ind];
        Cur.children[1].children[0].addEventListener("click",subTofacValue);
        Cur.children[1].children[2].id = VarsToChange[ind];
        Cur.children[1].children[2].addEventListener("click",addTofacValue);
    }
    else{
        
        Cur.children[1].children[0].addEventListener("click",SubToGame);
        Cur.children[1].children[2].addEventListener("click",AddToGame);
    }

    
}
function BULLLLL(){
    upgradeFactory(SellectedFactoryPos,this.name - 0);
}

function delCurFac(){
    
    removeFactory(SellectedFactoryPos);
    SellectedFactory = -1;
    SellectedFactoryPos =-1;
}
function AddToGame(){
    gameState.CostPerGood =  gameState.CostPerGood + 1;
    UpdateUI();
}
function SubToGame(){
    gameState.CostPerGood =  gameState.CostPerGood - 1;
    UpdateUI();
}
function addTofacValue(){
    factories.factoryArray.setVal(SellectedFactory,this.id,factories.factoryArray.getVal(SellectedFactory,this.id) +1);
    UpdateUI();
}
function subTofacValue(){
    factories.factoryArray.setVal(SellectedFactory,this.id,factories.factoryArray.getVal(SellectedFactory,this.id) -1);
    UpdateUI();
}

function canvasSetup() {
    //this creates a new context when each 
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    displayCtx = canvas.getContext("bitmaprenderer");
    display.postMessage([0, canvas.width, canvas.height]);
    
}

function CreateUpgradeUI(ind,UName,UpgradeLvl,Price,) {
    const UpgradeHolder = document.getElementById("UpgradesBox");
    const UpG = document.getElementById("UpgradeRef 0");
    let clone = UpG;
    if (ind != 0) {
        clone = UpG.cloneNode(true);
    }

    clone.id = "UpgradeRef " + ind;
    clone.children[0].children[0].textContent = UName + "";
    clone.children[1].children[0].textContent = UpgradeLvl + "";
    clone.children[2].textContent = "$"+ Price + "";
    UpgradeHolder.appendChild(clone);
    
}  
function CreateStatUI(SName,Stat,ind) {
    const UpgradeHolder = document.getElementById("StatsBox");
    const UpG = document.getElementById("StatsRef 0");
    let clone = UpG.cloneNode(true);

    clone.id = "StatsRef " + ind;
    clone.children[0].children[0].textContent = SName + "";
    clone.children[1].children[0].textContent = Stat + "";
    UpgradeHolder.appendChild(clone);
    
}
 function CreatePolicyUI(count,IsGlobal) {
    let PolicyHolder = document.getElementById("PolicyBoxHolder");
    if (IsGlobal) {
       PolicyHolder = document.getElementById("GolabalPolicyBoxHolder");
    }
   
    

    const PolicyClone = document.getElementById("PolicyHolder 0");
    let clone = PolicyClone.cloneNode(true);
    clone.id = "PolicyHolder " + count

    PolicyHolder.appendChild(clone);
}
function IntToRomanNumeral (int){
    let output = ""
    let num = int;
    let temp = int;
    const Chars = ["D" ,"C","L","X","V",'I']
    const Values = [500,100,50 ,10 ,5  ,1]
        for (let i = 0; i < Values.length; i++) {
            for (let j = 0; j <  Math.floor(temp/Values[i]); j++) {
                output += (Chars[i] + "")
                num -= Values[i];
            }
            if (Values[i] != 1) {
                if (Values[i]/Values[i+1] == 5) {
                    if ((((-num % -Values[i+1]) + num)/Values[i+1]) ==4 ) {
                       num -= Values[i] - Values[i+1];
                       output += Chars[i+1] +""+ Chars[i];
                    }
                }
            }
            
            temp = num;
        }
    return (output);
}
function IntToPlaceValue(int){
    let places = [12,9,6,3]
    let Abriv =  ["T","B","M","K"]
    for (let i = 0; i < places.length; i++) {
        if (Math.abs(int) >= Math.pow(10,places[i])) {
            return (Math.round(10 * (int/Math.pow(10,places[i])))/10)+ Abriv[i];
        } 
    }
    return int;
    
}


//UI Display ENd

//GAME LOGIC

//stores the game state in the gamestate object




function upgradeFactory(position, upgradeNum){
    let index = factoryLinks.indexOf(position);
    if(index === -1)return;
    let cost = Math.round(GetUpgradeCost(index, upgradeNum) * (1/gameState.inflation)) ;
    if((cost) > gameState.funds){
        return;
    }
    if (cost + "" === "NaN") {
        console.error("Upgrade cost is NaN" );

        return;
    }
    console.log(cost);
    gameState.funds =  gameState.funds -(cost);
    upgradeNumbers[(index * factories.upgradeData.names.length) + upgradeNum]++;

    
    for (let i = 0; i < (upgradeData.effects[upgradeNum].length /2); i++) {
        let ThingToSet = upgradeData.effects[upgradeNum][i];
        factories.factoryArray.setVal(index, ThingToSet, factories.factoryArray.getVal(index,ThingToSet) + factories.upgradeData.effects[upgradeNum][i+1]);
        i++
    }
    
}
function GetUpgradeCost(position, upgradeNum){

    if (factories.upgradeData.costs[upgradeNum] +"" === "NaN") {
        console.error("Upgrade cost is NaN  :" + upgradeNum + " :");
        

        return
    }
    if ((1.15 ** (upgradeNumbers[(position * factories.upgradeData.names.length) + upgradeNum])) + "" === "NaN") {
        console.error((position << 6) + upgradeNum);
        console.error("positon retuns NaN");
        return
    }
   return factories.upgradeData.costs[upgradeNum] * (1.15 **(upgradeNumbers[(position * factories.upgradeData.names.length) + upgradeNum]))
}
function buyFactory(position, factoryPreset){
    if(position < 0 || position > 63) return;
    if(factoryLinks.includes(position)) {
        SellectedFactory = factoryLinks.indexOf(position);
        SellectedFactoryPos = position;
        console.log(SellectedFactory);
        UpdateUI();
        return;
    }
    if((factories.presetCosts[factoryPreset] * gameState.inflation) > gameState.funds)return;
    gameState.funds -= factories.presetCosts[factoryPreset] * gameState.inflation;
    factoryLinks.push(position);
    factories.makePresetFactory(factoryPreset);
    display.postMessage([7, position, "factory" + factoryPreset]);
    
    boughtFactories[position] = "factory" + factoryPreset;

    SellectedFactory =  (factories.length -1);
    SellectedFactoryPos = position;
    UpdateUI();
}

function removeFactory(position) {
    if(position < 0 || position > 63)return;
    
    if(factoryLinks.includes(position) === false)return;
    let index = factoryLinks.indexOf(position);
    factoryLinks.splice(index, 1);
    display.postMessage([7, position, "grass" + Math.floor(Math.random() * 5 + 1)]);

    boughtFactories[position] = undefined;

    factories.removeFactory(index);
    for(let i = 0; i < factories.upgradeData.names.length; i++) {
        upgradeNumbers[(position << 6) + i] = 0;
    }
}

function gameLogicTick() {

    
    gameState.hour++;//increases time by 1
    //console.log(gameState.hour);
    display.postMessage([8]);
    UpdateUI();
    if (gameState.hour === 24) { //day end
        //increases gameState.day by 1 and sets gameState.hour to 0 when 24 hours pass
        gameState.hour = 0;
        gameState.day++;


        let GoodsSold  = Math.ceil(ClampMax(PeopleWhoPurcahse(gameState.CostPerGood,EconomyVars.population * gameState.Marketablity,2),gameState.goods));
        gameState.funds += GoodsSold  * gameState.CostPerGood;
        gameState.goods -=  GoodsSold;
        gameState.Debt = gameState.Debt * (1 + (EconomyVars.DebtInfaltionRate / 30));
        if (gameState.funds <= 0) {
            DisplayMesage("Bankrupcy","You lost")
        }
        EconomyVars.ValueOfDollar = Math.pow((1- EconomyVars.InflationRate),gameState.day/365);
        
        //Daily stat update
        EconomyVars.population += EconomyVars.DailyPopInc;
        if ((gameState.day % 90) == 0) {
            EconomyVars.ValueOfDollar = EconomyVars.ValueOfDollar * (EconomyVars.InflationRate *.25);
            EconomyVars.MinimumWage = EconomyVars.MinimumWage * (1 +(EconomyVars.InflationRate *.25));
        }

    }

    
    if (gameState.Debt >= 0) {
        DisplayMesage("YOU WIN","Debt Gone! " + " Your score is " + Math.round(1000 * (0.99 ** gameState.day)) + " points");
    }

    UpdateUI();
    

    if (gameState.hour < 8 & gameState.hour < 20) return;//all factories start working at 8 and end at 20
    const PrevGoods = gameState.goods;
    for (let i = 0; i < factories.length; i++) {

        if (gameState.hour > (7 + factories.getHoursWorked(i))) continue;
        //if it is past working hours, the factory doesn't generate profit or have any cost
        if (factories.getMaxWorkers(i) > factories.getWorkers(i)) {
            if (factories.getTargetWorkerAmount(i) > factories.getWorkers(i)) {
                if (factories.getHourlyPay(i) >= EconomyVars.MinimumWage){
                    if (liveableWage(i) >= 1) {
                        factories.setWorkers(i,factories.getWorkers(i)+1)
                    }
                }
            } 
        }

       
            if ((gameState.hour % factories.getSafetyChecksPerHour(i)) === 0) {
                factories.setSafety(i,factories.getSafety(i) + .01)
                gameState.funds = (gameState.funds - 25)
            }       
            else{
                factories.setSafety(i,factories.getSafety(i) - .01)

            }
        factories.setSafety(i,Clamp01(factories.getSafety(i)))
        
        let cost = factories.getSafety(i) * (.9  + (Math.random() *.2));
        if (cost <= .65) {
            cost = cost * EconomyVars.sewcost;
            DisplayMesage("YOU KILLED somone","you pay $" + cost)
            gameState.funds -= cost
        }
        

        if (factories.getWorkers(i) < factories.getMinWorkers(i)) continue;
        //if there isn't enough workers, the factory doesn't generate profit or have any cost

        gameState.funds -= (factories.getHourlyPay(i) * factories.getWorkers(i))//pays workers

        if (factories.getFactoryType(i) == 2 || factories.getFactoryType(i) == 10) {
            gameState.Marketablity += MarketingAdd(i);
        }
         else{
            gameState.goods += factoryNetProfit(i);
         }   

        if ((factories.getHappiness(i) < 0.5) && (Math.random() > 0.75))
            factories.setWorkers(i, factories.getWorkers(i) - 1);
        //workers start to quit when happiness is too low

        factories.setHappiness(i, factoryHappiness(i));//updates happiness

        factories.setWorkerUnrest(i, factoryUnrest(i));//updates unrest
    }
    gameState.HourlyProduction = (gameState.goods -PrevGoods);
    UpdateUI();
}
function ClampMax(input,max){
    if (input > max) {
        return max;
    }
    else{
        return input;
    }
}
function PeopleWhoPurcahse (Price,MaxPeopleWhoPurchase,PrecevedValue){
    const v = (PrecevedValue/(2* Price))
    return (MaxPeopleWhoPurchase * v)/ ((Price * Price) +v)

}
function MarketingAdd (index){
    return factories.getProduction(index) * HapeinesMultipire(index) * .0000001;
}

function factoryNetProfit(index) {//calculates the net profit eaxh factory generates
    return (
        factories.getProduction(index) * HapeinesMultipire(index)
    ) - factories.getCost(index) //base cost and profit with happiness modifier
        +
        //since this runs each hour, the hourly pay is a cost
        Math.round(
            Math.sqrt(
                (factories.getWorkers(index) - factories.getMinWorkers(index)) /
                (factories.getMaxWorkers(index) - factories.getMinWorkers(index))
            ) *
            //this value indicates how much of the capacity for workers has been filled and is a
            //modifier on production, if the total capacity for workers is filled, then the production
            //is doubled, if only the minimum amount of workers are in the factory, then there is no
            //bonus to production, because of the Math.sqrt, the effect of adding workers decreases
            //with each worker. IMPORTANT: maxWorkers whould always be greater than minWorkers
            factories.getProduction(index) * (factories.getHappiness(index) > 1.25 ? 1.1 : 1)
        );
}
function HapeinesMultipire (index){
 return (factories.getHappiness(index) > 1.25 ? 1.1 : 1);
}
function factoryHappiness(index) {
    
    const Liveibalwage = Clamp01(liveableWage(index));
    return Clamp01(Liveibalwage *((2*EconomyVars.PreferdHours/(factories.getHoursWorked(index) + EconomyVars.PreferdHours))))
    
    //old function
    //return (
    //    (factories.getHappiness(index) * 8) +
    //    (-0.5 + (factories.getHourlyPay(index) / gameState.inflation) * 0.1) +
    //    (1.8 - factories.getHoursWorked(index) * 0.1)
    //) * 0.1;
}//calculates the happiness of each factory

function factoryUnrest(index) {
    return (
        (factories.getWorkerUnrest(index) * 0.999) +
        (factories.getHoursWorked(index) > 12 ? 0.01 : 0) +
        (factories.getHappiness(index) < 0.75 ? 0.01 : 0) +
        (liveableWage(index) < .5 ? 0.01 : 0)
    )
}//calculates the unrest in each factory
function Clamp01(input){
    if (input > 1) {
        return 1;
    }
    if (input < 0) {
        return 0;
    }
    return input;
}
function liveableWage (index){
   return(   (factories.getHourlyPay(index)* factories.getHoursWorked(index))/(EconomyVars.living *24)* (1/EconomyVars.ValueOfDollar))
}

//GAME LOGIC END
