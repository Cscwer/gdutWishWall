var mongoose = require('mongoose');
// var isDev = true;
var isDev = false;
var db = exports.Db = mongoose.createConnection();
var options = {
    db: {
        native_parser: true
    },
    server: {
        poolSize: 5
    },
    user: '87b918b63554437c8da82874f7fd958b',
    pass: 'd15e4fcb62ba45dba9395418ee12a472'
    // user: '',
    // pass: ''
};

var host = isDev ? '127.0.0.1' : 'mongo.duapp.com';
var port = isDev ? '27017' : '8908';
var database = isDev ? 'wishwall_dev' : 'AygDVLRcJWRDSHyBCUvv';
var user = isDev ? '' : '87b918b63554437c8da82874f7fd958b';
var pass = isDev ? '' : 'd15e4fcb62ba45dba9395418ee12a472';
db.open(host, database, port, options);
db.on('error', function(err) {
    // logger.error("connect error :" + err);
    console.log(err);
    //监听BAE mongodb异常后关闭闲置连接
    db.close();
});
//监听db close event并重新连接
db.on('close', function() {
    // logger.info("connect close retry connect ");
    db.open(host, database, port, options);
});

exports.mongoose = mongoose;