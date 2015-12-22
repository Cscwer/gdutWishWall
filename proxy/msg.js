var Msg = require('../models/message.js');

/**
 * 获取 receiver 为 uid 的消息
 * CallBack:
 * -err, 数据库异常
 * -msg, 获取到的消息
 * @param {String} uid 用户id
 * @param {Function} callback 回调函数
 */
exports.getMsgByUserId = function(uid, type, callback) {
    Msg.find({
        receiver: uid,
        msg_type: type
    })
        .sort({
            _id: -1
        })
        .exec(callback);
};

/**
 * 根据用户id做消息已阅读处理
 * CallBack:
 * -err, 数据库异常
 * -docs, 更新的条数
 * @param {String} uid 用户id
 * @param {Function} callback 回调函数
 */
exports.hadReadNotice = function(uid, callback) {
    Msg.update({
        receiver: uid,
        msg_type: 'Notice'
    }, {
        $set: {
            hadread: 1
        }
    }, {
        multi: true
    }, callback);
};

exports.hadReadPraise = function(uid, callback) {
    Msg.update({
        receiver: uid,
        msg_type: 'Praise'
    }, {
        $set: {
            hadread: 1
        }
    }, {
        multi: true
    }, callback);
};

exports.hadReadUserMsg = function(thisuser, that, callback) {
    Msg.update({
        receiver: thisuser,
        sender: that,
        hadread: 0,
        msg_type: 'User'
    }, {
        $set: {
            hadread: 1
        }
    }, {
        multi: true
    }, callback);
};

/**
 * 获取聊天记录
 * CallBack:
 * -err, 数据库异常
 * -contacts, 获取到的聊天记录
 * @param {String} this_user 当前用户id
 * @param {String} that_user 对方用户id
 * @param {Function} callback 回调函数
 */
exports.getContactHistory = function(this_user, that_user, callback) {
    Msg.find({
        msg_type: 'User'
    })
        .where('receiver').in([this_user, that_user])
        .where('sender').in([this_user, that_user])
        .sort({_id: 1})
        .exec(callback);
};

exports.addNewMsg = function(msg, callback) {
    var newMsg = new Msg({
        msg_type: msg.msg_type,
        sender: msg.sender,
        sender_name: msg.sender_name,
        sender_headimg: msg.sender_headimg,
        receiver: msg.receiver,
        receiver_email: msg.receiver_email,
        receiver_name: msg.receiver_name,
        msg: msg.msg
    });
    newMsg.save(callback);
};

exports.getUnreadMsgNum = function(uid, callback) {
    Msg.find({
        receiver: uid,
        hadread: 0
    })
        .exec(callback);
};

