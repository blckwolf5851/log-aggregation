const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');
require("dotenv").config();


const { ApiElasticSearchClient, checkConnection, getAllIndices } = require('./server.elastic');
const app = express();

// PORT
const PORT = process.env.NODE_PORT || 3000;

function start() {
    app.use(bodyParser.json());

    // TODO Set port for the app to listen on
    app.set('port', PORT);

    // TODO Set path to serve static files
    app.use(express.static(path.join(__dirname, 'public')));

    // TODO Enable CORS
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Accept-Encoding, Accept-Language, Access-Control-Request-Headers, Access-Control-Request-Method");
        next();
    });
    app.use(cors())

    // health checking
    app.get('/', function (req, res) {
        res.send("Node is running brother");
    });

    // Define the `/search` route that should return elastic search results
    app.get('/all-indices', getAllIndices);
    app.get('/search', ApiElasticSearchClient);

    app.listen(PORT, function () {
        console.log(`Express server listening on port :${PORT}`);
    });
}

(async function main() {

    const isElasticReady = await checkConnection();

    if (isElasticReady) {
        start();
    }

})();
