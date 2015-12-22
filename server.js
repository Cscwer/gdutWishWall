var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var crypto = require('crypto');

var routes = require('./routes');

var app = express();

var server = http.createServer(app);

var io = require('socket.io').listen(18081);

var mid_auth = require('./middlewares/auth');

var Proxy = require('./proxy/index');

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'app/')));
app.set('view engine', 'ejs');
app.set('port', 18080);

// //引用数据
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
        maxAge: 1000 * 3600 * 24 * 7
    }
}));

app.use(app.router);

//设置跨域访问  
// app.all('*', function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//     res.header("X-Powered-By", ' 3.2.1')
//     res.header("Content-Type", "application/json;charset=utf-8");
//     next();
// });

//默认访问 index.html
app.get('/', mid_auth.openidRequired, routes.goIndex);

app.get('/userauth', mid_auth.isNewUser, routes.goIndex);
app.get('/newuser', mid_auth.addNewUser, routes.goIndex);

app.get('/goIndex', function(req, res) {
    res.sendfile('app/app.html');
});
app.get('/getsession', function(req, res) {
    res.send({
        sess: req.session
    });
});

//获取指定用户信息
app.get('/api/users/:userId', routes.getUserInfo);
app.get('/api/user/info', routes.getMyInfo);

//暗恋匹配
app.post('/api/user/mystery', routes.loverMatch);

//获取所有未领取愿望
app.get('/api/wishes', routes.getUnpickedWish);
app.get('/api/wishes/search', routes.searchWish);

//更新用户信息
app.put('/api/users/:userId', routes.updateInfo);

//许愿动作
app.post('/api/wishes', mid_auth.hasPic, routes.putWish);

//获取指定愿望
app.get('/api/wishes/:wishId', routes.getWish);

//获取某个人的愿望
app.get('/api/wishes/user/:userId', routes.getOnesWish);

//更新愿望状态
app.put('/api/wishes/state/:wishId', mid_auth.hasEmail, routes.updateWishState);

//修改愿望
app.put('/api/wishes/:wishId', mid_auth.hasPic, routes.refreshWish);

//删除愿望
app.delete('/api/wishes/:wishId', routes.deleteWish);

//用户获取消息记录
app.get('/api/msgs/:userId', routes.getMessage);

//阅读消息处理
app.put('/api/msgs/:userId/:msgType', routes.readMessage);

//获取聊天记录
app.get('/api/contacts', routes.getContact);

//获取未读消息数量
app.get('/getunreadmsgnum', routes.getUnreadMsgNum);

//获取用户的微信信息
// app.get('/api/wechat/info', routes.getWeChatInfo);

//获取微信签名
app.post('/api/wechat/signature', routes.getSignature);

//获取所有祝福
app.get('/api/blesses', routes.getAllBless);

//处理祝福请求
app.post('/api/blesses', mid_auth.hasPic, routes.putBless);

//通过祝福id获取指定祝福
app.get('/api/blesses/:blessId', routes.getBless);

//获取指定用户的祝福
app.get('/api/blesses/user/:userId', routes.getUserBlesses);

//为祝福点赞
app.put('/api/blesses/:blessId', routes.makePraise);

//删除祝福
app.delete('/api/blesses/:blessId', routes.deleteBless);

//设置 socket 日志级别
// io.set('log level', 1);

//WebSocket 连接监听
io.sockets.on('connection', function(socket) {

    //通知客户端已经连接
    socket.emit('open');

    //接收从客户端发过来的消息
    socket.on('WishMsg', function(msg) {
        Proxy.Msg.addNewMsg(msg, function(err) {
            if (!err) {
                var msg_res = {
                    msg_type: 'Notice',
                    sender: 'System',
                    sender_name: 'System',
                    receiver: msg.sender,
                    receiver_name: msg.sender_name,
                    msg: '你领取了' + msg.receiver_name + '的愿望,请尽快实现.'
                };
                socket.emit('WishMsg_res', msg_res);
                socket.broadcast.emit('WishMsg_res', msg);
                Proxy.Msg.addNewMsg(msg_res, function(err) {
                    console.log('ok');
                });
            } else {
                console.log(err);
            }
        });
    });
    socket.on('UserMsg', function(msg) {
        Proxy.Msg.addNewMsg(msg, function(err) {
            if (!err) {
                socket.emit('UserMsg_res', msg);
                socket.broadcast.emit('UserMsg_res', msg);
                socket.broadcast.emit('NewUserMsg', msg.receiver);
            } else {
                console.log(err);
            }
        });

    });
    socket.on('FemaleMsg', function(msg) {
        Proxy.Msg.addNewMsg(msg, function(err) {
            if(!err) {
                socket.broadcast.emit('FemaleMsg_res', msg);
            }
        });
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
