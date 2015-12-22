var Wish = require('../models/wish.js');

/**
 * 获取所有未被领取的愿望
 * CallBack:
 * -err, 数据库异常
 * -wishes, 获取到的愿望列表
 * @param {Number} page 当前页数
 * @param {Number} perpage 每页显示的愿望数
 * @param {Function} callback 回调函数
 */
exports.getUnpickedWishes = function(page, perpage, area, type, callback) {
    area = area || ['大学城', '龙洞', '东风路', '番禺', '沙河'];
    type = type || ['实物类', '耗时类'];
    Wish.find({
        ispicked: 0,
        school_area: {
            "$in": area
        },
        wishType: {
            "$in": type
        }
    })
        .sort({
            _id: -1
        })
        .skip((page - 1) * perpage)
        .limit(perpage)
        .exec(callback);
};

exports.searchWish = function(content, callback) {
    Wish.find({
        ispicked: 0,
        "$or": [{
            username: new RegExp(content)
        }, {
            wish: new RegExp(content)
        }]
    }).exec(callback);
};

/**
 * 添加新愿望
 * CallBack:
 * -err, 数据库异常
 * @param {Object} wishdata 要添加的愿望
 * @param {Function} callback 回调函数
 */
exports.addNewWish = function(wishdata, callback) {
    var newWish = new Wish({
        user: wishdata.user,
        username: wishdata.username,
        userheadimg: wishdata.userheadimg,
        wishType: wishdata.wishType,
        wish: wishdata.wish,
        school_area: wishdata.school_area,
        media_id: wishdata.mediaId,
        img: wishdata.imgurl,
        useremail: wishdata.useremail
    });
    newWish.save(callback);
};

/**
 * 根据 id 获取愿望
 * CallBack:
 * -err, 数据库异常
 * -wish, 愿望信息
 * @param {String} wish_id 愿望id
 * @param {Function} callback 回调函数
 */
exports.getWishById = function(wish_id, callback) {
    Wish.findOne({
        _id: wish_id
    }, callback);
};

/**
 * 根据用户id获取愿望
 * CallBack:
 * -err, 数据库异常
 * -wishes, 该用户的所有愿望
 * @param {String} uid 用户id
 * @param {Function} callback 回调函数
 */
exports.getWishesByUserId = function(uid, callback) {
    Wish.find({
        user: uid
    }).sort({
        _id: -1
    }).exec(callback);
};

/**
 * 更新愿望的状态
 * CallBack:
 * -err, 数据库异常
 * -docs, 匹配的个数
 * @param {Object} wishdata 愿望需要更新的数据
 * @param {Function} callback 回调函数
 */
exports.updateWishState = function(wishId, wishdata, callback) {
    Wish.update({
        _id: wishdata.wishId
    }, {
        $set: {
            ispicked: wishdata.type,
            wishpicker: wishdata.wishPicker,
            wishpickername: wishdata.wishPickerName
        }
    }, callback);
};

/**
 * 根据愿望id修改愿望
 * CallBack:
 * -err, 数据库异常
 * -docs, 匹配的个数
 * @param {Object} wishdata 愿望数据
 * @param {Function} callback 回调函数
 */
exports.refreshWishById = function(wishId, wishdata, callback) {
    Wish.update({
        _id: wishdata.wishId
    }, {
        $set: {
            wishType: wishdata.wishType,
            wish: wishdata.wish,
            img: wishdata.imgurl
        }
    }, callback);
};

/**
 * 根据愿望id删除愿望
 * CallBack:
 * -err, 数据库异常
 * @param {String} wish_id 愿望id
 * @param {Function} callback 回调函数
 */
exports.deleteWishById = function(wish_id, callback) {
    Wish.remove({
        _id: wish_id
    }, callback);
};

/**
 * 根据picker_id获取愿望
 * CallBack:
 * -err, 数据库异常
 * -wishes, 该用户的所有愿望
 * @param {String} picker_id 愿望领取人的id
 * @param {Function} callback 回调函数
 */
exports.getWishByPickerId = function(picker_id, callback) {
    Wish.find({
        wishpicker: picker_id
    })
        .sort({
            _id: 1
        })
        .exec(callback);
};