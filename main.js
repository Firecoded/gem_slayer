$(document).ready(initApp);

function initApp(){
    const {possibleMatchesMap} = globalObj;
    buildGameboardArray(8);
    checkForMatchesOnStart();
    buildGameboard();
    checkIfMovesAvailable();
    filterPossibleMatches(possibleMatchesMap);
    applyClickHandlers();
}

function decideGem(){
    let randomNum = Math.floor(Math.random() * 7);
    let gemArray = Object.keys(globalObj.gemColorRef);
    return gemArray[randomNum];
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
                              'gemsThatMatch': newMatches,
                              'color': color,
                              'addColor': gameboardArray[cordToCheck.y][cordToCheck.x],
                              'mulitMatch': false};
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
// {'gemToMatch': {'y':startCord.y, 'x': startCord.x},  ----- match object structure reference
//                               'gemToMove': {'y':cordToCheck.y, 'x': cordToCheck.x},
//                               'matchGemDirection': direction,
//                               'gemsThatMatch': newMatches,
//                               'color': color,
//                               'addColor': gameboardArray[cordToCheck.y][cordToCheck.x],
//                               'mulitMatch': false};

function filterPossibleMatches(matchesArr){
    console.log(matchesArr)
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
            if(gemToMatchIY == gemToMoveJY && gemToMatchIX == gemToMoveJX && gemToMatchJX == gemToMoveIX && gemToMatchJY == gemToMoveIY){
                    matchesArr[i]['addGemDirection'] = matchesArr[j].matchGemDirection;
                    matchesArr[i]['addGemsThatMatch'] = matchesArr[j].gemsThatMatch;
                    matchesArr[i]['addColor'] = matchesArr[j].color;
                    matchesArr[i].mulitMatch = true;
                    matchesArr[i].ref = matchesArr[j];
                    spliceFlag = true;        
            }
            if(gemToMatchIY == gemToMatchJY && gemToMatchIX == gemToMatchJX && gemToMoveJX == gemToMoveIX && gemToMoveJY == gemToMoveIY){
                //matchesArr[i]['addGemsThatMatch2'] = matchesArr[j].gemsThatMatch;
                matchesArr[i].ref = matchesArr[j];
                for (let key in directionCheck){
                    if(matchesArr[i].gemsThatMatch[key] === undefined && matchesArr[j].gemsThatMatch[key] !== undefined){
                        matchesArr[i].gemsThatMatch[key] = matchesArr[j].gemsThatMatch[key];
                    }
                    if(matchesArr[i].gemsThatMatch[key] !== undefined && matchesArr[j].gemsThatMatch[key] !== undefined){
                        matchesArr[i].gemsThatMatch[key].push(matchesArr[j].gemsThatMatch[key]);
                    }
                }
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
        $(`.top-div[row=${moveMap[index].gemToMatch.y}][col=${moveMap[index].gemToMatch.x}]`).addClass('click');
        $(`.top-div[row=${moveMap[index].gemToMove.y}][col=${moveMap[index].gemToMove.x}]`).addClass('click');
    })
}
function handleGemClick(){
    const {clickTracker, possibleMatchesMap, gameboardArray} = globalObj;
    if(clickTracker.click1 !== undefined && clickTracker.click2 !== undefined){
        return;
    }
    if(clickTracker.click1 === undefined){
        let click1Y = $(this).attr('row');
        let click1X = $(this).attr('col');
        clickTracker['click1'] = {'y': click1Y, 'x': click1X};
    } else {
        let click2Y = $(this).attr('row');
        let click2X = $(this).attr('col');
        clickTracker.click2 = {'y': click2Y, 'x': click2X};
        $('div.click').removeClass('click');
        changeArrayAndGems(clickTracker);
        prepareForNextMatch();
    }
    console.log(clickTracker)
}
// addColor: "r"
// addGemDirection: "left"
// addGemsThatMatch:
// up: (2) [{…}, {…}]
// __proto__: Object
// color: "g"
// gemToMatch: {y: 2, x: 1}
// gemToMove: {y: 2, x: 2}
// gemsThatMatch: {up: Array(2)}
// matchGemDirection: "right"
// mulitMatch: true
// ref: {gemToMatch: {…}, gemToMove: {…}, matchGemDirection: "left", gemsThatMatch: {…}, color: "r", …}
// __proto__: Object

function changeArrayAndGems(clickTracker){
    const {gameboardArray, gemColorRef, clickTracker} = globalObj;
    
    
    
    let color1 = gameboardArray[matchingObj.y][matchingObj.x];
    let color2 = gameboardArray[movingObj.y][movingObj.x];
    gameboardArray[matchingObj.y][matchingObj.x] = color2;
    gameboardArray[movingObj.y][movingObj.x] = color1;
    $(`.top-div[row=${matchingObj.y}][col=${matchingObj.x}]`).removeClass(gemColorRef[color1]);
    $(`.top-div[row=${movingObj.y}][col=${movingObj.x}]`).removeClass(gemColorRef[color2]);
    $(`.top-div[row=${matchingObj.y}][col=${matchingObj.x}]`).addClass(gemColorRef[color2]);
    $(`.top-div[row=${movingObj.y}][col=${movingObj.x}]`).addClass(gemColorRef[color1]);
}

function prepareForNextMatch(){
    const { gemColorRef, clickTracker, possibleMatchesMap } = globalObj;
    clickTracker.click1 = undefined;
    clickTracker.click2 = undefined;
    possibleMatchesMap.splice(0, possibleMatchesMap.length)
    checkIfMovesAvailable();
    enableClickForMatchingGems(possibleMatchesMap);
    //causeGemsToShiftDown(matchDetails);
}


// function causeGemsToShiftDown(matchingDetails){
//     const {possibleMatchesRef} = globalObj;
//     var possibleDirections = possibleMatchesRef[matchingDetails.matchGemDirection];
//     var filteredData;
//     Object.keys(matchingDetails.otherGemsThatMatch).map((item, index)=>{
//         if(item === possibleDirections[0] || item === possibleDirections[1]){
//             if(filteredData){
//                 filteredData.cords.push(matchingDetails.otherGemsThatMatch[item]);
//             } else {
//                 filteredData = {'cords' : matchingDetails.otherGemsThatMatch[item], 'direction' : item};
//             }    
//         } else if (matchingDetails.otherGemsThatMatch[item].length>1){
//             filteredData = {'cords' : matchingDetails.otherGemsThatMatch[item], 'direction' : item};
//         }
//     });
//     console.log(filteredData)
// }