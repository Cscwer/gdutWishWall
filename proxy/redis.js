var config = require('../config');
var redis = require('redis');

var redisOpts = {
    "no_ready_check": true
};
var redisClient = redis.createClient(config.Redis_port, config.Redis_host, redisOpts);
var subClient = redis.createClient(config.Redis_port, config.Redis_host, redisOpts);
var pubClient = redis.createClient(config.Redis_port, config.Redis_host, redisOpts);
redisClient.on("error", function(err) {
    console.log('redis出错');
    console.log(err);
});
subClient.on("error", function(err) {
    console.log('redis出错');
    console.log(err);
});
pubClient.on("error", function(err) {
    console.log('redis出错');
    console.log(err);
});

redisClient.auth(config.Redis_user + '-' + config.Redis_pwd + '-' + config.Redis_name);
pubClient.auth(config.Redis_user + '-' + config.Redis_pwd + '-' + config.Redis_name);
subClient.auth(config.Redis_user + '-' + config.Redis_pwd + '-' + config.Redis_name);

exports.redisClient = redisClient;
exports.pubClient = pubClient;
exports.subClient = subClient;
