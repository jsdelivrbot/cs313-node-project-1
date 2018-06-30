var express = require('express');
var app = express();
var url = require('url');
var path = require('path');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(path.join(__dirname + 'public')));

app.set('/views', path.join(__dirname + 'views'));
app.set('view engine', 'ejs');
app.get('/', function (req, res) {
        res.render(path.join('\home'));
    })
    .get('/user', function (req, res) {
        res.render(path.join('\admin'));
    })
    .get("/game/:id", getGame)
    .get("/new", function(req, res) {
        res.sendFile(path.join(__dirname + '/public/form.html'));
    })

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

function getGame(req, res) {
    console.log('Getting game...');
    var id = req.params.id;
    console.log("Looking for game with id: " + id);

    // TODO: Get the video from the DB here...

    var result = {
        "title": "Title",
        "id": id,
        "description": "Description"
    };
    res.json(result);
}
