/**
 * MyClient
 * @constructor
 * @param port - Port to make requests to
 */
 function MyClient(port) {
    this.port = port || 8081;

    this.defaultOnSuccess = function(data) {
        console.log('Request successful. Reply ' + data.target.response);
    }
    this.defaultOnError = function(data) {
        console.log('Error waiting for response');
    }
};

MyClient.prototype.constructor = MyClient;

/**
 * Makes a request to the prolog server
 * @param {string} requestString - request to be made
 * @param onSuccess - callback for when request is successful
 * @param onError - callback for when request is not successful
 */
MyClient.prototype.makeRequest = function (requestString, onSuccess, onError) {
    let request = new XMLHttpRequest();
    let url = 'http://localhost:' + this.port + '/' + requestString;
    console.log(url);
    request.open('GET', 'http://localhost:' + this.port + '/' + requestString, true);

    request.onload = onSuccess || this.defaultOnSuccess;
    request.onerror = onError || this.defaultOnError;

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();
}
