var Bless = require('../models/bless.js');

/**
 * 获取所有未被领取的祝福
 * CallBack:
 * -err, 数据库异常
 * -blesses, 获取到的祝福列表
 * @param {Number} page 当前页数
 * @param {Number} perpage 每页显示的祝福数
 * @param {Function} callback 回调函数
 */
exports.getAllBlesses = function(page, perpage, area, sort, callback) {
    area = area || ['大学城', '龙洞', '东风路', '番禺', '沙河'];
    sort = sort || null;

    if (sort) {
        Bless.find({
            school_area: {
                "$in": area
            }
        })
            .sort({
                praise_num: sort
            })
            .skip((page - 1) * perpage)
            .limit(perpage)
            .exec(callback);
    } else {
        Bless.find({
            school_area: {
                "$in": area
            }
        })
            .sort({
                _id: -1
            })
            .skip((page - 1) * perpage)
            .limit(perpage)
            .exec(callback);
    }
};

/**
 * 添加新祝福
 * CallBack:
 * -err, 数据库异常
 * @param {Object} wishdata 要添加的祝福
 * @param {Function} callback 回调函数
 */
exports.addNewBless = function(blessdata, callback) {
    var newBless = new Bless({
        user: blessdata.user,
        username: blessdata.username,
        userheadimg: blessdata.userheadimg,
        bless: blessdata.bless,
        school_area: blessdata.school_area,
        media_id: blessdata.mediaId,
        img: blessdata.imgurl
    });
    newBless.save(callback);
};

/**
 * 根据 id 获取祝福
 * CallBack:
 * -err, 数据库异常
 * -bless, 祝福信息
 * @param {String} bless_id 祝福id
 * @param {Function} callback 回调函数
 */
exports.getBlessById = function(bless_id, callback) {
    Bless.findOne({
        _id: bless_id
    }, callback);
};

/**
 * 根据用户id获取祝福
 * CallBack:
 * -err, 数据库异常
 * -blesses, 该用户的所有祝福
 * @param {String} uid 用户id
 * @param {Function} callback 回调函数
 */
exports.getBlessesByUserId = function(uid, callback) {
    Bless.find({
        user: uid
    }).sort({
        _id: -1
    }).exec(callback);
};

/**
 * 根据祝福id删除祝福
 * CallBack:
 * -err, 数据库异常
 * @param {String} bless_id 祝福id
 * @param {Function} callback 回调函数
 */
exports.deleteBlessById = function(bless_id, callback) {
    Bless.remove({
        _id: bless_id
    }, callback);
};

/**
 * 根据祝福id给祝福添加一个祝福者，并使点赞数加一
 * CallBack:
 * -err, 数据库异常
 * @param {String} bless_id 祝福id
 * @param {String} uid 点赞用户id
 * @param {Function} callback 回调函数
 */
exports.makePraise = function(blessdata, callback) {
    blessdata.blessId = blessdata.blessId || null;
    Bless.findOne({
        _id: blessdata.blessId
    }).exec(function(err, bless) {
        if (!err) {
            bless.praiser.push(blessdata.userId);
            bless.praise_num++;
            // bless.update({
            //     _id: .blessId
            // }, bless);
            bless.save(callback);
        } else {
            console.log(err);
        }
    });
};