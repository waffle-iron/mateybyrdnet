var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;

var updating = false;

router.get('/', function(req,res,next) {
  res.send("Status page");
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