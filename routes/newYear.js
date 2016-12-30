/**
 * Created by nickbelzer on 30/12/2016.
 */

var express = require('express');
var router = express.Router();
var dataReader = require('./helpers/dataReader.js');

router.get('/', function(req, res, next) {
  res.send("Hi");
});

module.exports = router;