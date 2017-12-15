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
    let argsStr = args.toString();

    switch(request) {
        case 'startGame':
            requestString = 'initGame(' + argsStr + ')';
            onSuccess = startGameOnSuccess;
            break;
        case 'handshake':
            requestString = 'handshake';
            onSuccess = startGameListener;
            break;
    }

    // Make Request
    this.getPrologRequest(requestString, onSuccess);
}

function startGameOnSuccess(data) {
    console.log(typeof data.target.response);
    console.log('Received startGame response: ' + data.target.response);
    console.log(JSON.parse(data.target.response));
}

