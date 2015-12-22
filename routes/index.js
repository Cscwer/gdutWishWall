/***********************服务器路由规则*******************************/

//获取数据库模板
var User = require('../models/user.js');
var Wish = require('../models/wish.js');
var Bless = require('../models/bless.js');
var Msg = require('../models/message.js');
var Token = require('../models/token.js');
var Proxy = require('../proxy');
//获取其他依赖
var nodegrass = require('nodegrass');
var config = require('../config');
//引入缓存
var redisClient = require('../proxy/redis.js');

//默认访问 index.html
exports.goIndex = function(req, res) {
    res.sendfile('app/app.html');
};

//获取指定用户的信息
exports.getUserInfo = function(req, res) {
    req.params.userId = req.params.userId || null;
    Proxy.User.getUserById(req.params.userId, function(err, user) {
        if (!err) {
            if (user) {
                res.send({
                    user: user
                });
            } else {
                res.send({
                    errmsg: '获取用户信息失败，请重新进入。'
                });
            }
        } else {
            res.send({
                errmsg: '获取用户信息失败，请重新进入。'
            });
        }
    });
};

exports.getMyInfo = function(req, res) {
    req.session.openid = req.session.openid || null;
    Proxy.User.getUserByOpenId(req.session.openid, function(err, user) {
        if (!err) {
            if (user) {
                res.send({
                    data: user
                });
            } else {
                res.send({
                    error: '导入用户信息出错，请重新进入许愿墙'
                });
            }
        } else {
            res.send({
                error: '导入用户信息出错，请重新进入许愿墙'
            });
        }
    });
};

//获取所有未领取愿望
exports.getUnpickedWish = function(req, res) {
    Proxy.Wish.getUnpickedWishes(req.query.page, req.query.perPage, req.query.area, req.query.type, function(err, wishes) {
        if (!err) {
            res.send({
                wishes: wishes
            });
        } else {
            res.send({
                err: err
            });
        }
    });
};

exports.searchWish = function(req, res) {
    Proxy.Wish.searchWish(req.query.content, function(err, wishes) {
        if (!err) {
            res.send({
                wishes: wishes
            });
        } else {
            res.send({
                err: err
            });
        }
    });
};

//处理许愿请求
exports.putWish = function(req, res) {
    Proxy.Wish.addNewWish(req.body, function(err) {
        if (!err) {
            res.end();
        } else {
            res.send({
                err: err
            });
        }
    });
};

//更新用户信息
exports.updateInfo = function(req, res) {
    Proxy.User.updateUserInfo(req.params.userId, req.body, function(err, num) {
        if (!err) {
            res.end();
        } else {
            res.send({
                err: err
            });
        }
    });
};

//获取指定愿望
exports.getWish = function(req, res) {
    req.params.wishId = req.params.wishId || null;
    Proxy.Wish.getWishById(req.params.wishId, function(err, wish) {
        if (!err) {
            res.send({
                wish: wish
            });
        } else {
            res.send({
                err: err
            });
        }
    });
};

//获取某个人的愿望
exports.getOnesWish = function(req, res) {
    req.params.userId = req.params.userId || null;
    req.query.sex = req.query.sex || null;
    if (req.query.sex === '2') {
        Proxy.Wish.getWishByPickerId(req.params.userId, function(err, wishes) {
            if (!err) {
                res.send({
                    wishes: wishes
                });
            } else {
                res.send({
                    err: err
                });
            }
        });
    } else if (req.query.sex === '1') {
        Proxy.Wish.getWishesByUserId(req.params.userId, function(err, wishes) {
            if (!err) {
                res.send({
                    wishes: wishes
                });
            } else {
                res.send({
                    err: err
                });
            }
        });
    } else {
        res.send({
            err: '查询出错'
        });
    }

};

//更新愿望状态
exports.updateWishState = function(req, res) {
    console.log('更新愿望状态');
    Proxy.Wish.updateWishState(req.params.wishId, req.body, function(err, docs) {
        if (!err) {
            res.end();
        } else {
            res.send({
                err: err
            });
        }
    });
};

//修改愿望
exports.refreshWish = function(req, res) {
    Proxy.Wish.refreshWishById(req.params.wishId, req.body, function(err, docs) {
        if (!err) {
            res.end();
        } else {
            res.send({
                err: err
            });
        }
    });
};

//删除愿望
exports.deleteWish = function(req, res) {
    Proxy.Wish.deleteWishById(req.params.wishId, function(err, docs) {
        if (!err) {
            res.end();
        } else {
            res.send({
                err: err
            });
        }
    });
};

