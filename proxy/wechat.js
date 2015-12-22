var nodegrass = require('nodegrass');
var config = require('../config');

exports.getWeChatUserInfo = function(token, openid, callback) {
    nodegrass.get('https://api.weixin.qq.com/sns/userinfo?access_token=' + token + '&openid=' + openid + '&lang=zh_CN', callback);
};

exports.getUserAccessToken = function(code, callback) {
    nodegrass.get('https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.AppId + '&secret=' + config.AppSecret + '&code=' + code + '&grant_type=authorization_code', callback);
};

exports.getAppAccessToken = function(callback) {
	nodegrass.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + config.AppId + '&secret=' + config.AppSecret, callback);
};

exports.getApiTicket = function(token, callback) {
	nodegrass.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token + '&type=jsapi', callback);
};

exports.getImage = function(token, media, callback) {
	nodegrass.get('http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=' + token + '&media_id=' + media, callback);
};