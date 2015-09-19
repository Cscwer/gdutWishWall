var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var crypto = require('crypto');
// var flash = require('express-flash');
// var bcrypt = require('bcrypt');

var routes = require('./routes');

var app = express();

var server = http.createServer(app);

var io = require('socket.io').listen(server);

var nodegrass = require('nodegrass');

var config = require('./config.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', 18080);

//引用数据模板
var User = require('./models/user.js');
var Wish = require('./models/wish.js');
var Msg = require('./models/message.js');
var Token = require('./models/token.js');
var Bless = require('./models/bless.js');


app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

//使用 session
app.use(express.session({
    secret: 'gdutwishwall',
    cookie: {
        maxAge: 6000000
    }
}));
//初始化 passport
// app.use(flash());

app.use(express.static(path.join(__dirname, 'app')));
app.use(app.router);

//默认访问 index.html
app.get('/', function(req, res) {
    res.writeHead(301, {
        'Location': 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxc0328e0fe1f4cc8b&redirect_uri=http%3A%2F%2Fgdutgirl.duapp.com%2Findex&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect'
    });
    res.end();
});

app.get('/index', function(req, res) {

    res.sendfile('./app/views/index.html');
});





//获取指定用户信息
app.get('/getUserInfo', function(req, res) {
    req.query.userId = req.query.userId || null;
    User.findOne({
        _id: req.query.userId
    }).exec(function(err, user) {
        if (!err) {
            res.send({
                user: user
            });
        } else {
            console.log(err);
        }
    });
});

//获取所有未领取愿望
app.get('/getUnpickedWish', function(req, res) {
    Wish.find({
        "ispicked": 0
    })
        .sort({
            "_id": -1
        })
        .skip((req.query.page - 1) * req.query.per_page)
        .limit(req.query.per_page)
        .exec(function(err, wishes) {
            if (!err) {
                res.send({
                    wishes: wishes
                });
            } else {
                console.log(err);
            }
        });
});

//处理许愿请求
app.post('/putwish', function(req, res) {
    var newWish = new Wish({
        user: req.body.user,
        username: req.body.username,
        wishType: req.body.wishType,
        wish: req.body.wish,
        school_area: req.body.school_area
    });
    newWish.save(function(err) {
        if (!err) {
            res.end();
        } else {
            console.log(err);
        }
    });
});

//更新用户信息
app.post('/updateinfo', function(req, res) {
    User.update({
        _id: req.body.user
    }, {
        $set: {
            real_name: req.body.real_name,
            school_area: req.body.school_area,
            college_name: req.body.college_name,
            long_tel: req.body.long_tel,
            short_tel: req.body.short_tel
        }
    }, function(err, num) {
        if (!err) {
            res.end();
        } else {
            console.log(err);
        }
    });
});

//获取指定愿望
app.get('/getwish', function(req, res) {
    req.query.wishId = req.query.wishId || null;
    Wish.findOne({
        "_id": req.query.wishId
    }).exec(function(err, wish) {
        if (!err) {
            res.send({
                wish: wish
            });
        } else {
            console.log(err);
        }
    });
});

//男生领取愿望
app.post('/pickwish', function(req, res) {
    Wish.update({
        _id: req.body.wish._id
    }, {
        $set: {
            ispicked: 1,
            wishpicker: req.body.wishPicker,
            wishpickername: req.body.wishPickerName
        }
    }, function(err, docs) {
        if (!err) {
            res.end();
        } else {
            console.log(err);
        }
    });
});

//女生获取自己的愿望
app.get('/getfemalewish', function(req, res) {
    req.query.userId = req.query.userId || null;
    Wish.find({
        user: req.query.userId
    }).exec(function(err, wishes) {
        if (!err) {
            res.send({
                wishes: wishes
            });
        } else {
            console.log(err);
        }
    });
});

//更新愿望状态
app.post('/updatewishstate', function(req, res) {
    Wish.update({
        _id: req.body.wishId
    }, {
        $set: {
            ispicked: req.body.type,
            wishpicker: req.body.wishPicker,
            wishpickername: req.body.wishPickerName
        }
    }, function(err, docs) {
        if (!err) {
            res.end();
        } else {
            console.log(err);
        }
    });
});

//修改愿望
app.post('/refreshwish', function(req, res) {
    Wish.update({
        _id: req.body.wishId
    }, {
        $set: {
            wishType: req.body.wishType,
            wish: req.body.wish
        }
    }, function(err, docs) {
        if (!err) {
            res.end();
        } else {
            console.log(err);
        }
    });
});

//删除愿望
app.post('/deletewish', function(req, res) {
    Wish.remove({
        _id: req.body.wishId
    }, function(err, docs) {
        if (!err) {
            res.end();
        } else {
            console.log(err);
        }
    });
});


