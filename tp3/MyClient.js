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

function getPrologRequest(requestString, onSuccess, onError) {
    let request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:' + this.port + '/' + requestString, true);

    request.onload = onSuccess || this.defaultOnSuccess;
    request.onerror = onError || this.defaultOnError;

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
}

function makeRequest(request) {
    //TODO: add request value confirmation
    // maybe add a different callback function
    // depending on the type of request?
    let callback = handleReply;


    // Make Request
    getPrologRequest(request, callback);
}

//Handle the Reply
function handleReply(data){
    console.log('Sample reply handling. Data: ' + data);
}
