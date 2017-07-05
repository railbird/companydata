'use strict';
const cheerio = require('cheerio');
const request = require('request');
const models = require('./models');

let scrapeFor = function(req, res, next) {
    let companyName = req.query.name;
    let searchQuery = req.params.searchQuery;

    request("" + searchQuery, (err, response, body) => {

        let $ = cheerio.load(body);

        // ueberpruefen ob wir direkt auf der Company Seite gelandet sind, oder
        // auf der Uebersichtsseite fuer mehrere Suchergebnisse
        // when true --> Uebersichtsseite. Query muss praezisiert werden.
        if ($('.search-results').text()) {
            let companyNamesFound = {
                error: "Bitte Firmenname praezisieren oder mit hrb='HRB Nummer' suchen",
                companies: []
            };

            let numberSearchResults = $('.summary').children().length;
            for (let i = 0; i < numberSearchResults; i++) {
                let searchResults = {};

                searchResults.name = $('.summary').children().eq(i).text();
                searchResults.link = $('.summary').children().eq(i).attr("href");
                try {
                    let splitted = $('.summary').children().eq(i).attr("href").split("+");
                    splitted = splitted[splitted.length - 1];
                    searchResults.HRB = parseInt(splitted);
                    if(!searchResults.HRB) searchResults.HRB = "";
                  //searchResults.HRB = $('.summary').children().eq(i).attr("href").split("HRB+")[1];
                } catch (err) {
                    searchResults.HRB = "";
                }

                let link = new models.Link({
                    hrb: searchResults.HRB,
                    link: searchResults.link
                });
                models.Link.findOne({
                    hrb: searchResults.HRB
                }, (err, doc) => {
                    if (!doc) {
                        link.save((err, doc) => {
                            console.log(doc.hrb + " has been saved");
                        });
                    };
                });

                delete searchResults.link;

                companyNamesFound.companies.push(searchResults);


            };

            return res.json(companyNamesFound);
        };
        // replace companyName with target sites standard convention
        req.params.companyName = $('.prompt').attr('value');
        // companyData = Jahr, Bilanzsumme, Gewinn
        let companyData = $('.tab-content').attr('data-data');
        // companyHistory = Important Events and Dates in the History of the Company
        let companyHistory = $('.bizq').first().attr('data-data');

        try {
            req.params.companyData = JSON.parse(companyData);
            req.params.companyHistory = JSON.parse(companyHistory);
        } catch (err) {
            err = new Error("Die Firma hat keine Unternehmenszahlen veröffentlicht");
            err.status = 404;
            return next(err);
        };

        models.save(req, res, next);


    });
};

module.exports.scrapeFor = scrapeFor;
