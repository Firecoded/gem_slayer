$(document).ready(initApp);

function initApp(){
    const {possibleMatchesMap} = globalObj;
    buildGameboardArray(8);
    checkForMatchesOnStart();
    buildGameboard();
    checkIfMovesAvailable();
    filterPossibleMatches(possibleMatchesMap);
    enableClickForMatchingGems(possibleMatchesMap);
    applyClickHandlers();
}

function decideGem(){
    let randomNum = Math.floor(Math.random() * 7);
    let gemArray = Object.keys(globalObj.gemColorRef);
    return gemArray[randomNum];
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
        //console.log('matches1', matches, startCord)
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
            //console.log('newmatches', newMatches, 'key', key, 'newkey', newKey)
            // if(returnKey){
            //     continue;
            // }
            
            var moveMapObj = {'gemToMatch': {'y':startCord.y, 'x': startCord.x},
                              'gemToMove': {'y':cordToCheck.y, 'x': cordToCheck.x},
                              'matchGemDirection': direction,
                              'gemsThatMatch': newMatches,
                              'color': color,
                              'addColor': gameboardArray[cordToCheck.y][cordToCheck.x],
                              'multiMatch': false};
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
        var lenMinus1 = matchObj[direction].length-1
        var adjGemY = matchObj[direction][lenMinus1].y + directionCheck[direction].y;
        var adjGemX = matchObj[direction][lenMinus1].x + directionCheck[direction].x;
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
// {'gemToMatch': {'y':startCord.y, 'x': startCord.x},  ----- match object structure reference
//                               'gemToMove': {'y':cordToCheck.y, 'x': cordToCheck.x},
//                               'matchGemDirection': direction,
//                               'gemsThatMatch': newMatches,
//                               'color': color,
//                               'addColor': gameboardArray[cordToCheck.y][cordToCheck.x],
//                               'multiMatch': false};

function filterPossibleMatches(matchesArr){
    console.log('beforefilter', matchesArr)
    const {directionCheck} = globalObj;
    for(let i = 0; i<matchesArr.length-1; i++){
        for(let j = i+1; j < matchesArr.length; j++){
            let spliceFlag = false;
            let gemToMatchIY = matchesArr[i].gemToMatch.y;
            let gemToMatchIX = matchesArr[i].gemToMatch.x
            let gemToMatchJY = matchesArr[j].gemToMatch.y;
            let gemToMatchJX = matchesArr[j].gemToMatch.x;
            let gemToMoveIY = matchesArr[i].gemToMove.y;
            let gemToMoveIX = matchesArr[i].gemToMove.x
            let gemToMoveJY = matchesArr[j].gemToMove.y;
            let gemToMoveJX = matchesArr[j].gemToMove.x;
            if(gemToMatchIY == gemToMatchJY && gemToMatchIX == gemToMatchJX && gemToMoveJX == gemToMoveIX && gemToMoveJY == gemToMoveIY){
                matchesArr[i].ref = matchesArr[j];
                for (let key in directionCheck){
                    if(matchesArr[i].gemsThatMatch[key] === undefined && matchesArr[j].gemsThatMatch[key] !== undefined){
                        matchesArr[i].gemsThatMatch[key] = matchesArr[j].gemsThatMatch[key];
                    }
                    if(matchesArr[i].gemsThatMatch[key] !== undefined && matchesArr[j].gemsThatMatch[key] !== undefined){
                        matchesArr[j].gemsThatMatch[key].concat(matchesArr[j].gemsThatMatch[key]);
                    }
                }
                spliceFlag = true;
            }
            if(gemToMatchIY == gemToMoveJY && gemToMatchIX == gemToMoveJX && gemToMatchJX == gemToMoveIX && gemToMatchJY == gemToMoveIY){
                    matchesArr[i]['addGemDirection'] = matchesArr[j].matchGemDirection;
                    matchesArr[i]['addGemsThatMatch'] = matchesArr[j].gemsThatMatch;
                    matchesArr[i]['addColor'] = matchesArr[j].color;
                    matchesArr[i].multiMatch = true;
                    matchesArr[i].ref = matchesArr[j];
                    spliceFlag = true;        
            }
            if(spliceFlag){
                matchesArr.splice(j, 1);
            }        
        }
    }
    console.log(matchesArr)
}

function enableClickForMatchingGems(moveMap){
    moveMap.map((item, index)=>{
        $(`.top-div[row=${item.gemToMatch.y}][col=${item.gemToMatch.x}]`).addClass('click');
        $(`.top-div[row=${item.gemToMove.y}][col=${item.gemToMove.x}]`).addClass('click');
    })
}
function handleGemClick(){
    const {clickTracker, possibleMatchesMap, gameboardArray} = globalObj;
    if(clickTracker.click1 !== undefined && clickTracker.click2 !== undefined){
        return;
    }
    let clickY = $(this).attr('row');
    let clickX = $(this).attr('col');
    $(`.top-div[row=${clickY}][col=${clickX}]`).addClass('highlight');
    if(clickTracker.click1 === undefined){    
        clickTracker['click1'] = {'y': clickY, 'x': clickX};
    } else {
        clickTracker.click2 = {'y': clickY, 'x': clickX};
        changeArrayAndGems(clickTracker, possibleMatchesMap);
        prepareForNextMatch();
    }
    //console.log(clickTracker)
}

function changeArrayAndGems(clickTracker, moveMap){
    const {gameboardArray, gemColorRef} = globalObj;
    const {click1, click2} = clickTracker;
    moveMap.map((item, index)=>{
        if(item.gemToMatch.y == click1.y && item.gemToMatch.x == click1.x){
            if(item.gemToMove.y == click2.y && item.gemToMove.x == click2.x){
                clickTracker.match = item;
            }
        }
        if(item.gemToMatch.y == click2.y && item.gemToMatch.x == click2.x){
            if(item.gemToMove.y == click1.y && item.gemToMove.x == click1.x){
                clickTracker.match = item;
            }
        }
    })
    $('.top-div').removeClass('highlight');
    if(!clickTracker.match){
        clickTracker.click1 = undefined;
        clickTracker.click2 = undefined;
        return;
    }
    $('div.click').removeClass('click');
    let gemMatch = clickTracker.match.gemToMatch;
    let gemMove = clickTracker.match.gemToMove;
    if(clickTracker.match.multiMatch){        
        gameboardArray[gemMatch.y][gemMatch.x] = '';
        gameboardArray[gemMove.y][gemMove.x] = '';
        $(`.top-div[row=${gemMatch.y}][col=${gemMatch.x}]`).removeClass(gemColorRef[clickTracker.match.color]);
        $(`.top-div[row=${gemMove.y}][col=${gemMove.x}]`).removeClass(gemColorRef[clickTracker.match.addColor]);
        $(`.top-div[row=${gemMatch.y}][col=${gemMatch.x}]`).addClass('match');
        $(`.top-div[row=${gemMove.y}][col=${gemMove.x}]`).addClass('match');
    } else {
        gameboardArray[gemMatch.y][gemMatch.x] = clickTracker.match.addColor;
        gameboardArray[gemMove.y][gemMove.x] = '';
        $(`.top-div[row=${gemMatch.y}][col=${gemMatch.x}]`).removeClass(gemColorRef[clickTracker.match.color]);
        $(`.top-div[row=${gemMove.y}][col=${gemMove.x}]`).removeClass(gemColorRef[clickTracker.match.addColor]);
        $(`.top-div[row=${gemMatch.y}][col=${gemMatch.x}]`).addClass(gemColorRef[clickTracker.match.addColor]);
        $(`.top-div[row=${gemMove.y}][col=${gemMove.x}]`).addClass('match');
    }
    changeOtherMatchingGems(clickTracker.match);    
}

function changeOtherMatchingGems(match){
    console.log('matching', match)
    const {gameboardArray, gemColorRef} = globalObj;
    if(!match.multiMatch){
        for(let key in match.gemsThatMatch){
            if(match.gemsThatMatch[key] !== undefined){
                match.gemsThatMatch[key].map((item, index)=>{
                    gameboardArray[item.y][item.x] = '';
                    $(`.top-div[row=${item.y}][col=${item.x}]`).removeClass(gemColorRef[match.color]);
                    $(`.top-div[row=${item.y}][col=${item.x}]`).addClass('match');
                })
            }
        }
    } else {
        for(let key in match.gemsThatMatch){
            if(match.gemsThatMatch[key] !== undefined){
                match.gemsThatMatch[key].map((item, index)=>{
                    gameboardArray[item.y][item.x] = '';
                    $(`.top-div[row=${item.y}][col=${item.x}]`).removeClass(gemColorRef[match.color]);
                    $(`.top-div[row=${item.y}][col=${item.x}]`).addClass('match');
                })
            }
        }
        for(let key in match.addGemsThatMatch){
            if(match.addGemsThatMatch[key] !== undefined){
                match.addGemsThatMatch[key].map((item, index)=>{
                    gameboardArray[item.y][item.x] = '';
                    $(`.top-div[row=${item.y}][col=${item.x}]`).removeClass(gemColorRef[match.addColor]);
                    $(`.top-div[row=${item.y}][col=${item.x}]`).addClass('match');
                })
            }
        }
    }
}
var repeat = false;
function prepareForNextMatch(){
    const { clickTracker, possibleMatchesMap } = globalObj;
    clickTracker.click1 = undefined;
    clickTracker.click2 = undefined;
    checkForMatchesAfterMatch();
    causeGemsToShiftDown();   
}
function completeAfterGemShift(){
    const {possibleMatchesMap} = globalObj;
    checkForMatchesAfterMatch(true);
    possibleMatchesMap.splice(0, possibleMatchesMap.length)
    checkIfMovesAvailable();
    enableClickForMatchingGems(possibleMatchesMap);
}

function causeGemsToShiftDown(){
    let repeatGem = false;
    setTimeout(()=>{
            setTime()
        }, 500)
    function setTime(){
        repeatGem=false
        const {gameboardArray, gemColorRef} = globalObj;
        for(let i = gameboardArray.length-1; i > -1; i--){
            for(let j = gameboardArray.length-1; j > -1; j--){
                if(gameboardArray[i][j] === ''){
                    repeatGem = true;
                    if(checkOffBoard(i-1)){
                        gameboardArray[i][j] = decideGem();
                        $(`.top-div[row=${i}][col=${j}]`).removeClass('match');
                        $(`.top-div[row=${i}][col=${j}]`).addClass(gemColorRef[gameboardArray[i][j]]);
                    } else {
                        if(gameboardArray[i-1][j] === ''){
                           var color = 'match' 
                        } else {
                           var color = gameboardArray[i-1][j]
                        }
                        gameboardArray[i][j] = gameboardArray[i-1][j]
                        $(`.top-div[row=${i}][col=${j}]`).removeClass('match');
                        $(`.top-div[row=${i}][col=${j}]`).addClass(gemColorRef[color]);
                        gameboardArray[i-1][j] = '';
                        $(`.top-div[row=${i-1}][col=${j}]`).removeClass(gemColorRef[color]);
                        $(`.top-div[row=${i-1}][col=${j}]`).addClass('match');
                    } 
                }
            }
        }
        if(repeatGem){
            causeGemsToShiftDown();
        } else {
            completeAfterGemShift();
        }
    }
    
    
    
}
function checkOffBoard(number){
    if(number < 0 || number > globalObj.gameboardArray.length-1){
        return true;
    }
    return false;
}

function checkForMatchesAfterMatch(boolean){
    const {directionCheck, gameboardArray} = globalObj;
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
                    checkForMatchesFurther(i, j, adjGemY, adjGemX, key, {}, gameboardArray[i][j])
                }
            }    
        }
    }
    
}
function checkForMatchesFurther(startY, startX, nextY, nextX, direction, matchTracker, color){
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
        checkForMatchesFurther(startY, startX, adjGemY, adjGemX, direction, matchTracker, color)
    } else {
        checkIfValidMove(matchTracker[direction]);
    }
}
function checkIfValidMove(moveObj){
    let flag = false;
    const {gameboardArray, gemColorRef} = globalObj;
    if (moveObj.count < 3){    
        return;
    }
    console.log('before YIKES', moveObj)
    for(let i = 0; i<moveObj.count; i++){
        let current = moveObj.cordArr[i];
        if(gameboardArray[current.y][current.x] !== ''){
            flag = true;
            console.log('after YIKES', moveObj)
            gameboardArray[current.y][current.x] = '';
            $(`.top-div[row=${current.y}][col=${current.x}]`).removeClass(gemColorRef[moveObj.color]);
            $(`.top-div[row=${current.y}][col=${current.x}]`).addClass('match');
        }
    }
    console.log('gemshift', flag)
    if(flag){
        causeGemsToShiftDown();
    }    
}

