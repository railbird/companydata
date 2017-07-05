var trace1 = {
  x: [],
  y: [],
  name: 'Gewinn',
  type: 'bar'
};

var trace2 = {
  x: [],
  y: [],
  name: 'Bilanzsumme',
  type: 'bar'
};

var chartData = [trace1, trace2];

var layout = {barmode: 'group'};

//Plotly.newPlot('chart', chartData);


$('#searchButton').on('click touchstart', function() {
  var suchString = $('#suchString').val();
    $('.list-group').text("");
  $('#chart').text("");
  //$('.list-group').text("");
  getCompanyData(suchString);
});

$('#suchString').keypress(function(e) {
   if (e.which == 13) // the enter key code
   {
     $('#searchButton').click();
     return false;
   }
 });

function getCompanyData(suchString, hrbNummer) {
  if(hrbNummer) {
    suchString = suchString + "&hrb=" + hrbNummer;
  }

  $.getJSON("https://companydatav2.herokuapp.com/companies?name=" + suchString, function(companyData) { // https://companydatav2.herokuapp.com/ http://localhost:3002/
    if(companyData.error) {
      console.log(companyData.error.message);
      handleError(companyData, suchString);
      return;
    }
    trace1.x.splice(0);
    trace1.y.splice(0);
    trace2.x.splice(0);
    trace2.y.splice(0);
    var keys = getKeys(companyData.data);
    /*var keys = companyData.data[0];
    keys = Object.keys(keys);*/
    var description = "bilanzsumme";
    keys.forEach(function(element) {
      if(element === "umsatz") {
        description = "umsatz";
      }
    });
    console.log(description);
    for(var i = 0; i < companyData.data.length; i++) {
      trace1.x[i] = companyData.data[i].year;
      trace1.y[i] = parseInt(companyData.data[i].gewinn);
      trace2.x[i] = companyData.data[i].year;
      trace2.y[i] = parseInt(companyData.data[i][description]);
    }

    trace2.name = description.charAt(0).toUpperCase() + description.slice(1);
    $('#chartTitle').text(companyData.name);
    Plotly.newPlot('chart', chartData, layout);
    //data.data.forEach(function(element)
  });
};


function handleError(companyData, suchString) {
  var companyNames = $('#companyNames');
  if(companyData.error.message) {
    $('#chartTitle').text(companyData.error.message);
    return;
  }
  var listGroup = $('.list-group');
  listGroup.text("");
  $('#chartTitle').text("");
  companyData.companies.forEach( function(element){
    if(element.HRB) {
      //companyNames.append("<li class='mt-2'>" + element.name + "</li><li> HRB Nummer: " +  element.HRB + "</li>");
      listGroup.append('<span class="list-group-item list-group-item-action" data-hrb=' + element.HRB + '>' + element.name + '</span>');
    }
  });
  $(".list-group-item").click(function() {
    console.log(this.dataset.hrb);
    $('#chart').text("");
    getCompanyData(suchString, this.dataset.hrb);
  });

};

// checken ob Umsatz oder Bilanzsumme veroeffentlicht wurde
function getKeys(companyDataArray) {
  for(var i = 0; i < companyDataArray.length; i++) {
    if(Object.keys(companyDataArray[i]).length === 3) {
      console.log(Object.keys(companyDataArray[i]));
      return  Object.keys(companyDataArray[i]);
      break;
    }
  }
  return [];
};
