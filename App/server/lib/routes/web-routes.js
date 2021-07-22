const path = require('path');
const Router = require('express').Router
const router = Router()

let view_path

function init_path(path){
    view_path = path
    return {
        init_router
    }
}


function init_router(){

    router.get('/home', (req, res, next) => {
        res.sendFile(path.resolve(view_path));
    })

    return router
}

module.exports = {init_path};
