'use strict';

const express = require('express');
const router = express.Router();
const scrape = require('./scrape');
const models = require('./models');



module.exports = router;

router.get("/", (req, res, next) => {
        if (req.query.name) {
            // mode = force to prevent the local DB lookup and force scraping
            if (req.query.mode === "force") {
                return next();
            }
            let companyNameShort = req.query.name.slice(0, 10);
            // return from database. if not found -> scrape it -> save in DB -> then return
            Company.findOne({
                name: {
                    $regex: "^" + companyNameShort,
                    $options: 'i'
                }
            }, (err, doc) => {
                if (err) {
                    console.log(err);
                }
                if (doc) {
                    res.json(doc);
                } else {
                    return next();
                }
            });
            // if no name param in query => output = all company names in DB
        } else {
            Company.find({}, {
                name: true,
                _id: false
            }, (err, companies) => {
                if (err) {
                    console.error(err);
                }
                res.json(companies);
            });
        };
    }, (req, res, next) => {
        if (req.query.hrb) { // when searched with hrb number => use hrb number to lookup link in local DB
            models.Link.findOne({
                hrb: req.query.hrb
            }, (err, doc) => {
                if (doc) {
                    req.params.searchQuery = 'https://www.northdata.de' + doc.link;
                    next();
                } else {
                    let err = new Error("Die HRB Nummer wurde nicht gefunden.");
                    next(err);
                }
            });
        } else {
            req.params.searchQuery = 'https://www.northdata.de/' + req.query.name;
            next();

        };


    }, (req, res, next) => {
        // scrape for company data
        scrape.scrapeFor(req, res, next);
    },
    (req, res, next) => {
        // returns company data
        res.json(req.params.company);
    }
);

router.get("/all", (req, res) => {
    // return everything that is in DB
    Company.find({}, (err, companies) => {
        if (err) {
            console.error(err);
        }
        res.json(companies);
    });
});
