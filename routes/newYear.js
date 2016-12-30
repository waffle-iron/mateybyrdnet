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

function renderNewYear(req, res) {
  var receiver = req.params.receiver;
  if (!receiver) receiver='';
  var sender = req.params.sender;
  if (!sender) sender='Nick Belzer';

  res.render('newYear', { title: 'Happy New Year', sender: sender, receiver: receiver, message: getMessageByCode('default').message});
}

function renderNewYearByCode(req, res) {
  var message;
  message = getMessageByCode(req.params.code);
  res.render('newYear', { title: 'Happy New Year', sender: 'Nick Belzer', receiver: message.for, message: message.message});
}

function getMessageByCode(code) {
  for (var i = 0; i < messages.length; i++) {
    console.log(messages[i].code);
    if (code == messages[i].code)
      return messages[i];
  }
}

module.exports = router;