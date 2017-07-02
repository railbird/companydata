callApi("companies"); // gets names of all companies in DB

var model = [];

function addToModel(companyName) {
    var add = true;
    model.forEach(function(company) {
        if (companyName === company) add = false;
    });
    if (add) {
        model.push(companyName)
        $('.companyList').append("<li >" + companyName + "</li>");
        addClickEvent();
    };


};

$('#button').click(function() {
    var companyName = $('.input-field').val();
    callApi("companies?name=" + companyName);
});

$(document).keypress(function(e) {
    if (e.which == 13) {
        var companyName = $('.input-field').val();
        callApi("companies?name=" + companyName);
    }
});


function callApi(param) {
    //make ajax request

    $.getJSON("http://localhost:3002/" + param, function(data) { // "https://secure-wave-50472.herokuapp.com/ || http://localhost:3001/"
        if (param === "companies") {
            data.forEach(function(company) {
                addToModel(company.name);
            });
            addClickEvent();
        } else if (param === "companies/details") {
            // list all data to all companies
        } else {
            console.log(data);
            if (data.error && data.companies) {
                $('#output').text(data.error + ": \n" + data.companies);
                return;
            };
            if (data.error) {
              $('#output').text(data.error);
              return;
            };
            var text = "";
            data.data.forEach(function(element) {
                var bilanzsumme = element.bilanzsumme || "nicht veröffentlicht";
                text += "Jahr: " + element.year + "  Gewinn: " + element.gewinn + "  Bilanzsumme: " + bilanzsumme + "\n";
            });
            $('#output').text(text);
            // add click event to <li> item
            addToModel(data.name);
            drawChart(data.data);
            $('#events').html("");
            data.history.events.forEach(function(element) {

                $('#events').append("<li>" + element.time + ": " + element.text + "</li>");
            });

        };

    });
};

function addClickEvent() {
    $('li').click(function(e) {
        var companyName = $(this).text();
        callApi("companies?name=" + companyName);
    });
};

var ctx = $("#myChart");

function drawChart(data) {
    // makes array of labes (jahre)

    var labels = [];
    var dataArray = [];
    var data2Array = [];
    data.forEach(function(element) {
        labels.push(element.year);
        dataArray.push(element.gewinn);
        data2Array.push(element.bilanzsumme);
    });

    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                    label: 'Gewinn',
                    data: dataArray,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 1
                },
                {
                    label: 'Bilanzsumme',
                    data: data2Array,
                    backgroundColor: 'blue',
                    borderColor: 'black',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
};
