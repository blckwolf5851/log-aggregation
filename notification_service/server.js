// a websocket server for receiving alert, write to elastic search

var WebSocketServer = require('websocket').server;
var http = require('http');
const topic = "alerts"
var kafka = require('kafka-node');
var Consumer = kafka.Consumer,
    client = new kafka.KafkaClient({kafkaHost: 'localhost:9092'})
    // consumer = new Consumer(client, [{ topic: topic, partition: 0 }], { autoCommit: true, groupId: topic}),
    consumer = new Consumer(client, [{ topic: topic, partition: 0 }], { autoCommit: false, groupId: topic, fromOffset: "latest"});
    // consumer = new Consumer(client, [{ topic: topic, partition: 0 }], { groupId: topic, fromOffset: "earliest"});

var server = http.createServer(function (request, response) {
    console.log(' Request recieved : ' + request.url);
    response.writeHead(404);
    response.end();
});

// TODO: caching solution https://www.npmjs.com/package/node-cache (MAYBE DONT NEED THIS)
// TODO: long term storage of query state (https://www.npmjs.com/package/node-localstorage)

// TODO subscribe to multiple topic with groupid.


server.listen(8081, function () {
    console.log('Listening on port : 8081');
});

webSocketServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});


function iSOriginAllowed(origin) {
    return true;
}


webSocketServer.on('request', function (request) {
    // reject connection if now allowed
    if (!iSOriginAllowed(request.origin)) {
        request.reject();
        console.log('Connection from : ' + request.origin + ' rejected.');
        return;
    }

    // loop through the list of consumer and send messages to connections that subscribed to it.
    

    // accept remote connection
    var connection = request.accept('echo-protocol', request.origin);
    console.log('Connection accepted : ' + request.origin);
    // var consumer = new Consumer(client, [{ topic: topic, partition: 0 }], { autoCommit: false, groupId: topic, fromOffset: "earliest"});
    console.log('New consumer started : ' + request.origin);

    var email = ''

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log(message.utf8Data)
            email = message.utf8Data
            console.log("Email for client " + request.origin + " set to " + email);
        } else {
            console.log("Received message is not UTF-8 type")
        }

    });

    consumer.on('message', function (message) {
        // parse log into json, and its timestamp into Date
        console.log(message);
        connection.sendUTF(message.value);
        // const log = JSON.parse(message.value);
        // log.timestamp = new Date(log.timestamp)
    
    });
    

    // close connection
    connection.on('close', function (reasonCode, description) {
        console.log('Connection ' + request.origin + ' disconnected.');
    });
});



