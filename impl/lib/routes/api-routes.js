const nwkParser = require('../service/parsing/newickParser')
const input = require('../service/input.js')
const Router = require('express').Router
const router = Router()
const fs = require('fs').promises

const dir = __dirname
const nwk_path = dir.slice(0, dir.length-7) + "\\service\\data\\data.nwk"
const new_nwk_path = dir.slice(0, dir.length-7) + "\\service\\data\\new_data.nwk"
const prof_path = dir.slice(0, dir.length-7) + "\\service\\data\\profileData.tab"
const new_prof_path = dir.slice(0, dir.length-7) + "\\service\\data\\new_prof.tab"
const iso_path = dir.slice(0, dir.length-7) + "\\service\\data\\isolateData.tab"
const new_iso_path = dir.slice(0, dir.length-7) + "\\service\\data\\new_iso.tab"
let treeFile = input.setNewTreeFile(nwk_path)
let profilesFile = input.setNewProfilesFile(prof_path)
let isolateFile = input.setNewIsolatesFile(iso_path)

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
    console.log(newick)
    fs.writeFile(new_nwk_path, newick)
        .then(() => {
            treeFile = input.setNewTreeFile(new_nwk_path)
        })
})

router.post('/update/profile', (req, res, next) =>{
    let profiles = req.body.data
    console.log(profiles)
    fs.writeFile(new_prof_path, profiles)
        .then(() => {
            profilesFile = input.setNewIsolatesFile(new_prof_path)
        })
})

router.post('/update/isolate', (req, res, next) =>{
    let isolates = req.body.data
    console.log(isolates)
    fs.writeFile(new_prof_path, isolates)
        .then(() => {
            isolateFile = input.setNewIsolatesFile(new_iso_path)
        })
})

module.exports = router