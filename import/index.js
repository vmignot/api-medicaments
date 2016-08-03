const insertFile = require('./insertFile');
const async = require('async')

module.exports = function(callback) {
  const fileNames = ['CIS_bdpm', 'CIS_CIP_bdpm']
  const files = fileNames.map((item) => {
    return {
      name: item,
      path: __dirname + '/../data/'+ item +'.txt'
    }
  })
  async.eachSeries(files, insertFile, callback);
}