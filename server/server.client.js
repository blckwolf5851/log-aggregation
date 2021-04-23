const { Client } = require('@elastic/elasticsearch')
/**
 * *** ElasticSearch *** client
 * @type {Client}
 */
const client = new Client({
    node: 'http://localhost:9200',
    ssl: {
        rejectUnauthorized: false
    }
})

module.exports = client;