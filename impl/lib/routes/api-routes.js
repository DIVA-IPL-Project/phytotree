const nwkParser = require('../service/parsing/newickParser')
const input = require('../service/input.js')
const Router = require('express').Router
const router = Router()

const dir = __dirname
const nwk_path = dir.slice(0, dir.length-7) + "\\service\\data\\data.nwk"
const prof_path = dir.slice(0, dir.length-7) + "\\service\\data\\profileData.tab"
const iso_path = dir.slice(0, dir.length-7) + "\\service\\data\\isolateData.tab"

let treeFile = input.setNewTreeFilePath(nwk_path)
let profilesFile = input.setNewProfilesFilePath(prof_path)
let isolateFile = input.setNewIsolatesFilePath(iso_path)

router.get('/data', (req, res, next) =>{
    treeFile.getTreeAsync().then(data => {
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

router.post('/update/newick', (req, res, next) => {
    let newick = req.body.data;
    treeFile = input.setNewTreeFileData(newick)
    treeFile
        .getTreeAsync()
        .then(data => {
            let tree = nwkParser(data)
            res.json(tree)
        })
})

router.post('/update/profiles', (req, res, next) =>{
    let profiles = req.body.data
    profilesFile = input.setNewProfilesFileData(profiles)
    //todo
})

router.post('/update/isolates', (req, res, next) =>{
    let isolates = req.body.data
    isolateFile = input.setNewIsolatesFileData(isolates)
    //todo
})

router.get('/profiles', (req, res, next) =>{
   input.API.getProfilesAsync().then(body => res.json(body))
})

router.get('/isolates', (req, res, next) =>{
    input.API.getIsolateAsync().then(body => res.json(body))
})

module.exports = router