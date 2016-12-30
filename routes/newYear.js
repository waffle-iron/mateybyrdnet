/**
 * Created by nickbelzer on 30/12/2016.
 */

var express = require('express');
var router = express.Router();
var dataReader = require('./helpers/dataReader.js');

var messages = dataReader.getParsedJSON('./routes/messages.json');

router.get('/', renderNewYear);

router.get('/code/:code', renderNewYearByCode);

router.get('/:receiver', renderNewYear);

router.get('/:receiver/:sender', renderNewYear);

router.get('/:receiver/:sender/:message', renderNewYear);

function renderNewYear(req, res) {
  var receiver = req.params.receiver;
  if (!receiver) receiver='To You';
  var sender = req.params.sender;
  if (!sender) sender='Nick Belzer';
  var message = req.params.message;
  if (!message) message=getMessageByCode('default').message;

  res.render('newYear', {title: 'Happy New Year', sender: sender, receiver: receiver, message: message});
}

function renderNewYearByCode(req, res) {
  var message;
  message = getMessageByCode(req.params.code);
  res.render('newYear', {title: 'Happy New Year', sender: 'Nick Belzer', receiver: message.for, message: message.message});
}

function getMessageByCode(code) {
  for (var i = 0; i < messages.length; i++) {
    if (code == messages[i].code)
      return messages[i];
  }
}

module.exports = router;