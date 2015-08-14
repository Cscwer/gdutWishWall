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

//引用 passport
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', 18080);

//引用数据模板
var User = require('./models/user.js');
var Wish = require('./models/wish.js');

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
app.use(passport.initialize());
app.use(passport.session());
// app.use(flash());

app.use(express.static(path.join(__dirname, 'app')));
app.use(app.router);

//默认访问 index.html
app.get('/', function(req, res) {
    res.sendfile('./app/views/index.html');
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use('local', new LocalStrategy(
    function(username, password, done) {
        User.findOne({
            username: username
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
            // if (user.password !== password) {
            //     return done(null, false, { message: 'Incorrect password.' });
            // }
            return done(null, user);

        });
    }
));

//处理登录请求
app.post('/login', passport.authenticate('local'), function(req, res) {
    res.send({
        user: req.user
    });
});

//处理注销登录的请求
app.post('/logout', function(req, res) {
    req.logout();
    res.end();
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
    console.log(req.body.wish);
    var newWish = new Wish({
        user: req.body.wish.user,
        username: req.body.wish.username,
        wishType: req.body.wish.wishType,
        wish: req.body.wish.wish,
        school_area: req.body.info.school_area
    });
    newWish.save(function(err) {
        User.update({_id: req.body.wish.user},{
            real_name: req.body.info.real_name, 
            school_area: req.body.info.school_area,
            college_name: req.body.info.college_name,
            long_tel: req.body.info.long_tel,
            short_tel: req.body.info.short_tel
        },{safe: false},function(err, num) {
            res.end();
        })
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

//设置 socket 日志级别
io.set('log level', 1); 

//WebSocket 连接监听
io.on('connection', function(socket) {
    socket.emit('open'); //通知客户端已经连接

    //打印握手信息
    console.log(socket.handshake);

    //构造客户端对象
    var client = {
        
    };

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
