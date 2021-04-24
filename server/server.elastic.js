const { indices } = require('./server.client');
const client = require('./server.client');
// const elasticSearchSchema = require('./server.es.schema');


function ElasticSearchClient(indices, body) {
    // perform the actual search passing in the index, the search query and the type
    // const query = {
    //     index: index,
    //     // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    //     body: {},
    //     size: 100
    // }
    // console.log(query)
    // const { body: { hits } } = await esclient.search(query);
    query = []
    for (var i = 0; i < indices.length; i++) {
        query.push({ index: indices[i] })
        if (Object.keys(body).length != 0) {
            query.push({ query: { match: { ...body } } })
        } else {
            query.push({})
        }
    }
    console.log(query)

    return client.msearch({
        body: [
            { index: 'httplog-aggregationcom' },
            { },

            { index: 'httplog-aggregation2com' },
            { }
        ]
    })
    return client.search(query)
}

function processEsResponse(r) {
    var result = r.body.responses
    console.log(result)
    result = result.map((hit) => {
        return hit.hits.hits
    });
    console.log(result)
    result = [].concat.apply([], result)
    console.log(result)
    const values = result.map((hit) => {
        return hit._source
    });
    console.log(result)
    return values
}

function ApiElasticSearchClient(req, res) {
    // perform the actual search passing in the index, the search query and the type
    var body = req.query.body
    var indices = req.query.indices
    console.log('indices')
    console.log(indices)
    console.log("body")
    console.log(body)
    ElasticSearchClient(indices, body)
        .then(r => res.send(processEsResponse(r)))
        // .then(r => res.send(r.hits.hits))
        .catch(e => {
            console.error(e);
            res.send([]);
        });
}

function checkConnection() {
    return new Promise(async (resolve) => {

        console.log("Checking connection to ElasticSearch...");
        let isConnected = false;

        while (!isConnected) {
            try {

                await client.cluster.health({});
                console.log("Successfully connected to ElasticSearch");
                isConnected = true;

                // eslint-disable-next-line no-empty
            } catch (_) {
                // console.log("Failed to connected to ElasticSearch");
            }
        }

        resolve(true);

    });
}

module.exports = {
    ApiElasticSearchClient,
    ElasticSearchClient,
    checkConnection
};