//男生获取自己的愿望
app.get('/getmalewish', function(req, res) {
    req.query.pickerId = req.query.pickerId || null;
    Wish.find({
        wishpicker: req.query.pickerId
    }).exec(function(err, wishes) {
        if (!err) {
            res.send({
                wishes: wishes
            });
        } else {
            console.log(err);
        }
    });
});

//用户获取消息记录
app.get('/getmessage', function(req, res) {
    req.query.userId = req.query.userId || null;
    Msg.find({
        receiver: req.query.userId
    }).sort({
        _id: -1
    }).exec(function(err, msg) {
        if (!err) {
            res.send({
                msgs: msg
            });
        } else {
            console.log(err);
        }
    });
});

//阅读消息处理
app.get('/readmessage', function(req, res) {
    req.query.userId = req.query.userId || null;
    Msg.update({
        receiver: req.query.userId
    }, {
        $set: {
            hadread: 1
        }
    }, {
        multi: true
    }, function(err, docs) {
        if (!err) {
            res.end();
        } else {
            console.log(err);
        }
    });
});

//获取聊天记录
app.post('/getcontact', function(req, res) {
    Msg.find({
        msg_type: 'User'
    })
        .where('receiver').in([req.body.this, req.body.that])
        .where('sender').in([req.body.this, req.body.that])
        .exec(function(err, contacts) {
            if (!err) {
                res.send({
                    contacts: contacts
                });
            } else {
                console.log(err);
            }
        });
});

//处理祝福
app.post('/putbless', function(req, res) {
    var newBless = new Bless({
        user: req.body.user,
        username: req.body.username,
        bless: req.body.bless,
        school_area: req.body.school_area
    });
    newBless.save(function(err) {
        if (!err) {
            res.end();
        } else {
            console.log(err);
        }
    });
});

//获取所有祝福
app.get('/getAllBless', function(req, res) {
    Bless.find({}).exec(function(err, blesses) {
        if(!err) {
            res.send({
                blesses: blesses
            });
        } else {
            console.log(err);
        }
    });
});

//获取指定用户的祝福


//处理点赞行为
app.post('/makePraise', function(req, res) {
    req.body.blessId = req.body.blessId || null;
    Bless.findOne({
        _id: req.body.blessId
    }).exec(function(err, bless) {
        if(!err) {
            bless.praiser.push(req.body.userId);
            bless.praiser_num++;
            Bless.update({
                _id: blessId
            },bless);
        } else {
            console.log(err);
        }
    });
});

app.get('/getWeChatInfo', function(req, res) {
    req.query.code = req.query.code || null;
    if (req.query.code) {
        nodegrass.get('https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.AppId + '&secret=' + config.AppSecret + '&code=' + req.query.code + '&grant_type=authorization_code', function(data, status, headers) {
            if (status === 200) {
                var access_token = JSON.parse(data);
                if (!access_token.errcode) {
                    nodegrass.get('https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token.access_token + '&openid=' + access_token.openid + '&lang=zh_CN', function(data, status, headers) {
                        var user_data = JSON.parse(data);
                        user_data.openid = user_data.openid || null;
                        User.findOne({
                            openid: user_data.openid
                        }).exec(function(err, user) {
                            if (!err) {
                                if (user) {
                                    res.send({
                                        data: user
                                    });
                                } else {
                                    var newUser = new User({
                                        openid: user_data.openid,
                                        nickname: user_data.nickname,
                                        sex: user_data.sex,
                                        province: user_data.province,
                                        city: user_data.city,
                                        country: user_data.country,
                                        headimgurl: user_data.headimgurl,
                                    });
                                    newUser.save(function(err) {
                                        if (!err) {
                                            User.findOne({
                                                openid: user_data.openid
                                            }).exec(function(err, user) {
                                                if (!err) {
                                                    res.send({
                                                        data: user
                                                    });
                                                } else {
                                                    console.log(err);
                                                }
                                            });
                                        } else {
                                            console.log(err);
                                        }
                                    });
                                }
                            } else {
                                console.log(err);
                            }
                        });
                    });
                } else {
                    res.send({
                        errmsg: 'token 错误'
                    });
                }
            }
        });
    } else {
        res.send({
            errmsg: 'code 错误'
        });
    }
});

