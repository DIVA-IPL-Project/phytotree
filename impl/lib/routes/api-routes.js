const nwkParser = require('../service/parsing/newickParser')
const input = require('../service/input.js')
const Router = require('express').Router
const router = Router()

const dir = __dirname
const path = dir.slice(0, dir.length-7) + "\\service\\data\\data.nwk"
const root = input.setNewTreeFile(path)


router.get('/data', (req, res, next) =>{
    root.getTreeAsync().then(data => {
            const json = nwkParser(data)
            res.json(json)
        }
    )
})

router.post('/data', (req, res, next) => {
    let newick = req.body;
    let json = nwkParser(newick.data)
    res.json(json)
})

module.exports = router