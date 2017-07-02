'use strict';
const cheerio = require('cheerio');
const request = require('request');
const models = require('./models');

let scrapeFor = function(req, res, next) {
    let companyName = req.query.name;
    request('https://www.northdata.de/' + companyName, (err, response, body) => {
        let $ = cheerio.load(body);

        // ueberpruefen ob wir direkt auf der Company Seite gelandet sind, oder
        // auf der Uebersichtsseite fuer mehrere Suchergebnisse
        // when true --> Uebersichtsseite. Query muss praezisiert werden.
        if ($('.search-results').text()) {
            let companyNamesFound = {
                error: "Bitte Firmenname praezisieren",
                companies: []
            };
            let numberSearchResults = $('.summary').children().length;
            for (let i = 0; i < numberSearchResults; i++) {
                let comName = $('.summary').children().eq(i).text();
                companyNamesFound.companies.push(comName);
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
              } catch(err) {
                err = new Error("Die Firma hat keine Unternehmenszahlen veröffentlicht");
                return next(err);
              };
              //res.json(companyData.item[0].data.data);
              // formattieren und in DB speichern.
              models.save(req, res, next);


    });
};




let test = function() {
    console.log("scrape... test ok.");
};

module.exports.test = test;
module.exports.scrapeFor = scrapeFor;
