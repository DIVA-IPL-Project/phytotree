const express = require('express');
const bodyParser = require('body-parser')
const routesApi = require('./lib/routes/api-routes');
const routesWeb = require('./lib/routes/web-routes');

const app = express();
const PORT = 8000;

app.use('/public', express.static(__dirname + '/public'));

app.use(bodyParser.json())

app.use('/api', routesApi)
app.use(routesWeb)

// app.get('/home', function (req, res, next) {
//     res.sendFile(__dirname + '/home.html');
// });
//
// app.get('/api/data', function (req, res, next) {
//     // res.sendFile(__dirname + '/home.html');
//     // const html = fs.readFileSync( __dirname + '/home.html' );
//     res.json({html: html.toString(), data: root});
// });

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
