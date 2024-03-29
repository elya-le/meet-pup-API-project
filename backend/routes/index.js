// backend/routes/index.js
const express = require('express');
const router = express.Router();

// test route
// router.get('/hello/world', function(req, res) {
//     res.cookie('XSRF-TOKEN', req.csrfToken());
//     res.send('Hello World!');
// });

const apiRouter = require('./api');

router.use('/api', apiRouter);
// all the URLs of the routes in the api router will be prefixed with /api

// add a XSRF-TOKEN cookie
// This route should not be available in production, 
// but it will not be exclusive to the production application 
// until you implement the frontend of the application later. 
// So for now, it will remain available to both the 
// development and production environments.
router.get("/api/csrf/restore", (req, res) => {
    const csrfToken = req.csrfToken();
    res.cookie("XSRF-TOKEN", csrfToken);
    res.status(200).json({
        'XSRF-Token': csrfToken
    });
});

module.exports = router;