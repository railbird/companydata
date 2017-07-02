'use strict';

const express = require('express');
const router = express.Router();
const Company = require('./models').Company;
const scrape = require('./scrape');



module.exports = router;

router.get("/", (req, res, next) => {
        if (req.query.name) {
            // set first character to UpperCase
            //req.query.name = req.query.name.charAt(0).toUpperCase() + req.query.name.slice(1);
            let companyNameShort = req.query.name.slice(0, 10);
            console.log(req.query.location);
            console.log(req.query.hrb);
            // return from database. if not found -> scrape it -> save in DB -> then return
            Company.findOne({
                name: {
                    $regex: "^" + companyNameShort,
                    $options: 'i'
                }
            }, (err, doc) => {
                if (err) console.log(err);
                if (doc) {
                    res.json(doc);
                } else {
                    return next();
                };
            });
        } else {
            Company.find({}, {
                name: true,
                _id: false
            }, (err, companies) => {
                if (err) console.error(err);
                res.json(companies);
            });
        };
    }, (req, res, next) => {
        // return names of companies
        scrape.scrapeFor(req, res, next);
    },
    (req, res, next) => {
        res.json(req.params.company);
    }
);

router.get("/all", (req, res) => {
    // return everything that is in DB
    Company.find({}, (err, companies) => {
        if (err) console.error(err);
        res.json(companies);
    });
});
