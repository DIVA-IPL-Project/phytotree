const nwkParser = require('../service/parsing/newickParser')
const render = require('../service/data_rendering')
const Router = require('express').Router
const router = Router()

let tree
let profiles
let isolates

router.get('/data', (req, res, next) =>{
    //console.log('render')
    render.getRenderData().then(data => {
        console.log(data)
        res.json(data)
    })
    //console.log('render over')
})

router.post('/update/newick', (req, res, next) => {
    let newick = req.body.data;
    tree = render.set_tree_data(newick)
})

router.post('/update/profiles', (req, res, next) =>{
    let profiles_data = req.body.data
    profiles = render.set_profiles_data(profiles_data)
})

router.post('/update/isolates', (req, res, next) =>{
    let isolates_data = req.body.data
    isolates = render.set_isolates_data(isolates_data)
})

module.exports = router
