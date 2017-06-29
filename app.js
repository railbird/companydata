'use strict'

const express = require('express');
const app = express();
const routes = require('./routes');
const logger = require('morgan');



app.use

app.use(logger("dev"));



app.use((req, res, next) => {
  console.log("The Middleware is working.");
  next();
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
