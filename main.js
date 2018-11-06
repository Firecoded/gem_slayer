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
    matchesFound : false,
    oppDirection : {
        'up': 'down',
        'right': 'left',
        'down' : 'up',
        'left' : 'right'
    },
    possibleMatchesRef : {
        'up': ['left', 'right'],
        'down': ['left', 'right'],
        'left': ['up', 'down'],
        'right': ['up', 'down']
    }
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
                    checkFurtherOnStart(i, j, adjGemY, adjGemX, key, {}, gameboardArray[i][j])
                }
            }    
        }
    }
    if(matchesFound){
        matchesFound = false;
        checkForMatchesOnStart();
    }
    buildGameboard();
    checkIfMovesAvailable();
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
function checkFurtherOnStart(startY, startX, nextY, nextX, direction, matchTracker, color){
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
        checkFurtherOnStart(startY, startX, adjGemY, adjGemX, direction, matchTracker)
    } else {
        checkIfValidMoveOnStart(matchTracker[direction]);
    }
}
function checkIfValidMoveOnStart(moveObj){
    // console.log(moveObj)
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

function checkIfMovesAvailable(){
    const {directionCheck, gameboardArray} = globalObj;
    for(let i = 0; i< gameboardArray.length; i++){
        for(let j = 0; j< gameboardArray.length; j++){
            for ( var key in directionCheck){
                var adjGemY = i + directionCheck[key].y;
                var adjGemX = j + directionCheck[key].x;
                if(checkOffBoard(adjGemY)){
                    continue;
                }
                if(checkOffBoard(adjGemX)){
                    continue;
                }
                lookForMatchesNearby({'startCord': {'y': i, 'x': j}, 
                                    'cordToCheck': {'y': adjGemY, 'x': adjGemX}, 
                                    'color': gameboardArray[i][j], 
                                    'matches' : {}, 
                                    'direction' : key})
            }    
        }
    }
}

function lookForMatchesNearby(dataObj){
    const {directionCheck, gameboardArray, oppDirection, possibleMatchesRef} = globalObj;
    const {cordToCheck, direction, matches, color} = dataObj
    for ( var key in directionCheck){
        var adjGemY = cordToCheck.y + directionCheck[key].y;
        var adjGemX = cordToCheck.x + directionCheck[key].x;
        if(checkOffBoard(adjGemY)){
            continue;
        }
        if(checkOffBoard(adjGemX)){
            continue;
        }
        if(key === oppDirection[direction]){
            continue;
        }
        if(gameboardArray[adjGemY][adjGemX] === color){
            matches[key] = [{'y': adjGemY, 'x': adjGemX}];
            recursiveCheckForAdditional(matches, key, color);
        }
        if(matches[possibleMatchesRef[direction][0]] !== undefined && matches[possibleMatchesRef[direction][1]] !== undefined){
            recursiveCheckForAdditional(matches, possibleMatchesRef[direction][0], color);
            recursiveCheckForAdditional(matches, possibleMatchesRef[direction][1], color);
        }
        if(matches[key] === undefined){
            continue;
        }
        if((matches[possibleMatchesRef[direction][0]] !== undefined && matches[possibleMatchesRef[direction][1]] !== undefined) || matches[key].length > 1){
            console.log('possible match?:', dataObj);
        }
    }
     
}

function recursiveCheckForAdditional(matchObj, direction, color){
    const {directionCheck, gameboardArray} = globalObj;
    if(matchObj[direction.length] < 1){
        var adjGemY = matchObj[direction].y + directionCheck[direction].y;
        var adjGemX = matchObj[direction].x + directionCheck[direction].x;
    } else {
        var adjGemY = matchObj[direction][matchObj[direction].length-1].y + directionCheck[direction].y;
        var adjGemX = matchObj[direction][matchObj[direction].length-1].x + directionCheck[direction].x;
    }
    if(checkOffBoard(adjGemY)){
        return;
    }
    if(checkOffBoard(adjGemX)){
        return;
    }
    if(gameboardArray[adjGemY][adjGemX] === color){    
        matchObj[direction].push({'y': adjGemY, 'x': adjGemX})
        recursiveCheckForAdditional(matchObj, direction, color)
    }
    return;
}




function applyClickHandlers(){

}