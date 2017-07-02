'use strict'

const express = require('express');
const app = express();
const routes = require('./routes');
const logger = require('morgan');




app.use(logger("dev"));

app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
    console.log("The Middleware is working.");
    next();
});

const mongoose = require('mongoose');
const Company = require("./models").Company;

mongoose.connect('mongodb://localhost:27017/sandbox');
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
    res.status(err.status || 500);
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
