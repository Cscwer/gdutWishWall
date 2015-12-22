var Proxy = require('../proxy/index');
var qiniu = require('qiniu');
var config = require('../config');
var redis = require('../proxy/redis.js');
var qiniuClient = require('../proxy/qiniu.js');


/**
 * 验证是否有 openid
 */
exports.openidRequired = function(req, res, next) {
    if (req.session.openid) {
        next();
    } else {
        console.log("there is no openid");
        res.redirect(301, 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxc0328e0fe1f4cc8b&redirect_uri=http%3A%2F%2Fgdutgirl.duapp.com%2Fuserauth&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect');
    }
};


//验证是否新用户
exports.isNewUser = function(req, res, next) {
    req.query.code = req.query.code || null;
    if (req.query.code) {
        Proxy.WeChat.getUserAccessToken(req.query.code, function(data, status, header) {
            if (status === 200) {
                var token = JSON.parse(data);
                console.log(token.openid);
                if (token.access_token) {
                    req.session.openid = token.openid;
                    req.session.token = token.access_token;
                    Proxy.User.getUserByOpenId(token.openid, function(err, user) {
                        if (!err) {
                            if (user) {
                                next();
                            } else {
                                res.redirect('/newuser');
                            }
                        } else {
                            res.send({
                                err: '服务器出错'
                            });
                        }
                    });
                } else {
                    res.send({
                        err: '获取微信信息出错,请重新授权'
                    });
                }
            } else {
                res.send({
                    err: '请求微信服务器出错'
                });
            }
        });
    } else {
        res.send({
            err: '请先授权'
        });
    }
};

exports.addNewUser = function(req, res, next) {
    //拉取用户信息
    Proxy.WeChat.getWeChatUserInfo(req.session.token, req.session.openid, function(data, status, header) {
        if (status === 200) {
            var userdata = JSON.parse(data);
            if (!userdata.errcode) {
                var img_name = 'user' + '-' + userdata.openid;
                qiniuClient.fetch(userdata.headimgurl+'64', 'gdutgirl', img_name, function(err, ret) {
                    if (err) {
                        console.log(err.error);
                        console.log('图片出错了');
                    } else {
                        console.log('图片请求成功');
                        var url = qiniu.rs.makeBaseUrl(config.Qiniu_Repo_Url, img_name);
                        userdata.headimgurl = url;
                        Proxy.User.addNewUser(userdata, function(err) {
                            if (!err) {
                                next();
                            } else {
                                res.send({
                                    err: '获取信息出错'
                                });
                            }
                        });
                    }
                });
            } else {
                res.send({
                    err: '获取用户信息出错'
                });
            }
        } else {
            res.send({
                err: '请求微信服务器出错'
            });
        }
    });
};

//检查是否有图片需要上传
exports.hasPic = function(req, res, next) {
    req.body.mediaId = req.body.mediaId || null;
    if (req.body.mediaId) {
        var apptoken;
        redis.get('wechat_apptoken', function(err, result) {
            apptoken = result;
            var random_key = Math.random().toString(36).substr(2, 15);
            qiniuClient.fetch('http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=' + apptoken + '&media_id=' + req.body.mediaId, 'gdutgirl', random_key, function(err, ret) {
                if (err) {
                    console.log(err.error);
                    console.log('图片出错了');
                    next();
                } else {
                    console.log('图片请求成功');
                    var url = qiniu.rs.makeBaseUrl(config.Qiniu_Repo_Url, random_key);
                    req.body.imgurl = url;
                    next();
                }

            });
        });
    } else {
        next();
    }
};

//判断是否需要发送通知邮件
exports.hasEmail = function(req, res, next) {
    req.body.email = req.body.email || null;
    console.log('要发送的地址为');
    console.log(req.body.email);
    if (req.body.type === 1) {
        if (req.body.email) {
            Proxy.Email.sendMail(req.body.email, function(error, info) {
                if(!error) {
                    console.log('邮件完成');
                } else {
                    console.log('邮件出错');
                }
            });
            next();
        } else {
            next();
        }
    } else {
        next();
    }
};