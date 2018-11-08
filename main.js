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
    },
    possibleMatchesMap : [],
    clickTracker: {}

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
function checkForMatchesOnStart(){ // make sure no gems match on game start
    const {directionCheck, gameboardArray, matchesFound, possibleMatchesMap} = globalObj;
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
    enableClickForMatchingGems(possibleMatchesMap);
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
function checkIfValidMoveOnStart(moveObj){ //if any possble matches on build, replace matching gems then recheck
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
    const {directionCheck, gameboardArray, possibleMatchesMap, possibleMatchesRef} = globalObj;
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
    console.log('1', possibleMatchesMap);
}

function lookForMatchesNearby(dataObj){
    const {directionCheck, gameboardArray, oppDirection, possibleMatchesRef, possibleMatchesMap} = globalObj;
    const {startCord, cordToCheck, direction, matches, color} = dataObj
    for ( var key in directionCheck){
        var returnKey = false;
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
        var possible1 = possibleMatchesRef[direction][0];
        var possible2 = possibleMatchesRef[direction][1];

        if(gameboardArray[adjGemY][adjGemX] === color){
            matches[key] = [{'y': adjGemY, 'x': adjGemX}];
            recursiveCheckForAdditional(matches, key, color);
        }
        if(matches[possible1] !== undefined && matches[possible2] !== undefined){
            recursiveCheckForAdditional(matches, possible1, color);
            recursiveCheckForAdditional(matches, possible2, color);
        }
        if(matches[key] === undefined){
            continue;
        }
        
        if((matches[possible1] !== undefined && matches[possible2] !== undefined) || matches[key].length > 1){
            var newMatches = {};
            if(matches[possible1] !== undefined && matches[possible2] !== undefined){
                newMatches[possible1] = matches[possible1];
                newMatches[possible2] = matches[possible2];
            }
            for( var newKey in matches){
                if(newMatches[possible1] !== undefined && newMatches[possible2] !== undefined){
                    if(newKey === possible1 || newKey === possible2){
                        continue;
                    }
                }
                if(matches[newKey].length > 1){
                    newMatches[newKey] = matches[newKey];
                } else {
                    returnKey = true;
                }
            }
            if(returnKey){
                continue;
            }
            var moveMapObj = {'gemToMatch': {'y':startCord.y, 'x': startCord.x},
                              'gemToMove': {'y':cordToCheck.y, 'x': cordToCheck.x},
                              'matchGemDirection': direction,
                              'otherGemsThatMatch': newMatches,
                              'color': color};
            possibleMatchesMap.push(moveMapObj);                    
        }
    }     
}

function recursiveCheckForAdditional(matchObj, direction, color){
    const {directionCheck, gameboardArray} = globalObj;
    if(matchObj[direction].length < 1){
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
    $(".gameboard").on('click', '.click', handleGemClick);
}

function enableClickForMatchingGems(moveMap){
    moveMap.map((item, index)=>{
        $(`.top-div[row=${moveMap[index].gemToMatch.y}][col=${moveMap[index].gemToMatch.x}]`).addClass('click');
        $(`.top-div[row=${moveMap[index].gemToMove.y}][col=${moveMap[index].gemToMove.x}]`).addClass('click');
    })
}
function handleGemClick(){
    const {clickTracker, possibleMatchesMap, gameboardArray} = globalObj;
    if(clickTracker.click1 !== undefined && clickTracker.click2 !== undefined){
        return;
    }
    var matchingGem;
    var movingGem;
    if(clickTracker.click1 === undefined){
        let click1Y = $(this).attr('row');
        let click1X = $(this).attr('col');
        clickTracker['click1'] = {'y': click1Y, 'x': click1X};
    } else {
        let click2Y = $(this).attr('row');
        let click2X = $(this).attr('col');
        clickTracker.click2 = {'y': click2Y, 'x': click2X};
        $('div.click').removeClass('click');
        for(let i = 0; i < possibleMatchesMap.length; i++){
            if((clickTracker.click1.y == possibleMatchesMap[i].gemToMatch.y || clickTracker.click2.y == possibleMatchesMap[i].gemToMatch.y) && (clickTracker.click1.x == possibleMatchesMap[i].gemToMatch.x || clickTracker.click2.x == possibleMatchesMap[i].gemToMatch.x)){
                matchingGem = {'y': possibleMatchesMap[i].gemToMatch.y, 'x': possibleMatchesMap[i].gemToMatch.x, 'index': i};
            };
            if((clickTracker.click1.y == possibleMatchesMap[i].gemToMove.y || clickTracker.click2.y == possibleMatchesMap[i].gemToMove.y) && (clickTracker.click1.x == possibleMatchesMap[i].gemToMove.x || clickTracker.click2.x == possibleMatchesMap[i].gemToMove.x)){
                movingGem = {'y': possibleMatchesMap[i].gemToMove.y, 'x': possibleMatchesMap[i].gemToMove.x};
            }
        }
        var temp = gameboardArray[matchingGem.y][matchingGem.x];
        gameboardArray[matchingGem.y][matchingGem.x] = gameboardArray[movingGem.y][movingGem.x];
        gameboardArray[movingGem.y][movingGem.x] = temp;
        rebuildBoardAfterMove(gameboardArray, possibleMatchesMap[matchingGem.index]);
    }
}

function rebuildBoardAfterMove(gameboardArray, matchDetails){ // could explore changing this part into a addclass remove class kinda function depending on performance
    const gameArea = $('.gameboard');
    gameArea.empty();
    const { gemColorRef, clickTracker, possibleMatchesMap } = globalObj;
    for(let i = 0; i< gameboardArray.length; i++){
        for(let j = 0; j< gameboardArray.length; j++){
            let gemColor = gemColorRef[gameboardArray[i][j]];
            let boardDiv = $('<div>').addClass('gameboard-tile');
            let topDiv = $('<div>').addClass(`top-div ${gemColor}`).attr({'row': i,'col': j});
            boardDiv.append(topDiv);
            gameArea.append(boardDiv);
        }
    }
    console.log(matchDetails);
    clickTracker.click1 = undefined;
    clickTracker.click2 = undefined;
    possibleMatchesMap.splice(0, possibleMatchesMap.length)
    checkIfMovesAvailable();
    enableClickForMatchingGems(possibleMatchesMap);
    causeGemsToShiftDown(matchDetails);
}

function causeGemsToShiftDown(matchingDetails){
    const {possibleMatchesRef} = globalObj;
    var possibleDirections = possibleMatchesRef[matchingDetails.matchGemDirection];
    var filteredData;
    Object.keys(matchingDetails.otherGemsThatMatch).map((item, index)=>{
        if(item === possibleDirections[0] || item === possibleDirections[1]){
            if(filteredData){
                filteredData.cords.push(matchingDetails.otherGemsThatMatch[item]);
            } else {
                filteredData = {'cords' : matchingDetails.otherGemsThatMatch[item], 'direction' : item};
            }    
        } else if (matchingDetails.otherGemsThatMatch[item].length>1){
            filteredData = {'cords' : matchingDetails.otherGemsThatMatch[item], 'direction' : item};
        }
    });
    console.log(filteredData)
}