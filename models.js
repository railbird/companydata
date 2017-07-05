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

    if(!req.params.companyData.item[1]) {
      let err = new Error(req.params.companyName + " hat noch keine Gewinnzahlen veröffentlicht.");
      err.status = 404;
      return next(err);
    }
    let description = req.params.companyData.item[1].data.title.toLowerCase();
    let gewinnArray = req.params.companyData.item[0].data.data;
    let bilanzArray = req.params.companyData.item[1].data.data
    let date1 = gewinnArray[0].year;
    let date2 = bilanzArray[0].year;
    let dateEnd1 = gewinnArray[gewinnArray.length - 1].year;
    let dateEnd2 = bilanzArray[bilanzArray.length -1].year;
    let startDate;
    let endDate;
    if(date1 < date2) {
      startDate = date1;
    } else {
      startDate = date2;
    }
    if(dateEnd1 < dateEnd2) {
      endDate = dateEnd2;
    } else {
      endDate = dateEnd1;
    }
    let arrayLength = (endDate - startDate) +  1;
    console.log(arrayLength);
    console.log(startDate);
    console.log(endDate);


    let year = startDate;
    for(let i = 0; i < arrayLength; i++) {
      let tempObject = {};
      tempObject.year = year;
      gewinnArray.forEach(element => {
        if(element.year == year) {
          console.log("ja");
          tempObject.gewinn = element.value0;
        }
      });
      bilanzArray.forEach(element => {
        if(element.year == year) {
          tempObject[description] = element.value0;
          console.log(year + ": Bilanzsumme -- " + element.value0);
        }
      });
      data.push(tempObject);
      year++;
    }
    /*// Jahreszahl und Gewinn in data Array speichern
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
    });*/
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
