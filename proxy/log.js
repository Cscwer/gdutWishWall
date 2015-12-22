var log4js = require('log4js');
var config = require('../config.js');

log4js.loadAppender('baev3-log');
var options = {
	'user': config.Redis_user,
	'passwd': config.Redis_pwd
};
log4js.addAppender(log4js.appenders['baev3-log'](options));
var logger = log4js.getLogger('node-log-sdk');
logger.setLevel('INFO');
exports.logger = logger;