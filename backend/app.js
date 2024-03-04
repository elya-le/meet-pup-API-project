// express set up


// import necessry packages

const routes = require('./routes');
// express framework to handle HTTP requests
const express = require('express');
// patch express to handle asyn errors
require('express-async-errors');
// logging middleware
const morgan = require('morgan');
// cross-origin resource sharing
const cors = require('cors');
// csrf protection middleware
const csurf = require('csurf');
// secure apps by setting verious HTTP headers
const helmet = require('helmet');
// parse cookie header and populate req.cookies
const cookieParser = require('cookie-parser');

// checks if the application is running in a production environment
const { environment } = require('./config');
const isProduction = environment === 'production';

// sequelize error-handler
const { ValidationError } = require('sequelize');

// initialize the Express application
const app = express();

// middleware setup
// connect the morgan middleware for logging information about requests and responses
// log http requets and errors
app.use(morgan('dev'));

// parsing cookies and the express.json middleware for parsing JSON bodies of requests with Content-Type of "application/json".
app.use(cookieParser());
app.use(express.json());

// security middleware setup
if (!isProduction) {
    // enable cors only in development
    app.use(cors());
}
    // helmet helps set a variety of headers to better secure your app
app.use(
    helmet.crossOriginResourcePolicy({
        // allow images with urls to render the deployment s
        policy: "cross-origin"
    })
);

// configure csurf middleware
// set the _csrf token and create req.csrfToken method
app.use(
    csurf({
        cookie: {
        secure: isProduction,
        sameSite: isProduction && "Lax",
        httpOnly: true
        }
    })
);

// connect all the routes
app.use(routes);

// catch unhandled requests and forward to error handler
app.use((_req, _res, next) => {
    const err = new Error("The requested resourc couldn't be found.");
    err.title = "Resource Not Found";
    err.errors = { message: "The requested resource couldn't be found."};
    err.status = 404;
    next(err);
});

// process sequelize errors 
app.use((err, _req, _res, next) => {
    // check if error is a Sequelize error;
    if (err instanceof ValidationError) {
        let errors = {};
        for (let error of err.errors) {
            error[error.path] = error.message;
        } 
        err.title = 'Validation error';
        err.errors = errors;
    }
    next(err);
});

// error formatter
app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    console.error(err);
    res.json({
        title: err.title || 'Server Error',
        message: err.message,
        errors: err.errors,
        stack: isProduction ? null : err.stack
    });
});

module.exports = app;