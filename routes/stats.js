var express = require('express');
var router = express.Router();
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var updating = false;
var lastUpdate = new Date();
var updateDelay = 180;

router.get('/', function(req,res,next) {
  var uptime, nodeVersion, npmInfo;
  var timeSinceLastUpdate = dateDiffInSeconds(lastUpdate, new Date());

  exec('uptime', function(error, stdout, stderr) {
    uptime = stdout;
     exec('node -v', function(error, stdout, stderr) {
      nodeVersion = stdout;
      res.render('stats', { title: 'MateyByrd.Net | Status', uptime: uptime, lastUpdate: lastUpdate, nodeVersion: nodeVersion, timeSinceLastUpdate: timeSinceLastUpdate, updateDelay: updateDelay, updating: updating });
     });
  });
});

router.post('/', function(req, res, next) {

  if (!updating && req.body.update && dateDiffInSeconds(lastUpdate, new Date()) >= updateDelay) {
    res.redirect('/stats');
    requestUpdate();
  } else {
    res.send("Something went wrong");
  }
});

function dateDiffInSeconds(a, b) {
  var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds(), a.getMilliseconds());
  var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours(), b.getMinutes(), b.getSeconds(), b.getMilliseconds());

  return Math.floor(Math.abs((utc2 - utc1) / 1000));
}

function requestUpdate() {
  if (!updating && dateDiffInSeconds(lastUpdate, new Date()) > updateDelay) {
    updating = true;
    var update = spawn('sh', ['/srv/www/updateDev.sh'], { detached: true });
  }
}

router.get('/update', function(req, res, next) {
  console.log("--> Update requested");
  if (!updating) {
    requestUpdate();
    res.send(updating);
    if (updating) 
      console.log("--> Update started");
  } else {
    res.send("Something went wrong");
  }
});

module.exports = router;