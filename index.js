var express = require('express');
var app = express();
var url = require('url');
var path = require('path');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(path.join(__dirname + 'public')));

app.set('/views', path.join(__dirname + 'views'));
app.set('view engine', 'ejs');
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/form.html'));
})
app.get('/rate', function(req, res) {
    handleForm(req, res);
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

function handleForm(req, res) {
    var requestUrl = url.parse(req.url, true);
    console.log("Query parameters: " + JSON.stringify(requestUrl.query));

    var weight = requestUrl.query.weight;
    var type = requestUrl.query.type;

    computeRate(res, weight, type);
}

// lstamp Letters(Stamped)
// lmeter Letters(Metered)
// lgenv Large Envelopes
// fcpsr First-Class Packaged Serive—Retail

function computeRate(res, weight, type) {
    var cost;
    if (type == 'lstamp') {
        if (weight < 3.5) {
            cost = (0.50 + ((weight - 1) * 0.21)).toFixed(2);
        } else {
            cost = 1.13;
        }
    } else if (type == 'lmeter') {
        if (weight < 3.5) {
            cost = (0.47 + ((weight - 1) * 0.21)).toFixed(2);
        } else {
            cost = 1.10;
        }
    } else if (type == 'lgenv') {
        if (weight < 13) {
            cost = (1.00 + ((weight - 1) * 0.21)).toFixed(2);
        } else {
            cost = 3.52;
        }
    } else if (type == 'fcpsr') {
        if (weight < 4) {
            cost = 3.50;
        } else if (weight < 8) {
            cost = 3.75;
        } else if (weight < 9) {
            cost = 4.10;
        } else if (weight < 10) {
            cost = 4.45;
        } else if (weight < 11) {
            cost = 4.80;
        } else if (weight < 12) {
            cost = 5.15;
        } else if (weight < 13) {
            cost = 5.50;
        }
    } else {
        console.error("There was an error" + res.error);
    }

    var params = {weight: weight, type: type, result: cost};

    res.render('\getRate', params);
}