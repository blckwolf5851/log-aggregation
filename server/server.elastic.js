const { indices } = require('./server.client');
const client = require('./server.client');
// const elasticSearchSchema = require('./server.es.schema');

// Request example: http://localhost:3000/search?indices=["httplog-aggregation2com","httplog-aggregationcom"]&&body={"timestamp"":"2021-04-21"}

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
            query.push({
                sort: [
                    { "timestamp": "desc" }
                ],
                query: { match: { ...body } }
            })
        } else {
            query.push({
                sort: [
                    { "timestamp": "desc" }
                ]
            })
        }
    }
    console.log(query)

    // return client.msearch({
    //     body: [
    //         { index: 'httplog-aggregationcom' },
    //         { },

    //         { index: 'httplog-aggregation2com' },
    //         { }
    //     ]
    // })
    return client.msearch({ body: query })
    // return client.search(query)
}

function processEsResponse(r) {
    var result = r.body.responses
    result = result.map((hit) => {
        return hit.hits.hits
    });
    result = [].concat.apply([], result)
    const values = result.map((hit) => {
        return hit._source
    });
    return values
}

function ApiElasticSearchClient(req, res) {
    // perform the actual search passing in the index, the search query and the type
    var body = req.query.body
    var indices = req.query.indices
    indices = JSON.parse(indices)
    body = JSON.parse(body)
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