//获取消息记录
exports.getMessage = function(req, res) {
    req.params.userId = req.params.userId || null;
    Proxy.Msg.getMsgByUserId(req.params.userId, req.params.msgType, function(err, msg) {
        if (!err) {
            res.send({
                msgs: msg
            });
        } else {
            res.send({
                err: err
            });
        }
    });
};

//阅读消息处理
exports.readMessage = function(req, res) {
    req.params.userId = req.params.userId || null;
    if (req.params.msgType === 'Notice') {
        Proxy.Msg.hadReadNotice(req.params.userId, function(err, docs) {
            if (!err) {
                res.end();
            } else {
                res.send({
                    err: err
                });
            }
        });
    }
    if (req.params.msgType === 'Praise') {
        Proxy.Msg.hadReadPraise(req.params.userId, function(err, docs) {
            if (!err) {
                res.end();
            } else {
                res.send({
                    err: err
                });
            }
        });
    }
};

//获取聊天记录
exports.getContact = function(req, res) {
    Proxy.Msg.getContactHistory(req.query.this, req.query.that, function(err, contacts) {
        if (!err) {
            res.send({
                contacts: contacts
            });
        } else {
            res.send({
                err: err
            });
        }
    });
};

//暗恋匹配
exports.loverMatch = function(req, res) {
    Proxy.User.loverSet(req.body.uid, req.body.myname, req.body.hisname, '', function(err, docs) {
        if (!err) {
            Proxy.User.loverMatch(req.body, function(err, user) {
                if (!err) {
                    if (user) {
                        Proxy.Log.logger.info("[暗恋匹配消息] " + req.body.myname + "匹配成功，暗恋对象 " + user.real_name);
                        Proxy.Email.loverMatchEmail(req.body.useremail, function(err, info) {
                            if (!err) {
                                Proxy.Log.logger.info("[暗恋匹配消息] 匹配成功的邮件发送成功，收件人：" + req.body.myname);
                            } else {
                                Proxy.Log.logger.info("[暗恋匹配消息] 匹配成功的邮件发送失败，收件人：" + req.body.myname + "，错误信息 " + err);
                            }
                        });
                        Proxy.Email.loverMatchEmail(user.email, function(err, info) {
                            if (!err) {
                                Proxy.Log.logger.info("[暗恋匹配消息] 匹配成功的邮件发送成功，收件人：" + user.real_name);
                            } else {
                                Proxy.Log.logger.info("[暗恋匹配消息] 匹配成功的邮件发送失败，收件人：" + user.real_name + "，错误信息 " + err);
                            }
                        });
                        Proxy.User.setMatchState(req.body.uid, 1, function(err, docs) {
                            if (!err) {
                                Proxy.Log.logger.info("[暗恋匹配消息] 用户" + req.body.myname + "的匹配状态修改成功");
                            } else {
                                Proxy.Log.logger.info("[暗恋匹配消息] 用户" + req.body.myname + "的匹配状态修改失败");
                            }
                        });
                        Proxy.User.setMatchState(user._id, 1, function(err, docs) {
                            if (!err) {
                                Proxy.Log.logger.info("[暗恋匹配消息] 用户" + user.real_name + "的匹配状态修改成功");
                            } else {
                                Proxy.Log.logger.info("[暗恋匹配消息] 用户" + user.real_name + "的匹配状态修改失败");
                            }
                        });
                        Proxy.User.loverSet(req.body.uid, req.body.myname, req.body.hisname, user._id, function(err, docs) {

                        });
                        Proxy.User.loverSet(user._id, req.body.hisname, req.body.myname, req.body.uid, function(err, docs) {

                        });
                        res.send({
                            result: 1
                        });
                    } else {
                        Proxy.User.setMatchState(req.body.uid, 0, function(err, docs) {
                            if (!err) {
                                res.send({
                                    result: 0
                                });
                            } else {
                                Proxy.Log.logger.info("[暗恋匹配消息] 用户" + req.body.myname + "的匹配状态修改失败");
                                res.end();
                            }
                        });
                    }
                } else {
                    res.send({
                        err: err
                    });
                }
            });
        } else {
            res.send({
                err: err
            });
        }
    });
};

