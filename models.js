'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CompanySchema = new Schema({
    name: String,
    data: [],
    history: {}
});

const LinkSchema = new Schema({
  hrb: String,
  link: String
});

const Link = mongoose.model("Link", LinkSchema);


const Company = mongoose.model("Company", CompanySchema);

function save(req, res, next) {
    let data = [];
    console.log("bin in save");
    // Jahreszahl und Gewinn in data Array speichern
    req.params.companyData.item[0].data.data.forEach(element => {
        data.push({
            year: element.year,
            gewinn: element.value0
        });
    });
    // Fuer jedes Jahr die dazugehoerige Bilanzsumme speichern
    req.params.companyData.item[1].data.data.forEach((element, index) => {
        data.forEach(dataElement => {
            if (dataElement.year === element.year) {
                dataElement.bilanzsumme = element.value0;
            };
        });
    });
    // Object mit Unternehmenshistorie erstellen
    let history = {};
    history.mindDate = req.params.companyHistory.minDate;
    history.maxDate = req.params.companyHistory.maxDate;
    history.events = [];
    req.params.companyHistory.event.forEach(element => {
        let event = {};
        event.text = element.text;
        event.time = element.time;
        history.events.push(event);
    });
    // erstelle Company Object, das in DB gespeichert werden kann

    req.params.company = new Company({
        name: req.params.companyName,
        data: data,
        history: history
    });
    // in DB speichern

    Company.findOne({
        name: req.params.companyName
    }, (err, doc) => {
        if (doc) {
            return next();
        } else {
            req.params.company.save((err, company) => {
                if (err) console.log(err);
                console.log(`${company.name} wurde gespeichert.`);
                next();
            });
        };
    });

}

module.exports.Company = Company;
module.exports.save = save;
module.exports.Link = Link;
