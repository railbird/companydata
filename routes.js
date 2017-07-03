'use strict';

const express = require('express');
const router = express.Router();
const Company = require('./models').Company;
const scrape = require('./scrape');
const models = require('./models');



module.exports = router;

router.get("/", (req, res, next) => {
        if (req.query.name) {
            // mode = force to prevent the local DB lookup and force scraping
            if(req.query.mode === "force") {
              return next();
            };
            // set first character to UpperCase
            //req.query.name = req.query.name.charAt(0).toUpperCase() + req.query.name.slice(1);
            let companyNameShort = req.query.name.slice(0, 10);
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
      if(req.query.hrb) {
        models.Link.findOne({hrb: req.query.hrb}, (err, doc) => {
          if(doc) {
            req.params.searchQuery = 'https://www.northdata.de' + doc.link;
            console.log("------ " + req.params.searchQuery + " ---------------" );
            next();
          };
        })
      } else {
        req.params.searchQuery = 'https://www.northdata.de/' + req.query.name;
        next();

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
