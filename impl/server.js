const express = require('express');
const bodyParser = require('body-parser')
const routesApi = require('./lib/routes/api-routes');
const routesWeb = require('./lib/routes/web-routes');

const app = express();
const PORT = 8000;

app.use('/public', express.static(__dirname + '/public'));

app.use(bodyParser.json({limit: "50mb"}))

app.use('/api', routesApi)
app.use(routesWeb)

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
})