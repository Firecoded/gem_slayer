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
}

function checkForMatchesOnStart(){ // make sure no gems match on game start
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
                    checkFurtherOnStart(i, j, adjGemY, adjGemX, key, {}, gameboardArray[i][j])
                }
            }    
        }
    }
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
        checkFurtherOnStart(startY, startX, adjGemY, adjGemX, direction, matchTracker, color)
    } else {
        checkIfValidMoveOnStart(matchTracker[direction]);
    }
}
function checkIfValidMoveOnStart(moveObj){ //if any possble matches on build, replace matching gems then recheck
    const {gameboardArray} = globalObj;
    if (moveObj.count < 3){    
        return;
    }
    
    for(let i = 0; i < moveObj.count; i++){
        let tempCord = moveObj.cordArr[i];
        gameboardArray[tempCord.y][tempCord.x] = decideGem();
    }
    checkForMatchesOnStart();   
}
