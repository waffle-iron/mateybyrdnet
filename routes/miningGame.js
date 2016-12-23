/**
 * Created by nickbelzer on 23/12/2016.
 */
var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var dbConnection = mysql.createConnection(require('./helpers/keys').mysql);

dbConnection.connect(function(err){
  if (err) console.log("=> Was not able to connect to the database " + err.message);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  var sessionCookie = req.signedCookies['session-id'];
  if (!sessionCookie) {
    console.log("=> New session connected");

    dbConnection.query('INSERT INTO mining_game.sessions VALUES(null, NOW(),' +
      ' DEFAULT);', function(err, result) {
      if (!err) {
        console.log("=> Created new session with id " + result.insertId);
        res.cookie('session-id', result.insertId, { secure: true, signed: true });
        res.json({"connection":true, "session-id": result.insertId});
      } else {
        console.log("=> Error while adding new session, " + err.message);
        res.json({"connection":false});
      }
    });

  } else {
    console.log("=> Already existing session connected, " + sessionCookie);

    dbConnection.query('SELECT session_id FROM mining_game.sessions WHERE' + ' session_id=' + sessionCookie + ';', function(err, rows) {
      if (!err) {
        if (rows[0].session_id == sessionCookie) {
          res.json({"connection":true, "session-id": parseInt(sessionCookie)});
        } else {
          res.json({"connection":false});
        }
      } else {
        console.log("=> Error while checking for existing session, " + err.message);
      }
    });
  }
});

router.get('/sessionData/:session_id', function(req, res, next) {
  dbConnection.query(
    'SELECT workers, SUM(transactions.amount) as crystals ' +
    'FROM mining_game.sessions ' +
    'INNER JOIN mining_game.transactions ON sessions.session_id =' +
    ' transactions.session_id ' +
    'WHERE sessions.session_id = ' + req.params.session_id + ';',
    function(err, result) {
      if (!err) {
        res.json(result[0]);
      } else {
        console.log("=> Error while executing query for sessionData for " + req.params.session_id + ", " + err.message);
        res.json([]);
      }
    });
});

module.exports = router;