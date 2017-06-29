'use strict';

const express = require('express');
const router = express.Router();


module.exports = router;

router.get("/", (req, res) => {
  // return names of companies
  res.json({companies: ["company1", "company2"]});
});

router.get("/all", (req, res) => {
  // return everything that is in DB
  let muh = obj.muh;
  res.json({all: []});
});
