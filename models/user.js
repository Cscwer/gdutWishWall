var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var UserSchema = new Schema({
    openid: String,
    nickname: String,
    sex: {
        type: Number,
        default: 1
    },
    province: String,
    city: String,
    country: String,
    headimgurl: String,
    wechatheadimgurl: String,
    real_name: String,
    school_area: String,
    college_name: String,
    long_tel: String,
    short_tel: String,
    email: String,
    mystery_lover: String,
    mystery_lover_id: String,
    match_success: {
        type: Number,
        default: 0
    }
});


var User = mongodb.Db.model('User', UserSchema);

module.exports = User;