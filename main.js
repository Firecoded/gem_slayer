$(document).ready(initApp);

function initApp(){
    buildGameboardArray(8);
    buildGameboard();
    applyClickHandlers();
}

const globalObj = {
    gameboardArray : [],
    gemColorRef : {
        'r' : 'red',
        'b' : 'blue',
        'g' : 'green',
        'y' : 'yellow',
        'x' : 'bomb'
    }, 
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

function decideGem(){
    let randomNum = Math.floor(Math.random() * 5);
    let gemArray = Object.keys(globalObj.gemColorRef);
    return gemArray[randomNum];
}
function buildGameboard(){
    const gameArea = $('.gameboard');
    const { gameboardArray, gemColorRef } = globalObj;
    for(var i = 0; i< gameboardArray.length; i++){
        for(var j = 0; j< gameboardArray.length; j++){
            let gemColor = gemColorRef[gameboardArray[i][j]];
            var boardDiv = $('<div>').addClass('gameboard-tile');
            var topDiv = $('<div>').addClass(`top-div ${gemColor}`).attr({'row': i,'col': j});
            boardDiv.append(topDiv);
            gameArea.append(boardDiv);
        }
    }
}
function applyClickHandlers(){

}