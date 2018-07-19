var express = require('express');
var session = require('express-session');
var app = express();
var url = require('url');
var path = require('path');

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgres://iptoniuchhojnb:6262583c0fd37b8e332622b0db459b4bed853453be64e2c5d57fa38c5a0ef830@ec2-54-83-15-95.compute-1.amazonaws.com:5432/d97n98klgej0nq";
const pool = new Pool({connectionString: connectionString, ssl: true});
pool.connect();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(path.join(__dirname + 'public/')));
app.use(session({
    name: "cookie-thing",
    secret: "super",
    saveUninitialized: true,
    resave: true
}))
app.set('/views', path.join(__dirname + 'views'));
app.set('view engine', 'ejs');
app.get('/', getGames)
    .get('/user', verifyLogin, function (req, res) {
        res.render(path.join('\admin'));
    })
    .get("/new", function(req, res) {
        res.sendFile(path.join(__dirname + '/public/form.html'));
    })
    .post("/logout", function(req, res) {
        if (req.session.user != "") {
            req.session.destroy();
            res.status(200).json(({success: true}));
        } else {
            res.status(200).json(({success: false}));
        }
    })
    .post("/login", function(req, res) {
        getUser(req, res);
    })
    .get('/getUser', function(req, res) {
        username = req.session.user;
        res.status(200).json({user: username});
    })
    .post('/addUser', addUser)

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

function verifyLogin(req, res, next) {
    console.log(req.session.user);
    if(req.session.user != ""){
        // response.locals.user = req.session.user;
        next();
    }
}

function getUser(req, response) {
    console.log("trying to get user");
    var username = req.body.username;
      getUserFromDb(req, function(error, result) {
          if (error || result == null || result.length != 1) {
             response.status(500).json({success: false, message:'Username/Password incorrect'});
             return response.redirect('/main.html'); 
          } else {
              req.session.user = username;
              return response.redirect('/main.html');
          }
    
      });
    
  }

  function getUserFromDb(req, callback){
    console.log("Getting user from DB with username: " + username);
  
    var username = req.body.username;
    var password = req.body.password;
  
    var sql = "SELECT id, username, password, firstname, lastname FROM users WHERE username = $1 and password = $2";
  
    var params = [username, password];
  
    pool.query(sql, params, function(err, result){
        if (err){
            console.log("Error in query: ");
            console.log(err);
            callback(err, null);
        }
        console.log("Found result: " + JSON.stringify(result.rows));
  
        callback(null, result.rows);
    });
    
  }
  
  function addUser(req, res) {
    console.log("creating a new user");
  
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var username = req.body.username;
    var password = req.body.password;
    var passwordConfirm = req.body.passwordConfirm;
  
    addUserToDb(req, function(error) {
      if (error) {
         res.status(500).json({success: false}); 
         return res.redirect('/main.html');
      } else {
        req.session.user = username;
        return res.redirect('/main.html');
  
      }
  
      });
    
}

function addUserToDb(req, callback){
    console.log("Getting user from DB with username: " + username);

    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var username = req.body.username;
    var password = req.body.password;
    var passwordConfirm = req.body.passwordConfirm;

    
    var sql = "INSERT INTO users(username, password, firstname, lastname) VALUES($1, $2, $3, $4)";
  
    var params = [username, password, firstname, lastname];
  
    pool.query(sql, params, function(err, result){
        if (err){
            console.log("Error in query: ");
            console.log(err);
            callback(err, null);
        }
  
        console.log("User Added.");
  
        callback(null);
    });
    
}  