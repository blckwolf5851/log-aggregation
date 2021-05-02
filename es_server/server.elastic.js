const client = require('./server.client');
// const elasticSearchSchema = require('./server.es.schema');

// Request example: http://localhost:3000/search?indices=["httplog-aggregation2com","httplog-aggregationcom"]&&body={"timestamp"":"2021-04-21"}

function ElasticSearchClient(indices, body, dateRange) {
    // perform the actual search passing in the index, the search query and the type
    /*
    dateRange = {
        "timestamp":{
            "gte":"2020-4-29",
            "lte":"2021-5-6",
            "format":"date"
        }
    }
    */
    var query = []
    size = 50
    for (var i = 0; i < indices.length; i++) {
        query.push({ index: indices[i] })
        var tmp_query = {
            sort: [
                { "timestamp": "desc" }
            ],
            size: size,
        };
        if (Object.keys(body).length != 0) {
            tmp_query.query = {
                bool:{
                    must:{
                        match: { ...body }
                    }
                }
            }
            tmp_query.query.bool.filter={
                range: { ...dateRange } 
            }
        } else {
            tmp_query.query = { range: { ...dateRange } }
        }
        query.push(tmp_query)
    }
    console.log(query)

    return client.msearch({ body: query })
    // return client.search(query)
}

function saveBodyToIndex(id, index, body) {
    client.index({
        index: index,
        id: id,
        body: body
    }, function (err, resp) {
        if (err) {
            console.log("error occured")
            console.log(err)
        } else {
            console.log("Added notification to index", resp)
        }
    })
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

function AddDoc(req, res){
    console.log("req")
    console.log(req.body)
    var id = req.body.id
    var index = req.body.index
    var body = req.body.body
    // id = JSON.parse(id)
    // index = JSON.parse(index)
    // body = JSON.parse(body)
    saveBodyToIndex(id, index, body)
}


function ApiElasticSearchClient(req, res) {
    // perform the actual search passing in the index, the search query and the type
    var body = req.query.body
    var indices = req.query.indices
    var dateRange = req.query.dateRange
    indices = JSON.parse(indices)
    body = JSON.parse(body)
    dateRange = JSON.parse(dateRange)
    ElasticSearchClient(indices, body, dateRange)
        .then(r => res.send(processEsResponse(r)))
        // .then(r => res.send(r.hits.hits))
        .catch(e => {
            console.error(e);
            res.send([]);
        });
}

function getAllIndices(req, res) {
    client.cat.indices({ "format": "json" }, function (err, result) {
        if (err) {
            res.send([]);
        } else {
            var result = result.body.map((r) => {
                return r.index
            })
            result = result.filter((name) => !name.startsWith("."))
            console.log("filtered indices: ", result)
            res.send(result);
        }
    })

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
    checkConnection,
    getAllIndices,
    AddDoc
};

