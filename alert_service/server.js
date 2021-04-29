// a websocket server for receiving alert, write to elastic search

var WebSocketServer = require('websocket').server;
var http = require('http');

var kafka = require('kafka-node');
var Consumer = kafka.Consumer,
    Producer = kafka.Producer,
    client = new kafka.KafkaClient("localhost:9092"),
    consumer = new Consumer(client, [{ topic: 'Eventarc', partition: 0 }], { autoCommit: false }),
    producer = new Producer(client);

var server = http.createServer(function (request, response) {
    console.log(' Request recieved : ' + request.url);
    response.writeHead(404);
    response.end();
});

// TODO subscribe to multiple topic with groupid.

var alerts = {}

const sample_alert = {
    id: '3sfgff4dASE',
    command: "ADD", // can be ADD, DEL, every alert in <alerts> cannot have command = DEL
    conditions: {
        levelname:"ERROR" // field equal value
    },
    threshold: 2,
    window: 6485218, // time window size in millisecond
    sendTo: '154757929sherry@gmail.com',
    priority: "HIGH" // LOW, MEDIUM, HIGH
}


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

    var push_messages = []

    console.log('Connection accepted : ' + request.origin);
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log(message)
            console.log(message.utf8Data)
            const query = JSON.parse(message.utf8Data);
            const command = query.command; // can be ADD, DEL
            if (command === "ADD") {
                alerts[query.id] = query
                alerts[query.id].matching_log = [] // keep track of number of match to this query
            } else if (command === "DEL") {
                delete alerts[query.id];
            } else if (command === "UPD") {
                let matching_log = alerts[query.id].matching_log
                alerts[query.id] = query
                alerts[query.id].matching_log = matching_log
            }
            console.log(command + " alert " + query.id);
        } else {
            console.log("Received message is not UTF-8 type")
        }

    });

    // loop through the list of consumer and send messages to connections that subscribed to it.
    consumer.on('message', function (message) {
        // parse log into json, and its timestamp into Date
        console.log(message);
        const log = JSON.parse(message.value);
        log.timestamp = new Date(log.timestamp)

        // check match for each query
        for (const query_id in alerts) {
            var all_field_match = true;
            for (const field in alerts[query_id].conditions) {
                if (log[field] !== alerts[query_id].conditions[field]) {
                    all_field_match = false;
                }
            }
            if (all_field_match) {
                // increment of match for that query
                alerts[query_id].matching_log.push(log);
            }
            if (alerts[query_id].matching_log.length >= alerts[query_id].threshold) {
                // check if time difference matches
                const time_diff = alerts[query_id].matching_log[alerts[query_id].matching_log.length-1].timestamp - alerts[query_id].matching_log[0].timestamp;
                const now = new Date()
                if (time_diff < alerts[query_id].window) {
                    // if the threshold hit within the timeframe, then push alert to kafka
                    const notif = {
                        timestamp: now,
                        email: alerts[query_id].email,
                        priority: alerts[query_id].priority,
                        message: "Condition: " + JSON.stringify(alerts[query_id].conditions) + " Exceed " + alerts[query_id].threshold + " Times."
                    }
                    // add the message to queue, for push to kafka later
                    push_messages.push(JSON.stringify(notif))
                    console.log("Push alert to Kafka: " + JSON.stringify(notif))
                    alerts[query_id].matching_log = [] // reset to empty to avoid spamming
                } else {
                    
                    alerts[query_id].matching_log = alerts[query_id].matching_log.filter(obj => now - obj.timestamp > alerts[query_id].threshold)

                    // check again if the threshold is still hit after filter
                    if (alerts[query_id].matching_log.length >= alerts[query_id].threshold) {
                        const notif = {
                            timestamp: now,
                            email: alerts[query_id].email,
                            priority: alerts[query_id].priority,
                            message: "Condition: " + JSON.stringify(alerts[query_id].conditions) + " Exceed " + alerts[query_id].threshold + " Times."
                        }
                        push_messages.push(JSON.stringify(notif))

                        console.log("Push alert to Kafka: " + JSON.stringify(notif))
                        alerts[query_id].matching_log = [] // reset to empty to avoid spamming
                    }
                }
            }
        }
        if (push_messages.length > 0) {
            var payloads = [{
                topic: 'alerts',
                messages: push_messages, // multi messages should be a array, single message can be just a string or a KeyedMessage instance
                // key: '', // string or buffer, only needed when using keyed partitioner
                // partition: 0, // default 0
                // attributes: 0, // default: 0
                // timestamp: Date.now() // <-- defaults to Date.now() (only available with kafka v0.10+)
            }]
            console.log("Sending " + JSON.stringify(push_messages) + " To Kafka")
            producer.send(payloads, function (err, data) {
                console.log(data);
            });
            push_messages = []
        }

    });

    // publish notification to kafka
    producer.on('ready', function () {
        if (push_messages.length > 0) {
            var payloads = [{
                topic: 'alerts',
                messages: push_messages, // multi messages should be a array, single message can be just a string or a KeyedMessage instance
                // key: '', // string or buffer, only needed when using keyed partitioner
                // partition: 0, // default 0
                // attributes: 0, // default: 0
                // timestamp: Date.now() // <-- defaults to Date.now() (only available with kafka v0.10+)
            }]
            console.log("Sending " + JSON.stringify(push_messages) + " To Kafka")
            producer.send(payloads, function (err, data) {
                console.log(data);
            });
            push_messages = []
        }
    });

    producer.on('error', function (err) { console.log("Producer Error:" + err) })

    // close connection
    connection.on('close', function (reasonCode, description) {
        console.log('Connection ' + request.origin + ' disconnected.');
    });
});