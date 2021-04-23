const client = require('./server.client');
// const elasticSearchSchema = require('./server.es.schema');

/**
 * TODO Ping the CLIENT to be sure 
 * *** ElasticSearch *** is up
 */
client.ping({
    requestTimeout: 30000,
}, function (error) {
    error
        ? console.error(error)
        : console.log('ElasticSearch is ok');
});

function ElasticSearchClient(index , body) {
    // perform the actual search passing in the index, the search query and the type
    return client.search({
        index: index,
        // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
        body: {
            query: {
                match: {...body}
            }
        }
    })
}

function ApiElasticSearchClient(req, res) {
    // perform the actual search passing in the index, the search query and the type
    var body = req.query.body
    var index = req.query.index
    console.log(req)
    console.log('index')
    console.log(index)
    console.log("body")
    console.log(body)
    ElasticSearchClient(index, body)
        .then(r => res.send(r['hits']['hits']))
        .catch(e => {
            console.error(e);
            res.send([]);
        });
}

module.exports = {
    ApiElasticSearchClient,
    ElasticSearchClient
};