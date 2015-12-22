var Proxy = require('../proxy/index');
var qiniu = require('qiniu');
var config = require('../config');
var qiniuClient = require('../proxy/qiniu.js');


/**
 * 验证是否有 openid
 */
exports.openidRequired = function(req, res, next) {
    res.sendfile('app/end.html');
    // if (req.session.openid) {
    //     next();
    // } else {
    //     res.redirect(301, 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxc0328e0fe1f4cc8b&redirect_uri=http%3A%2F%2Fgdutgirl.duapp.com%2Fuserauth&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect');
    // }
};


//验证是否新用户
exports.isNewUser = function(req, res, next) {
    res.sendfile('app/end.html');
    // req.query.code = req.query.code || null;
    // if (req.query.code) {
    //     Proxy.WeChat.getUserAccessToken(req.query.code, function(data, status, header) {
    //         if (status === 200) {
    //             var token = JSON.parse(data);
    //             if (token.access_token) {
    //                 req.session.openid = token.openid;
    //                 req.session.token = token.access_token;
    //                 Proxy.User.getUserByOpenId(token.openid, function(err, user) {
    //                     if (!err) {
    //                         if (user) {
    //                             next();
    //                         } else {
    //                             //拉取用户信息
    //                             Proxy.WeChat.getWeChatUserInfo(req.session.token, req.session.openid, function(data, status, header) {
    //                                 if (status === 200) {
    //                                     var userdata = JSON.parse(data);
    //                                     if (!userdata.errcode) {
    //                                         var img_name = 'user-' + Math.random().toString(36).substr(2, 15);
    //                                         qiniuClient.fetch(userdata.headimgurl + '132', 'gdutgirl', img_name, function(err, ret) {
    //                                             if (err) {
    //                                                 Proxy.Log.logger.info('[七牛服务器消息] 获取头像图片出错，错误信息 ' + err.error);
    //                                             } else {
    //                                                 var url = qiniu.rs.makeBaseUrl(config.Qiniu_Repo_Url, img_name);
    //                                                 userdata.wishwallheadimgurl = url;
    //                                                 Proxy.User.addNewUser(userdata, function(err) {
    //                                                     if (!err) {
    //                                                         next();
    //                                                     } else {
    //                                                         res.send({
    //                                                             err: '获取信息出错'
    //                                                         });
    //                                                     }
    //                                                 });
    //                                             }
    //                                         });
    //                                     } else {
    //                                         res.redirect('/');
    //                                     }
    //                                 } else {
    //                                     res.redirect('/');
    //                                 }
    //                             });
    //                         }
    //                     } else {
    //                         res.send({
    //                             err: '服务器出错'
    //                         });
    //                     }
    //                 });
    //             } else {
    //                 res.redirect('/');
    //             }
    //         } else {
    //             res.redirect('/');
    //         }
    //     });
    // } else {
    //     res.redirect('/');
    // }
};

//检查是否有图片需要上传
exports.hasPic = function(req, res, next) {
    req.body.mediaId = req.body.mediaId || null;
    if (req.body.mediaId) {
        Proxy.WeChat.getAppAccessToken(function(data, status, header) {
            if (status === 200) {
                var wxapptoken = JSON.parse(data);
                if (wxapptoken.access_token) {
                    console.log("token如下");
                    console.log(wxapptoken.access_token);
                    // Proxy.Redis.redisClient.set("wechat_apptoken", apptoken.access_token);
                    // Proxy.Redis.redisClient.expire("wechat_apptoken", 7200);
                     var apptoken = wxapptoken.access_token;
                    var random_key = 'wishimg-' + Math.random().toString(36).substr(2, 15);
                    qiniuClient.fetch('http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=' + apptoken + '&media_id=' + req.body.mediaId, 'gdutgirl', random_key, function(err, ret) {
                        if (err) {
                            // Proxy.Log.logger.info('[七牛服务器消息] 重新获取图片出错，错误信息 ' + err.error);
                            console.log("七牛出错");
                            console.log(err);
                            next();
                        } else {
                            // Proxy.Log.logger.info('[七牛服务器消息] 重新获取图片请求成功');
                            var url = qiniu.rs.makeBaseUrl(config.Qiniu_Repo_Url, random_key);
                            req.body.imgurl = url;
                            next();
                        }
                    });
                } else {
                    next();
                }
            } else {
                next();
            }
        });
    } else {
        next();
    }
};

