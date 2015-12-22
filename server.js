/**
 * 工大女生节许愿墙后台代码
 */

//引入第三方依赖
var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var log4js = require('log4js');

//引入自定义文件依赖
var routes = require('./routes');
var mid_auth = require('./middlewares/auth');
var Proxy = require('./proxy/index');
var config = require('./config.js');

//服务器初始化
var app = express();
var server = http.createServer(app);

//websocket 服务器初始化
var io = require('socket.io').listen(18081);

//redis 服务器订阅事件
var channel = config.Redis_user;
Proxy.Redis.subClient.on("message", function(channel, message) {
    Proxy.Log.logger.info("[redis] " + channel + " Got message " + message);
    io.sockets.emit(message);
});
Proxy.Redis.subClient.subscribe(channel);

//允许我的调试服务器发送请求


//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'app/')));
app.set('view engine', 'ejs');
app.set('port', 18080);


app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

//使用 session
app.use(express.session({
    secret: 'gdutwishwall',
    cookie: {
        maxAge: 1000 * 7200
    }
}));

app.use(app.router);


//后台接口



//默认访问 index.html
app.get('/', mid_auth.openidRequired, routes.goIndex);

app.get('/userauth', mid_auth.isNewUser, routes.goIndex);

app.get('/goIndex', function(req, res) {
    res.sendfile('app/app.html');
});

//获取指定用户信息
app.get('/api/users/:userId', routes.getUserInfo);

//用户根据openid获取信息
app.get('/api/user/info', routes.getMyInfo);

//暗恋匹配
app.put('/api/user/mystery', routes.loverMatch);
//暗恋修改
app.put('/api/user/mystery/refresh', mid_auth.rewriteLover, routes.loverMatch);

//获取所有未领取愿望
app.get('/api/wishes', routes.getUnpickedWish);

//更新用户信息
app.put('/api/users/:userId', routes.updateInfo);

//许愿动作
app.post('/api/wishes', mid_auth.hasPic, routes.putWish);

//获取指定愿望
app.get('/api/wishes/:wishId', routes.getWish);
app.get('/api/search/wishes', routes.searchWish);

//获取某个人的愿望
app.get('/api/wishes/user/:userId', routes.getOnesWish);

//更新愿望状态
app.put('/api/wishes/state/:wishId', mid_auth.hasEmail, routes.updateWishState);

//修改愿望
app.put('/api/wishes/:wishId', mid_auth.hasPic, routes.refreshWish);

//删除愿望
app.delete('/api/wishes/:wishId', routes.deleteWish);

//用户获取消息记录
app.get('/api/msgs/:msgType/:userId', routes.getMessage);

//阅读消息处理
app.put('/api/msgs/:userId/:msgType', routes.readMessage);

//获取聊天记录
app.get('/api/contacts', routes.getContact);

//获取未读消息数量
app.get('/api/unread', routes.getUnreadMsgNum);

app.put('/api/unread/clear', routes.clearUserMsg);

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

//通过搜索框获取祝福搜索结果
app.get('/api/search/blesses', routes.searchBless);

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
        Proxy.Redis.pubClient.publish(channel, msg);
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
                socket.broadcast.emit('WishMsg_res', msg);
                Proxy.Msg.addNewMsg(msg_res, function(err) {
                    if(err) {
                        Proxy.Log.logger.info("[websocket 消息] 新增消息失败，错误信息"+err);
                    }
                });
            } else {
                Proxy.Log.logger.info("[websocket 消息] 新增消息失败，错误信息"+err);
            }
        });
    });

    socket.on('Praise', function(msg) {
        Proxy.Msg.addNewMsg(msg, function(err) {
            if (!err) {
                socket.broadcast.emit('Praise_res', msg);
            }
        });
    });

    socket.on('UserMsg', function(msg) {
        Proxy.Log.logger.info(msg.sender_name + "发送给" + msg.receiver_name + "的消息：" + msg.msg);
        Proxy.Redis.pubClient.publish(channel, msg);
        Proxy.Msg.addNewMsg(msg, function(err) {
            if (!err) {
                socket.emit('UserMsg_res', msg);
                socket.broadcast.emit('UserMsg_res', msg);
                socket.broadcast.emit('NewUserMsg', msg.receiver);
            } else {
                Proxy.Log.logger.info("[websocket 消息] 添加新消息失败"+err);
            }
        });

    });
    socket.on('FemaleMsg', function(msg) {
        Proxy.Redis.pubClient.publish(channel, msg);
        console.log('FemaleMsg:');
        console.log(msg);
        Proxy.Msg.addNewMsg(msg, function(err) {
            if (!err) {
                Proxy.Email.completeWishMail(msg.receiver_email, msg.sender_name, function(error, info) {
                    if (!error) {
                        Proxy.Log.logger.info("[邮件服务器消息] 发送邮件成功，收件人"+msg.receiver_email);
                    } else {
                        Proxy.Log.logger.info("[邮件服务器消息] 发送邮件失败，收件人"+msg.receiver_email+"，错误信息"+error);
                    }
                });
            }
            socket.broadcast.emit('FemaleMsg_res', msg);
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