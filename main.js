$(document).ready(initApp);

function initApp(){
    buildGameboardArray(8);
    applyClickHandlers();
}

const globalObj = {
    gameboardArray : [],
    gemColorRef : {
        'r' : 'red',
        'b' : 'blue',
        'g' : 'green',
        'y' : 'yellow',
        'br': 'brown',
        'p' : 'purple',
        'x' : 'bomb'
    },
    directionCheck : {
        'up': {'y': -1, 'x': 0},
        'right': {'y': 0, 'x': 1},
        'down' : {'y': 1, 'x': 0},
        'left' : {'y': 0, 'x': -1}
    },
    matchesFound : false
}

function buildGameboardArray(size){
    for(let i = 0; i<size; i++){
        let array = [];
        globalObj.gameboardArray.push(array);
        for(let j = 0; j<size; j++){
            let temp = decideGem();
            globalObj.gameboardArray[i].push(temp);
        }
    }
    checkForMatchesOnStart();
}

function decideGem(){
    let randomNum = Math.floor(Math.random() * 7);
    let gemArray = Object.keys(globalObj.gemColorRef);
    return gemArray[randomNum];
}
function buildGameboard(){
    const gameArea = $('.gameboard');
    const { gameboardArray, gemColorRef } = globalObj;
    for(let i = 0; i< gameboardArray.length; i++){
        for(let j = 0; j< gameboardArray.length; j++){
            let gemColor = gemColorRef[gameboardArray[i][j]];
            let boardDiv = $('<div>').addClass('gameboard-tile');
            let topDiv = $('<div>').addClass(`top-div ${gemColor}`).attr({'row': i,'col': j});
            boardDiv.append(topDiv);
            gameArea.append(boardDiv);
        }
    }
}
function checkForMatchesOnStart(){
    const {directionCheck, gameboardArray, matchesFound} = globalObj;
    for(let i = 0; i< gameboardArray.length; i++){
        for(let j = 0; j< gameboardArray.length; j++){
            for ( var key in directionCheck){
                let adjGemY = i + directionCheck[key].y;
                let adjGemX = j + directionCheck[key].x;
                if(checkOffBoard(adjGemY)){
                    continue;
                }
                if(checkOffBoard(adjGemX)){
                    continue;
                }
                if(gameboardArray[i][j] === gameboardArray[adjGemY][adjGemX]){
                    checkFurther(i, j, adjGemY, adjGemX, key, {}, gameboardArray[i][j])
                }
            }    
        }
    }
    buildGameboard();
    if(matchesFound){
        matchesFound = false;
        checkForMatchesOnStart();
    }
}
function checkFurther(startY, startX, nextY, nextX, direction, matchTracker, color){
    const {directionCheck, gameboardArray} = globalObj;
    let adjGemY = nextY + directionCheck[direction].y;
    let adjGemX = nextX + directionCheck[direction].x;
    if(checkOffBoard(adjGemY)){
        return;
    }
    if(checkOffBoard(adjGemX)){
        return;
    }
    if(matchTracker[direction] === undefined){
        matchTracker[direction] = {'count': 2, 
            'cordArr': [{'y' : startY, 'x': startX}, {'y': nextY, 'x': nextX}], 'color': color}
    } else {
        matchTracker[direction].count++
        matchTracker[direction].cordArr.push({'y': nextY, 'x': nextX});
    }
    if(gameboardArray[startY][startX] === gameboardArray[adjGemY][adjGemX]){
        checkFurther(startY, startX, adjGemY, adjGemX, direction, matchTracker)
    } else {
        checkIfValidMove(matchTracker[direction]);
    }
}

function checkIfValidMove(moveObj){
    console.log(moveObj)
    const {gameboardArray} = globalObj;
    if (moveObj.count < 3){    
        return;
    }
    globalObj.matchesFound = true;
    for(let i = 0; i < moveObj.count; i++){
        gameboardArray[moveObj.cordArr[i].y][moveObj.cordArr[i].x] = decideGem();
    }    
}

function checkOffBoard(number){
    if(number<0 || number>globalObj.gameboardArray.length-1){
        return true;
    }
    return false;
}
function applyClickHandlers(){

}