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
  checkSession(req, res, function(err, sessionId) {
    if (err) {
      console.log("=> Error while checking for existing session, " + err.message);
      res.json({'connection': false, 'message': 'No session found, please' +
      ' try again'});
    } else {
      res.json({'connection': true, 'session-id': sessionId});
    }
  })
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

/**
 * Checks the session of the user.
 *
 * If a user is new to the page a cookie will be created that contains a unique
 * session-id for that user. If the user already has a session this should
 * be given to the server by a cookie, if we are able to read this cookie,
 * the user did not tamper with this cookie (as far as we can check this)
 * and the session-id is one that is stored in the database we allow that
 * user to get the data for that session.
 *
 * @param req The request parameter that contains the possibly stored cookies.
 * @param res The response parameter, this will only be used to create a
 * session cookie if one does not exist.
 * @param callback A function that executes when the session has been
 * checked. It uses the form function(err, sessionId).
 */
function checkSession(req, res, callback) {

  // Get the session-id cookie if it is available.
  var sessionCookie = req.signedCookies['session-id'];

  if (!sessionCookie) {
    // If the cookie does not exist we are dealing with a new session.
    console.log("=> New session connected");

    createNewSession(res, callback);
  } else {
    // If the cookie already exists we can confirm it's data on the server.
    console.log("=> Already existing session connected, " + sessionCookie);

    checkSessionInDatabase(parseInt(sessionCookie), callback)
  }
}

/**
 * Create a new session
 *
 * If a user does not have a session yet we can give them one by creating a
 * new row in the database and giving them the session_id in a cookie.
 *
 * @param res The response parameter, this will only be used to create a
 * session cookie if one does not exist.
 * @param callback A function that returns the new sessionId if the method
 * was successful.
 */
function createNewSession(res, callback) {
  // Query the database for a new session.
  dbConnection.query('INSERT INTO mining_game.sessions VALUES(null, NOW(),' +
    ' DEFAULT);', function(err, result) {
    if (!err) {
      // If a new session has been added we need to let the user know what
      // session-id it has been given so that it can be identified later on.
      console.log("=> Created new session with id " + result.insertId);

      // Send the given session-id to the user in a cookie.
      res.cookie('session-id', result.insertId, { secure: true, signed: true });

      // Successful callback that returns the given sessionId
      callback(null, result.insertId);
    } else {
      // If for some reason the database was not able to create a new
      // session we make an unsuccessful callback.
      callback(err, null);
    }
  });
}

/**
 * Checks for the existence of a session-id
 *
 * Uses the database to check whether or not the session-id given by the user
 * exists.
 *
 * @param sessionId The sessionId to check for
 * @param callback A function that returns the results of the method, this
 * will be no error and the sessionId if verified.
 */
function checkSessionInDatabase(sessionId, callback) {
  // Query the database to look for the session-id provided by the user
  dbConnection.query('SELECT session_id FROM mining_game.sessions WHERE' + ' session_id=' + sessionId + ';', function(err, rows) {
    if (!err) {
      if (rows[0].session_id == sessionId) {
        // If the session exists on the database we can make a successful
        // callback.
        callback(null, parseInt(sessionId));
      } else {
        // If the session does not exist in the database we let the user
        // know that we were not able to find it's session data.
        callback(new Error("Was not able to find the session-id given by" +
          " the client"), null);
      }
    } else {
      callback(err, null);
    }
  });
}

module.exports = router;