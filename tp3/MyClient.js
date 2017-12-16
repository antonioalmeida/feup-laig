/**
 * MyClient
 * @constructor
 */
 function MyClient(port) {
    this.port = port || 8081;

    this.defaultOnSuccess = function(data) {
        console.log('Reques successful. Reply ' + data.target.response);
    }
    this.defaultOnError = function(data) {
        console.log('Error waiting for response');
    }
};

MyClient.prototype.constructor = MyClient;

MyClient.prototype.getPrologRequest = function (requestString, onSuccess, onError) {
    let request = new XMLHttpRequest();
    let url = 'http://localhost:' + this.port + '/' + requestString;
    console.log(url);
    request.open('GET', 'http://localhost:' + this.port + '/' + requestString, true);

    request.onload = onSuccess || this.defaultOnSuccess;
    request.onerror = onError || this.defaultOnError;

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
}

MyClient.prototype.makeRequest = function (request, args) {
    //TODO: add request value confirmation
    let callback;
    let requestString = '';

    switch(request) {
        case 'startGame':
            // sample request, need to create parsing JS->Prolog
            requestString = 'initGame(noPlayer,1,2)';
            onSuccess = startGameListener;
            break;
        case 'handshake':
            requestString = 'handshake';
            break;
    }

    // Make Request
    this.getPrologRequest(requestString, onSuccess);
}

function startGameListener(data) {
    let dataArr = JSON.parse(data.target.response);
    let game = {};

    game.board = dataArr[0];
    game.currentPlayer = dataArr[1];
    game.turnCounter = dataArr[2];

    // Not sure if we'll need these
    game.whiteAttacked = dataArr[3];
    game.blackAttacked = dataArr[4];

    // only useful for single player
    game.AIPlayer = dataArr[5]; 

    game.movesList = dataArr[6]; 

    // maybe use these to improve UX when user needs to choose queen?
    game.whiteNeedsQueen = dataArr[7];
    game.blackNeedsQueen = dataArr[8];

    game.isOver = dataArr[9];
    game.mode = dataArr[10];
    game.difficulty = dataArr[11];

    console.log(game);

    //Add this to game class
    return game;
}
