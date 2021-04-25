const { Client } = require('@elastic/elasticsearch')
require("dotenv").config();

const elasticUrl = process.env.ELASTIC_URL || "http://localhost:9200";

console.log("Connecting to " + elasticUrl)

/**
 * *** ElasticSearch *** client
 * @type {Client}
 */
const client = new Client({node: elasticUrl})

module.exports = client;