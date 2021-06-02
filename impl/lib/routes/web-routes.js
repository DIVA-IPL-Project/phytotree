const path = require('path');
const Router = require('express').Router
const router = Router()

let profiles
let isolates

router.get('/home', (req, res, next) => {
    res.sendFile(path.resolve('impl/lib/views/home.html'));
})

router.post('/profiles', (req, res, next) => {
    profiles = req.body
    res.render("profiles", {"profiles": profiles})
})

router.get('/profiles', (req, res, next) => {
    if (profiles) {
        res.render("profiles", {"header": profiles.header, "prof": profiles.prof})
    }
})

router.post('/isolates', (req, res, next) => {
    isolates = req.body
    res.render("profiles", {"profiles": isolates})
})

router.get('/isolates', (req, res, next) => {
    if (isolates) {
        res.render("isolates", {"header": isolates.header, "iso": isolates.iso})
    }
})

module.exports = router;