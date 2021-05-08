// setup kafka consumer and producer
var crypto = require('crypto');

const topic = "Eventarc"
var kafka = require('kafka-node');
var Consumer = kafka.Consumer,
    client = new kafka.KafkaClient({ kafkaHost: 'kafka:9092' }),
    consumer = new Consumer(client, [{ topic: topic, partition: 0 }], { autoCommit: true, groupId: topic });

// setup elasticsearch
const { Client } = require('@elastic/elasticsearch')
require("dotenv").config();

const elasticUrl = process.env.ELASTIC_URL || "http://localhost:9200";

console.log("Connecting to " + elasticUrl)

/**
 * *** ElasticSearch *** client
 * @type {Client}
 */
const es_client = new Client({node: elasticUrl})


function saveLog(topic, log) {
    const index = topic.toLowerCase();
    const id = crypto.createHash('sha256').update(JSON.stringify(log)).digest('hex');
    const body = log

    const store_obj = {
        index: index,
        id: id,
        body: body
    }

    es_client.index(store_obj, function (err, resp) {
        if (err) {
            console.log("error occured")
            console.log(err)
        } else {
            console.log("Added notification to index", resp)
        }
    })

}

consumer.on('message', function (message) {
    // parse log into json, and its timestamp into Date
    console.log(message);

    const log = JSON.parse(message.value);
    log.timestamp = new Date(log.timestamp);

    const topic = message.topic;
    saveLog(topic, log)

});

