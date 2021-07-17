const path = require('path');
const express = require('express');
const bodyParser = require('body-parser')
const routesApi = require('./lib/routes/api-routes');
const routesWeb = require('./lib/routes/web-routes');
const PORT = 8000;
const app = express();


function build_app(arg){
    switch (arg) {
        case '-server': {

            app.use('/public', express.static(path.join(__dirname, 'public')))

            app.use(bodyParser.json({limit: "50mb"}))

            app.use('/api', routesApi)

            let homeUri = path.join(__dirname, 'lib', 'views', 'home.html')
            app.use(routesWeb.init_path(homeUri).init_router())

            app.listen(PORT, function (err) {
                if (err) console.log(err);
                console.log("Server listening on PORT", PORT);
            })

            break
        }
        case '-client': {

            app.use('/public', express.static(path.join(__dirname, 'public')))

            app.use(bodyParser.json({limit: "50mb"}))

            app.use('/api', routesApi)

            let homeUri = path.join(__dirname, 'lib', 'views', 'home_cs.html')
            app.use(routesWeb.init_path(homeUri).init_router())

            app.listen(PORT, function (err) {
                if (err) console.log(err);
                console.log("Server listening on PORT", PORT);
            })

            break
        }
        default:
            break
    }
}

module.exports = {build_app}

