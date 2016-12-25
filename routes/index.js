var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MateyByrd.Net' });
});


router.get('/christmas', function(req, res, next) {
  res.render('christmas', { title: 'Merry Christmas', sender: 'Nick Belzer', receiver: '' });
});

router.get('/christmas/:receiver', function(req, res, next) {
  var receiver = req.params.receiver;
  if (!receiver) receiver='';
  res.render('christmas', { title: 'Merry Christmas', receiver: receiver, sender: 'Nick Belzer' });
});

router.get('/christmas/:receiver/:sender', function(req, res, next) {
  var receiver = req.params.receiver;
  if (!receiver) receiver='';
  var sender = req.params.sender;
  if (!receiver) sender='Nick Belzer';
  res.render('christmas', { title: 'Merry Christmas', receiver: receiver, sender: sender });
});


module.exports = router;
