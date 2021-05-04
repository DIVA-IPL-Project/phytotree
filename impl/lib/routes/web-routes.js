const path = require('path');
const Router = require('express').Router
const router = Router()

router.get('/home', (req, res, next) => {
    res.sendFile(path.resolve('impl/lib/views/home.html'));
})

module.exports = router;