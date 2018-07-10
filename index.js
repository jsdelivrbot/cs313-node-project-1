var express = require('express');
var app = express();
var url = require('url');
var path = require('path');

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgres://iptoniuchhojnb:6262583c0fd37b8e332622b0db459b4bed853453be64e2c5d57fa38c5a0ef830@ec2-54-83-15-95.compute-1.amazonaws.com:5432/d97n98klgej0nq";
const pool = new Pool({connectionString: connectionString, ssl: true});
pool.connect();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(path.join(__dirname + 'public/')));

app.set('/views', path.join(__dirname + 'views'));
app.set('view engine', 'ejs');
app.get('/', getGames)
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

    getGameFromDb(id, function(error, result) {
        console.log("Back from the getGameFromDb function with result:", result);
        // res.json(result);
        if (error || result == null || result.length != 1) {
            res.status(500).json({success:false, data: error});
        } else {
            res.json(result[0]);
        }
    });
}

function getGameFromDb(id, callback) {
    console.log("getGameFromDb called with id:", id);
    id = Number(id);
    var sql = "SELECT gamesid, title, description, instructions, numofplayers, numofdecks, relaxed, timeLength FROM games WHERE gamesid = $1::int";
    var params = [id];

    pool.query(sql, params, function(err, results) {
        if (err) {
            console.log("An error with the DB occured:");
            console.log(err);
            callback(err, null);
        }
        console.log("Found DB results: " +  JSON.stringify(results.rows));

        callback(null, results.rows);
    });
}

function getGames(req, res) {
    console.log('Getting games...');

    getGamesFromDb(function(error, result) {
        console.log("Back from the getGamesFromDb function with result:", result);
        // res.json(result);
        if (error || result == null) {
            res.status(500).json({success:false, data: error});
        } else {
            // res.json(result);
            var params = {result: result};
            res.render(path.join('\home'), params);
        }
    });
}

function getGamesFromDb(callback) {
    var sql = "SELECT gamesid, title, description FROM games";

    pool.query(sql, function(err, results) {
        if (err) {
            console.log("An error with the DB occured:");
            console.log(err);
            callback(err, null);
        }
        console.log("Found DB results: " +  JSON.stringify(results.rows));

        callback(null, results.rows);
    });
}