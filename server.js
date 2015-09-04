var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
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

    res.sendfile('./app/views/index.html', {
        code: req.query.code
    });
});





//获取指定用户信息
app.get('/getUserInfo', function(req, res) {
    User.findOne({
        _id: req.query.userId
    }).exec(function(err, user) {
        res.send({
            user: user
        });
    });
});

//获取所有未领取愿望
app.get('/getUnpickedWish', function(req, res) {
    Wish.find({
        "ispicked": 0
    }).sort({
        "_id": -1
    }).exec(function(err, wishes) {
        res.send({
            wishes: wishes
        });
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
        res.end();
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
        res.end();
    });
});

//获取指定愿望
app.get('/getwish', function(req, res) {
    Wish.findOne({
        "_id": req.query.wishId
    }).exec(function(err, wish) {
        res.send({
            wish: wish
        });
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
        res.end();
    });
});

//女生获取自己的愿望
app.get('/getfemalewish', function(req, res) {
    Wish.find({
        user: req.query.userId
    }).exec(function(err, wishes) {
        res.send({
            wishes: wishes
        });
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
        res.end();
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
        res.end();
    });
});

//删除愿望
app.post('/deletewish', function(req, res) {
    Wish.remove({
        _id: req.body.wishId
    }, function(err, docs) {
        res.end();
    });
});


//男生获取自己的愿望
app.get('/getmalewish', function(req, res) {
    Wish.find({
        wishpicker: req.query.pickerId
    }).exec(function(err, wishes) {
        res.send({
            wishes: wishes
        });
    });
});

//用户获取消息记录
app.get('/getmessage', function(req, res) {
    Msg.find({
        receiver: req.query.userId
    }).sort({
        _id: -1
    }).exec(function(err, msg) {
        res.send({
            msgs: msg
        });
    });
});

//阅读消息处理
app.get('/readmessage', function(req, res) {
    Msg.update({
        receiver: req.query.userId
    }, {
        $set: {
            hadread: 1
        }
    }, {
        multi: true
    }, function(err, docs) {
        res.end();
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
            res.send({
                contacts: contacts
            });
        });
});

app.get('/getAccessToken', function(req, res) {
    nodegrass.get('https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxc0328e0fe1f4cc8b&secret='+config.AppSecret+'&code=' + req.query.code + '&grant_type=authorization_code', function(data, status, headers) {
        var access_token = JSON.parse(data);
        nodegrass.get('https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token.access_token + '&openid=' + access_token.openid + '&lang=zh_CN', function(data, status, headers) {
            var user_data = JSON.parse(data);
            User.findOne({
                openid: user_data.openid
            }).exec(function(err, user) {
                if(user) {
                    res.send({data: user});
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
                        // res.send({data: user_data});
                        User.findOne({
                            openid: user_data.openid
                        }).exec(function(err, user) {
                            res.send({data: user});
                        });
                    });
                }
            });
            // res.send({
            //     data: user_data
            // });
        });
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
            socket.emit('Msg_res', msg);
            socket.broadcast.emit('Msg_res', msg);
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