var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MateyByrd.Net' });
});

router.get('/christmas', function(req, res, next) {
  res.render('christmas', { title: 'Merry Christmas' });
});

module.exports = router;