exports.hasPic = function(req, res, next) {
    req.body.mediaId = req.body.mediaId || null;
    if (req.body.mediaId) {
        var apptoken;
        Proxy.Redis.redisClient.get('wechat_apptoken', function(err, result) {
            if (!err) {
                apptoken = result;
                var random_key = 'wishimg-' + Math.random().toString(36).substr(2, 15);
                qiniuClient.fetch('http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=' + apptoken + '&media_id=' + req.body.mediaId, 'gdutgirl', random_key, function(err, ret) {
                    if (err) {
                        Proxy.Log.logger.info('[七牛服务器消息] 获取图片出错，错误信息 ' + err.error);
                        next();
                    } else {
                        Proxy.Log.logger.info('[七牛服务器消息] 图片请求成功');
                        var url = qiniu.rs.makeBaseUrl(config.Qiniu_Repo_Url, random_key);
                        req.body.imgurl = url;
                        next();
                    }

                });
            } else {
                Proxy.Log.logger.info("[redis 服务器消息] 获取apptoken失败，错误原因 " + err);
                Proxy.WeChat.getAppAccessToken(function(data, status, header) {
                    if (status === 200) {
                        var apptoken = JSON.parse(data);
                        if (apptoken.access_token) {
                            Proxy.Redis.redisClient.set("wechat_apptoken", apptoken.access_token);
                            Proxy.Redis.redisClient.expire("wechat_apptoken", 7200);
                            apptoken = apptoken.access_token;
                            var random_key = 'wishimg-' + Math.random().toString(36).substr(2, 15);
                            qiniuClient.fetch('http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=' + apptoken + '&media_id=' + req.body.mediaId, 'gdutgirl', random_key, function(err, ret) {
                                if (err) {
                                    Proxy.Log.logger.info('[七牛服务器消息] 重新获取图片出错，错误信息 ' + err.error);
                                    next();
                                } else {
                                    Proxy.Log.logger.info('[七牛服务器消息] 重新获取图片请求成功');
                                    var url = qiniu.rs.makeBaseUrl(config.Qiniu_Repo_Url, random_key);
                                    req.body.imgurl = url;
                                    next();
                                }
                            });
                        } else {
                            next();
                        }
                    } else {
                        next();
                    }
                });
            }
        });
    } else {
        next();
    }
};

//判断是否需要发送通知邮件
exports.hasEmail = function(req, res, next) {
    Proxy.Log.logger.info("[中间件消息] 请求所带的邮件地址为" + req.body.email);
    req.body.email = req.body.email || null;
    if (req.body.type === 1) {
        if (req.body.email) {
            Proxy.Email.sendMail(req.body.email, function(error, info) {
                if (!error) {
                    console.log('愿望领取邮件发送成功');
                    Proxy.Log.logger.info("[邮件服务消息] 领取愿望成功的邮件发送成功，收件人：" + req.body.username);
                    next();
                } else {
                    console.log('愿望领取邮件发送失败');
                    Proxy.Log.logger.info("[邮件服务消息] 领取愿望成功的邮件发送失败，收件人：" + req.body.username + "，错误信息：" + error);
                    next();
                }
            });
        } else {
            next();
        }
    } else {
        next();
    }
};

exports.rewriteLover = function(req, res, next) {
    Proxy.User.getUserById(req.body.uid, function(err, user) {
        if (!err) {
            if (user.mystery_lover_id) {
                Proxy.User.setMatchState(user.mystery_lover_id, 0, function(err, docs) {
                    next();
                });
            } else {
                next();
            }
        } else {
            res.send({
                err: err
            });
        }
    });
};