app.get('/getAccessToken', function(req, res) {
    req.query.uid = req.query.uid || null;
    User.findOne({
        _id: req.query.uid
    }, function(err, user) {
        if (!err) {
            if (user) {
                Token.findOne({})
                    .exec(function(err, token) {
                        if (!err) {
                            if (token !== undefined && token !== null) {
                                var date = token.timestamp_token;
                                var timestamp_token = Date.parse(date);
                                var timestamp_now = Date.parse(new Date());
                                var time_skip = timestamp_now - timestamp_token;
                                if (time_skip < 7200000) {
                                    res.send({
                                        token: token,
                                        time_skip: time_skip
                                    });
                                } else {
                                    nodegrass.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + config.AppId + '&secret=' + config.AppSecret, function(data, status, headers) {
                                        if (status === 200) {
                                            var access_token = JSON.parse(data);
                                            if (!access_token.errcode) {
                                                Token.update({}, {
                                                        $set: {
                                                            token: access_token.access_token,
                                                            timestamp_token: timestamp_now
                                                        }
                                                    },
                                                    function(err, docs) {
                                                        if (!err) {
                                                            Token.findOne({})
                                                                .exec(function(err, token) {
                                                                    if (!err) {
                                                                        res.send({
                                                                            token: token
                                                                        });
                                                                    } else {
                                                                        console.log(err);
                                                                    }
                                                                })
                                                        } else {
                                                            console.log(err);
                                                        }
                                                    });
                                            } else {
                                                res.send({
                                                    errmsg: access_token.errmsg
                                                });
                                            }
                                        }
                                    });

                                }

                            } else {
                                nodegrass.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + config.AppId + '&secret=' + config.AppSecret, function(data, status, headers) {
                                    if (status === 200) {
                                        var access_token = JSON.parse(data);
                                        if (!access_token.errcode) {
                                            var newToken = new Token({
                                                token: access_token.access_token
                                            });
                                            newToken.save(function(err) {
                                                if (!err) {
                                                    Token.findOne({})
                                                        .exec(function(err, token) {
                                                            if (!err) {
                                                                res.send({
                                                                    token: token,

                                                                });
                                                            } else {
                                                                console.log(err);
                                                            }
                                                        });
                                                } else {
                                                    console.log(err);
                                                }
                                            });

                                        } else {
                                            res.send({
                                                errmsg: access_token.errmsg
                                            });
                                        }
                                    }
                                });
                            }
                        } else {
                            console.log(err);
                        }
                    });
            } else {
                res.send({
                    errmsg: '请登录后再试'
                });
            }
        } else {
            console.log(err);
        }
    });

});

//生成 Signature 的函数
var createSignature = function(token) {
    var timestamp = Date.parse(token.timestamp_ticket);
    var string = 'jsapi_ticket=' + token.ticket + '&noncestr=' + config.noncestr + '&timestamp=' + timestamp + '&url=' + config.ticket_url;
    var md5sum = crypto.createHash('sha1');
    md5sum.update(string, 'utf8');
    string = md5sum.digest('hex');
    return string;

};

app.get('/getApiTicket', function(req, res) {
    req.query.token = req.query.token || null;
    Token.findOne({
        token: req.query.token
    }).exec(function(err, token) {
        if (!err) {
            if (token) {
                var date = token.timestamp_ticket;
                var timestamp_ticket = Date.parse(date);
                var timestamp_now = Date.parse(new Date());
                var time_skip = timestamp_now - timestamp_ticket;
                if (time_skip < 7200000) {
                    var signature = createSignature(token);
                    res.send({
                        signature: signature,
                        timestamp_ticket: Date.parse(token.timestamp_ticket),
                        noncestr: config.noncestr,
                        appId: config.AppId
                    });
                } else {
                    nodegrass.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token.token + '&type=jsapi', function(data, status, headers) {
                        if (status === 200) {
                            var ticket_data = JSON.parse(data);
                            if (ticket_data.errcode === 0) {
                                Token.update({}, {
                                        $set: {
                                            ticket: ticket_data.ticket,
                                            timestamp_ticket: timestamp_now
                                        }
                                    },
                                    function(err, docs) {
                                        if (!err) {
                                            Token.findOne({})
                                                .exec(function(err, token) {
                                                    if (!err) {
                                                        var signature = createSignature(token);
                                                        res.send({
                                                            signature: signature
                                                        });
                                                    } else {
                                                        console.log(err);
                                                    }
                                                });
                                        } else {
                                            console.log(err);
                                        }
                                    });
                            }
                        }
                    });
                }
            } else {
                res.send({
                    errmsg: '洗洗睡吧'
                });
            }
        } else {
            console.log(err);
        }
    });

});

//设置 socket 日志级别
// io.set('log level', 1);

//WebSocket 连接监听
io.on('connection', function(socket) {

    //通知客户端已经连接
    socket.emit('open');

    //接收从客户端发过来的消息
    socket.on('Msg', function(msg) {
        console.log(msg);
        var newMsg = new Msg({
            msg_type: msg.msg_type,
            sender: msg.sender,
            sender_name: msg.sender_name,
            receiver: msg.receiver,
            receiver_name: msg.receiver_name,
            msg: msg.msg
        });
        newMsg.save(function(err) {
            if (!err) {
                socket.emit('Msg_res', msg);
                socket.broadcast.emit('Msg_res', msg);
            } else {
                console.log(err);
            }
        });

    });
    socket.on('message', function(msg) {
        console.log(msg);
        socket.emit('msg', msg);
        socket.broadcast.emit('msg', msg);
    });
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});

server.listen(18080, function() {
    console.log('The server is ready in http://localhost:18080');
});
module.exports = app;