'use strict';

const express = require('express');
const app = express();
const routes = require('./routes');
const logger = require('morgan');


app.use(logger("dev"));

app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
    next();
});

const mongoose = require('mongoose');

mongoose.connect('mongodb://heroku_r74s0b7l:q00dg3h0m1tqv0i4msitm4905m@ds147902.mlab.com:47902/heroku_r74s0b7l'); // mongodb://heroku_r74s0b7l:q00dg3h0m1tqv0i4msitm4905m@ds147902.mlab.com:47902/heroku_r74s0b7l || mongodb://localhost:27017/sandbox
const db = mongoose.connection;

db.on("error", (err) => {
    console.log("connection error: ", err);
});

db.once("open", () => {
    console.log("db connection successful");
});



app.use('/companies', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// Error handler
app.use((err, req, res, next) => {
    //res.status(err.status || 500);
    res.status(200);
    res.json({
        error: {
            message: err.message
        }
    });
});


const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});
