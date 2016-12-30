var express = require('express');
var router = express.Router();
var dataReader = require('./helpers/dataReader.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  var projects = dataReader.getPageData('projects');
  res.render('index', { title: 'MateyByrd.Net', projects: projects });
});

module.exports = router;
