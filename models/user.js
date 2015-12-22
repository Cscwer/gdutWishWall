var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var UserSchema = new Schema({
    openid: String,
    nickname: String,
    sex: Number,
    province: String,
    city: String,
    country: String,
    headimgurl: String,
    real_name: String,
    school_area: String,
    college_name: String,
    long_tel: String,
    short_tel: String,
    email: String,
    mystery_lover: String
});


var User = mongodb.Db.model('User', UserSchema);

module.exports = User;