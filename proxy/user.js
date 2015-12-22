var User = require('../models/user.js');


/**
 * 根据用户id查找用户信息
 * Callback:
 * - err, 数据库异常
 * - user, 用户信息
 * @param {String} uid 用户id
 * @param {Function} callback 回调函数
 */
exports.getUserById = function(uid, callback) {
    User.findOne({
        _id: uid
    }, callback);
};

/**
 * 更新用户信息
 * CallBack:
 * -err, 数据库异常
 * -num, 更新的数据个数
 * @param {Object} reqbody 请求体
 * @param {Function} callback 回调函数
 */
exports.updateUserInfo = function(userId, reqbody, callback) {
    User.update({
        _id: userId
    }, {
        $set: {
            real_name: reqbody.real_name,
            school_area: reqbody.school_area,
            college_name: reqbody.college_name,
            long_tel: reqbody.long_tel,
            short_tel: reqbody.short_tel,
            email: reqbody.email
        }
    }, callback);
};

/**
 * 根据 openid 获取用户
 * CallBack:
 * -err, 数据库异常
 * -user, 用户信息
 * @param {String} openid 用户的 openid
 * @param {Function} callback 回调函数
 */
exports.getUserByOpenId = function(openid, callback) {
    User.findOne({
        openid: openid
    }, callback);
};

/**
 * 添加新用户
 * CallBack:
 * -err, 数据库异常
 * @param {Object} userdata 用户对象
 * @param {Function} callback 回调函数
 */
exports.addNewUser = function(userdata, callback) {
    var newUser = new User({
        openid: userdata.openid,
        nickname: userdata.nickname,
        sex: userdata.sex,
        province: userdata.province,
        city: userdata.city,
        country: userdata.country,
        headimgurl: userdata.headimgurl
    });
    newUser.save(callback);
};

exports.updateWeChatUserInfo = function(userdata, callback) {
    User.findOne({
        openid: userdata.openid
    }, callback);
};

exports.loverSet = function(uid, hisname, callback) {
    User.update({
        _id: uid
    }, {
        $set: {
            mystery_lover: hisname
        }
    }, callback);
};

exports.loverMatch = function(macth_data, callback) {
    User.find({
        real_name: macth_data.hisname
    }, callback);
};