exports.getUnreadMsgNum = function(req, res) {
    req.query.uid = req.query.uid || null;
    Proxy.Msg.getUnreadMsgNum(req.query.uid, function(err, msgs) {
        if (!err) {
            var notice = [];
            var praise = [];
            // var user = [];
            for (var i = 0, len = msgs.length; i < len; i++) {
                if (msgs[i].msg_type === 'Notice') {
                    notice.push(msgs[i]);
                }
                if (msgs[i].msg_type === 'Praise') {
                    praise.push(msgs[i]);
                }
            }
            res.send({
                num: msgs.length,
                notice: notice.length,
                praise: praise.length,
            });
        } else {
            res.send({
                err: err
            });
        }
    });
};

exports.clearUserMsg = function(req, res) {
    Proxy.Msg.hadReadUserMsg(req.query.this, req.query.that, function(err, docs) {
        if (!err) {
            res.end();
        } else {

        }
    });
};

//***************************祝福墙部分***************************

//获取所有祝福
exports.getAllBless = function(req, res) {
    Proxy.Bless.getAllBlesses(req.query.page, req.query.perPage, req.query.area, req.query.sort, function(err, blesses) {
        if (!err) {
            res.send({
                blesses: blesses
            });
        } else {
            res.send({
                err: err
            });
        }
    });
};

//获取特定祝福id的祝福
exports.getBless = function(req, res) {
    req.params.blessId = req.params.blessId || null;
    Proxy.Bless.getBlessById(req.params.blessId, function(err, bless) {
        if (!err) {
            res.send({
                bless: bless
            });
        } else {
            res.send({
                err: err
            });
        }
    });
};

exports.searchBless = function(req, res) {
    Proxy.Bless.searchBless(req.query.content, function(err, blesses) {
        if (!err) {
            res.send({
                blesses: blesses
            });
        } else {
            res.send({
                err: err
            });
        }
    });
};

//获取指定用户的祝福
exports.getUserBlesses = function(req, res) {
    req.params.userId = req.params.userId || null;
    Proxy.Bless.getBlessesByUserId(req.params.userId, function(err, blesses) {
        if (!err) {
            res.send({
                blesses: blesses
            });
        } else {
            res.send({
                err: err
            });
        }
    });
};

//发布新的祝福
exports.putBless = function(req, res) {
    Proxy.Bless.addNewBless(req.body, function(err) {
        if (!err) {
            res.end();
        } else {
            res.send({
                err: err
            });
        }
    });
};

//用户为某一祝福点赞
exports.makePraise = function(req, res) {
    Proxy.Bless.makePraise(req.body, function(err) {
        if (!err) {
            res.end();
        } else {
            res.send({
                err: err
            });
        }
    });
};

//用户删除自己的祝福
exports.deleteBless = function(req, res) {
    Proxy.Bless.deleteBlessById(req.params.blessId, function(err, docs) {
        if (!err) {
            res.end();
        } else {
            res.send({
                err: err
            });
        }
    });
};

/***************************微信部分***************************/


exports.getSignature = function(req, res) {
    Proxy.Redis.redisClient.get("wechat_ticket", function(err, reply) {
        if (!err) {
            if (reply) {
                var signature = Proxy.Sign(reply, req.body.location);
                signature.appId = config.AppId;
                res.send({
                    data: signature
                });
            } else {
                Proxy.WeChat.getAppAccessToken(function(data, status, header) {
                    if (status === 200) {
                        var apptoken = JSON.parse(data);
                        if (apptoken.access_token) {
                            Proxy.Redis.redisClient.set("wechat_apptoken", apptoken.access_token);
                            Proxy.Redis.redisClient.expire("wechat_apptoken", 7200);
                            Proxy.WeChat.getApiTicket(apptoken.access_token, function(data, status, header) {
                                if (status === 200) {
                                    var apiticket = JSON.parse(data);
                                    if (apiticket.errcode === 0) {
                                        Proxy.Redis.redisClient.set("wechat_ticket", apiticket.ticket);
                                        Proxy.Redis.redisClient.expire("wechat_ticket", 7200);
                                        var signature = Proxy.Sign(apiticket.ticket, req.body.location);
                                        signature.appId = config.AppId;
                                        res.send({
                                            data: signature
                                        });
                                    } else {
                                        res.send({
                                            err: '获取ticket出错'
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
                                err: '请求失败,请重试'
                            });
                        }
                    } else {
                        res.send({
                            err: '请求微信服务器出错'
                        });
                    }
                });
            }
        } else {
            Proxy.Log.logger.info("[redis 服务器消息] 获取 api-ticket 出错，错误信息 " + err);
        }
    });
};