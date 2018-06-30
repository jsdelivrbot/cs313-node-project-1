var express = require('express');
var app = express();
var path = require('path');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(path.join(__dirname + 'public')));

app.set('view engine', 'ejs');
app.set("port", 5000)
    .get('/', function (req, res) {
        res.render('\home')
    })

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});