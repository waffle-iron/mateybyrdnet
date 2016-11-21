/**
 * Created by nickbelzer on 21/11/2016.
 */
var express = require('express'),
    router = express.Router(),
    // exec = require('child_process').exec,
    spawn = require('child_process').spawn;

var updating = false;
var lastUpdate = new Date();
var updateDelay = 180;

router.get('/update', function(req, res, next) {
  console.log("Update requested");
  if (updating == false) {
    requestUpdate();
    res.send("Update request received");
  } else {
    res.send("Update request received but failed to initialize");
  }
});

router.post('/update', function(req, res, next) {
  console.log("Update requested");
  if (!updating) {
    requestUpdate();
    res.send('Update request received');
  }
});

function requestUpdate()
{
  if (updating == false && dateDiffInSeconds(lastUpdate, new Date()) > updateDelay)
  {
    updating = true;
    console.log("Executing update");
    spawn('sh', ['/srv/www/updateDev.sh'], { detached: true });
  }
}

function dateDiffInSeconds(a, b) {
  var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds(), a.getMilliseconds());
  var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours(), b.getMinutes(), b.getSeconds(), b.getMilliseconds());

  return Math.floor(Math.abs((utc2 - utc1) / 1000));
}

module.exports = router;
