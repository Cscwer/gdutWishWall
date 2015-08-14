var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
    username: String,
    email: String,
    sex: String,
    password: String,
    real_name: String,
    school_area: String,
    college_name: String,
    long_tel: String,
    short_tel: String
});

//验证密码方法
UserSchema.methods.validPassword = function(pwd) {
    return (this.password === pwd);
};

UserSchema.plugin(passportLocalMongoose);

var User = mongodb.Db.model('User', UserSchema);

module.exports = User;