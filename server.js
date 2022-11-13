'use strict';
const debug = require('debug')('myApp');
const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const dotenv = require('dotenv').config();

const { marked } = require('marked'); // .md to .html

const app = express();
app.use(morgan("dev"));

var fs = require('fs');

// development error handler will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// Proxy endpoints
app.use(
    "/deploy",
    createProxyMiddleware({
        target: process.env.URL,
        changeOrigin: true,
        pathRewrite: {
            "^/deploy": "",
        },
    })
);

app.use(
    "/develop",
    createProxyMiddleware({
        target: 'https://www.seznam.cz/',
        changeOrigin: true,
        pathRewrite: {
            "^/develop": "",
        },
    })
);

app.use('/', function (req, res) {
    var path = __dirname + '/README.md';
    var file = fs.readFileSync(path, 'utf8');
    res.send(marked.parse(file.toString()));
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    console.log('Server listening on port ' + server.address().port);
    debug('Server listening on port ' + server.address().port);  
});
