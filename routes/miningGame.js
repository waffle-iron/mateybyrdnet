/**
 * Created by nickbelzer on 23/12/2016.
 */
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment = require('moment');

var dbConnection = mysql.createConnection(require('./helpers/keys').mysql);
var productionTime = 6;
var productionRate = 1;


dbConnection.connect(function(err){
  if (err) console.log("=> Was not able to connect to the database " + err.message);
  else {
    console.log('=> Compressing transactions data to 10 minutes');
    compressData(12);
  }
});

/**
 * Returns the mining game html document that can be loaded in to a web page.
 */
router.get('/', function(req, res, next) {
  res.render('miningGame');
});

/**
 * Checks the given session, it looks for a cookie which if found will be
 * checked if it is still valid, if no cookie is found it will create a new
 * one for the user with a new session-id.
 */
router.get('/checkSession', function(req, res, next) {
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

/**
 * This is used to let the server know the session is still connected, if
 * this is done faster than the productionTime the client can will finish
 * their production cycle and will be rewarded with a crystal.
 *
 * Returns a JSON with the total amount of crystals produced to the client.
 */
router.get('/connected', function(req, res, next) {
  var sessionId = getSessionId(req);

  // Check if we are dealing with a valid session.
  if (!isValidSession(sessionId)) { res.send(); return; }

  console.log('=> session ' + sessionId + ' is still here');

  checkProductionCycle(sessionId);

  // Query the database to get the total amount of cyrstals produced.
  dbConnection.query(
    'SELECT SUM(transactions.amount) as crystals ' +
    'FROM mining_game.transactions;', function(err, result) {
      if (!err) {
        res.json(result[0]);
      } else {
        console.log('=> Error while executing query for connected, ' + err.message);
        res.json({});
      }
    });
});

/**
 * Returns the sessionData for one session, the session is determined by the
 * cookie this session has been given and should be sent with it.
 *
 * Returns the amount of workers and the amount of crystals produced by this
 * session to the session.
 */
router.get('/sessionData', function(req, res, next) {
  var sessionId = getSessionId(req);

  if (!isValidSession(sessionId)) { res.send(); return; }

  // Query the database to check for the amount of workers and the amount of
  // crystals for this session.
  dbConnection.query(
    'SELECT workers, SUM(transactions.amount) as crystals' +
    ' FROM mining_game.sessions' +
    ' INNER JOIN mining_game.transactions ON' +
    ' sessions.session_id=transactions.session_id' +
    ' WHERE sessions.session_id=' + sessionId + ';', function(err, result) {
      if (!err) {
        console.log('=> sending data to ' + sessionId);
        res.json(result[0]);
      } else {
        console.log("=> Error while executing query for sessionData for " + sessionId + ", " + err.message);
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
      res.cookie('session-id', result.insertId, { maxAge: 365*24*60*60*100, signed: true });

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

/**
 * Checks the productionCycle for a given session, if the cycle is
 * completed, that is the last_active value and now differ at a max of
 * productionTime seconds, a transaction will be made giving this user a
 * crystal per worker. If this value is not lower that the productionTime
 * value only the last_active attribute will be updated.
 *
 * @param sessionId The sessionId of the cycle you want to update.
 */
function checkProductionCycle(sessionId) {
  // Query the database to check when the session was last active and how many
  // workers this session has.
  dbConnection.query('SELECT sessions.last_active, sessions.workers FROM' +
    ' mining_game.sessions WHERE sessions.session_id=' + sessionId + ';',
    function (err, result) {

    if (!err) {
      // Convert the dates to moments to later on be able to calculate the
      // difference in seconds.
      var lastActive = new moment(result[0]['last_active']);
      var now = new moment(new Date());

      // Calculate the difference in seconds.
      var difference = now.diff(lastActive, 'seconds');

      if (difference <= productionTime) {
        // If the difference is less than the productiontime we finish the
        // production cycle for this session.
        finishProductionCycle(sessionId, result[0]['workers']);
      } else {
        // If the difference is more than the productiontime we update the
        // last_active value and allow the client to start a new
        // production cycle.
        updateLastActive(sessionId);
      }
    } else {
      console.log('=> Error while executing query for connected, ' + err.message);
    }
  });
}

/**
 * Returns the sessionId from a signed cookie.
 * @param req The request made to the server, which also contains the signed
 * cookies.
 * @returns {Number} The sessionId value.
 */
function getSessionId(req) {
  return parseInt(req.signedCookies['session-id']);
}

/**
 * Checks whether or not the given sessionId is valid, that is, it is not
 * equal to NaN, null etc.
 *
 * @param sessionId The sessionId to check.
 * @returns {boolean} Whether or not this sessionId is valid.
 */
function isValidSession(sessionId) {
  if (sessionId=='NaN') return false;
  if (sessionId=='null') return false;
  if (!sessionId) return false;
  return true;
}

/**
 * Function that lets the database know a session has completed a production
 * cycle, this method will add a transaction for that session.
 *
 * @param sessionId The session that has finished a cycle.
 * @param workers The amount of workers this session has.
 */
function finishProductionCycle(sessionId, workers) {
  dbConnection.query('INSERT INTO mining_game.transactions VALUES (NULL, ' + sessionId + ', ' + workers * productionRate + ', NOW());', function(err, result) {
    if (err) console.log('=> Error while adding a new transaction, ' + err.message);
  });

  updateLastActive(sessionId);
}

/**
 * Function that updates the last_active of a session, this has to be done
 * everytime a session lets the server know it is still connected, this so
 * that we know if it has been connected during the current production
 * cycle. This method updates the last_active value to the current date.
 *
 * @param sessionId The sessionId of the session we need to update.
 */
function updateLastActive(sessionId) {
  dbConnection.query('UPDATE mining_game.sessions SET' +
    ' sessions.last_active=NOW() WHERE sessions.session_id=' + sessionId + ';', function(err, result) {
    if (err) console.log('=> Error while updating last_active of session ' + sessionId + ', ' + err.message);
  });
}

/**
 * Method that compresses transaction data based on 10 minutes sprints, all
 * the data of 10 minutes for one session will be compressed to a single row
 * in the table.
 *
 * @param pastHours How far back this query should look to compress data.
 */
function compressData(pastHours) {
  // Get all sessions
  dbConnection.query('SELECT sessions.session_id FROM mining_game.sessions;', function(err, sessions) {
    if (!err) {
      for (var i = 0; i < sessions.length; i++) {
        var sessionId = sessions[i].session_id;

        dbConnection.query('SELECT DATE(t.timestamp) as date, HOUR(t.timestamp) as hour, FLOOR( MINUTE(t.timestamp) / 10) as hourPart, SUM(t.amount) as amount FROM mining_game.transactions as t WHERE t.session_id=' + sessionId + ' AND TIMEDIFF(NOW(), t.timestamp) < ' + pastHours*60*60 + ' GROUP BY date, hour, hourPart;', function(err, result) {
          if (err) console.log('=> Error while requesting compressed' +
            ' transactions, ' + err.message);
          else updateCompressedSessions(sessionId, pastHours, result);
        });
      }
    }
  });
}

/**
 * From the compressed rows we have to remove the old transactions and add
 * the new compressed ones to the database.
 *
 * @param sessionId the sessionId we are currently working with.
 * @param pastHours How far back we should look to remove the old transactions.
 * @param rows The compressed rows we should process.
 */
function updateCompressedSessions(sessionId, pastHours, rows) {
  // If we are not dealing with an error remove the preexisting rows,
  // since these are now in memory.
  dbConnection.query('DELETE FROM mining_game.transactions WHERE' +
    ' transactions.session_id=' + sessionId + ' AND TIMEDIFF(NOW(), transactions.timestamp) < '+ pastHours*60*60 + ';', function(err, result) {
    if (err) console.log("=> Something went wrong when" +
      " compressing the data, " + err.message);
  });
  // For each item we got add the compressed version to the database.
  for (var i = 0; i < rows.length; i++) {
    // Make sure we get a datetime value that is based on the 10 minute
    // sessions.
    rows[i].date.setHours(rows[i].hour);
    rows[i].date.setMinutes(10 * rows[i].hourPart);
    var datetime = new moment(rows[i].date);

    // Add the compressed version back in to the database.
    dbConnection.query('INSERT INTO mining_game.transactions' +
      ' VALUES(null, ' + sessionId + ', ' + rows[i].amount + ', TIMESTAMP(\'' + datetime.format('YYYY-MM-DD HH:mm:ss') + '\'));', function(err, result) {
      if (err) console.log("=> Something went wrong when" +
        " compressing the data, " + err.message);
    });
  }
}

module.exports = router;