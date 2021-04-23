const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const { ApiElasticSearchClient } = require('./server.elastic');

// PORT
const PORT = 9100;

// TODO Use the BodyParser as a middleware
app.use(bodyParser.json());

// TODO Set port for the app to listen on
app.set('port', process.env.PORT || 9100);

// TODO Set path to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// TODO Enable CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Accept-Encoding, Accept-Language, Access-Control-Request-Headers, Access-Control-Request-Method");
    next();
});

// health checking
app.get('/', function (req, res) {
    res.send("Node is running brother");
});

// Define the `/search` route that should return elastic search results
app.get('/search', ApiElasticSearchClient);

app.listen(PORT, function () {
    console.log(`Express server listening on port :${PORT}`);
});