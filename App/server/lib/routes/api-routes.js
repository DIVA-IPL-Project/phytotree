const render = require('../service/data_render')
const rf = require('../service/read_files')
const Router = require('express').Router
const router = Router()

router.get('/data', (req, res, next) =>{
    render.getRenderData().then(data => {
        res.json(data)
    }).catch(err => {
        if(!err.status){
            err.status = 500;
            if(!err.message)
                err.message = 'Server error.'
        }
        res.status(err.status)
        res.json({
            message: err.message,
            status: err.status
        })
    })
})

router.post('/update/newick', (req, res, next) => {
    let newick = req.body.data
    render.set_tree_data(newick)
    res.json()
})

router.post('/update/profiles', (req, res, next) =>{
    let profiles_data = req.body.data
    render.set_profiles_data(profiles_data)
    res.json()
})

router.post('/update/isolates', (req, res, next) =>{
    let isolates_data = req.body.data
    render.set_isolates_data(isolates_data)
    res.json()
})

router.get('/default_data', (req, res, next) => {
    rf.read_tree_file().then(data => {
        render.set_tree_data(data.toString())
        return rf.read_profile_file()
    }).then(data =>{
        render.set_profiles_data(data.toString())
        return rf.read_isolate_file()
    }).then(data =>{
        render.set_isolates_data(data.toString())
    }).then(()=>{
        render.getRenderData().then(data => {
            res.json(data)
        }).catch(err => {
            res.status(err.status)
            res.json({
                message: err.message,
                status: err.status
            })
        })
    })

})

module.exports = router
