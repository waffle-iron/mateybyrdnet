/**
 * Created by Nick Belzer on 29/11/2016.
 */

var fs = require('fs');
var dataReader = {};

dataReader.getPageData = function(file)
{
  return dataReader.getParsedJSON('public/page-data/' + file + '.json');
};

dataReader.getParsedJSON = function(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.log("Error while trying to read file :" + err.code + " file: " + file);
  }
};

module.exports = dataReader;
