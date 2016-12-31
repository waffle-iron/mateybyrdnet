/**
 * Created by nickbelzer on 30/12/2016.
 */

var express = require('express');
var router = express.Router();
var dataReader = require('./helpers/dataReader.js');

var christmasCounter = 0;

router.get('/christmas', function(req, res, next) {
  res.render('christmas', { title: 'Merry Christmas', sender: 'Nick Belzer', receiver: '' });
  christmasCounter++;
});

router.get('/christmas/:receiver', function(req, res, next) {
  var receiver = req.params.receiver;
  if (!receiver) receiver='';
  res.render('christmas', { title: 'Merry Christmas', receiver: receiver, sender: 'Nick Belzer' });
  christmasCounter++;
});

router.get('/christmas/:receiver/:sender', function(req, res, next) {
  var receiver = req.params.receiver;
  if (!receiver) receiver='';
  var sender = req.params.sender;
  if (!receiver) sender='Nick Belzer';
  res.render('christmas', { title: 'Merry Christmas', receiver: receiver, sender: sender });
  christmasCounter++;
});

router.get('/christmasCounter', function(req, res, next) {
  res.json({'count':christmasCounter});
});

module.exports = router;