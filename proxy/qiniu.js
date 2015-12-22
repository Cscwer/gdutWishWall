var qiniu = require('qiniu');
var config = require('../config');
qiniu.conf.ACCESS_KEY = config.Qiniu_Access_Key;
qiniu.conf.SECRET_KEY = config.Qiniu_Secret_Key;
var client = new qiniu.rs.Client();
module.exports = client;