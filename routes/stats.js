var express = require('express');
var router = express.Router();
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var updating = false;
var lastUpdate = new Date();

router.get('/', function(req,res,next) {
  var uptime, nodeVersion, npmInfo;
  exec('uptime', function(error, stdout, stderr) {
    uptime = stdout;
     exec('node -v', function(error, stdout, stderr) {
      nodeVersion = stdout;
      res.render('stats', { title: 'MateyByrd.Net | Status', uptime: uptime, lastUpdate: lastUpdate, nodeVersion: nodeVersion });
     });
  });
});

router.get('/update', function(req, res, next) {
  console.log("--> Update requested");
  if (!updating) {
    updating = true;
    res.send("Updating the website...");
    console.log("--> Update started");
    var update = spawn('sh', ['/srv/www/updateDev.sh'], { detached: true });
  } else {
    res.send("Update has already been requested...");
  }
});

module.exports = router;