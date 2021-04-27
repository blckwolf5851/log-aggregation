var WebSocketServer = require('websocket').server;
var http = require('http');

var kafka = require('kafka-node');
var Consumer = kafka.Consumer,
    client = new kafka.KafkaClient("localhost:9092")
// consumer = new Consumer(
//     client, [{ topic: 'Eventarc', partition: 0 }], { autoCommit: false });

var server = http.createServer(function (request, response) {
    console.log(' Request recieved : ' + request.url);
    response.writeHead(404);
    response.end();
});

// TODO subscribe to multiple topic with groupid.

var topic2Consumer = {} // keep track of the consumer object
var topic2Connections = {} // keep track of the websocket clieint connections corresponding to each topic

server.listen(8080, function () {
    console.log('Listening on port : 8080');
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

    // accept remote connection
    var connection = request.accept('echo-protocol', request.origin);
    var connectionIndices = {} // topic 2 index mapping, keeping track of index of the clients to remove

    console.log('Connection accepted : ' + request.origin);
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            var consumerCreationSucceed = true;
            const topic = message.utf8Data
            // subscribe to new kafka topic if not subscribed already
            console.log('Creating kafka topic: ' + topic);
            if (topic in topic2Consumer) {
                console.log("Topic \"" + topic + "\" already exist")
            } else {
                // create a new kafka consumer if topic valid
                try {
                    var new_consumer = new Consumer(
                        client, [{ topic: topic, partition: 0 }], { autoCommit: false });
                    topic2Consumer[topic] = new_consumer
                } catch (err) {
                    console.log("Failed to create topic: " + err.message)
                    consumerCreationSucceed = false;
                }
            }
            // let connection subscribe to the kafka topic if have not already, but only if the consumer creation succeeed
            if (consumerCreationSucceed) {
                console.log("Adding connection: " + request.origin + " to subscriber list")
                if (topic in topic2Connections) {
                    var already_exist = false;
                    if (topic in connectionIndices) {
                        console.log("Connection already subscribed to topic")
                        already_exist = true;
                    }
                    if (!already_exist)
                        topic2Connections[topic].push(connection)
                    connectionIndices[topic] = topic2Connections[topic].length - 1
                } else {
                    topic2Connections[topic] = [connection]
                    connectionIndices[topic] = 0
                }
            }
        } else {
            console.log("Received message is not UTF-8 type")
        }

    });

    // loop through the list of consumer and send messages to connections that subscribed to it.
    for (const [topic, consumer] of Object.entries(topic2Consumer)) {
        consumer.on('message', function (message) {
            console.log(message);
            if (topic in connectionIndices) {
                // the client is connected to the topic
                console.log("Sending message from topic: " + topic + " to " + request.origin)
                connection.sendUTF(message.value);
            }

        });
    }

    // read message from kafka and send it


    // close connection
    connection.on('close', function (reasonCode, description) {
        console.log('Connection ' + request.origin + ' disconnected.');
        var topic2remove = []

        for (const [topic, index] of Object.entries(connectionIndices)) {
            // remove the disconnected connection from the subscriber array for each topic
            topic2Connections[topic].splice(index, 1);
            if (topic2Connections[topic].length == 0) {
                console.log("Zero subscriber to topic: " + topic)
                // when no subscriber for a topic, then remove the consumer and corresponding subscriber lists.
                topic2remove.push(topic) // avoid deleting while iterating
            }
        }
        // cleanup topics
        for (var i = 0; i < topic2remove.length; i++) {
            delete topic2Consumer[topic2remove[i]];
            delete topic2Connections[topic2remove[i]];
        }
        // console.log('Connection ' + connection.remoteAddress + ' disconnected.');
    });
});