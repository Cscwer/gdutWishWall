var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
    username: String,
    email: String,
    sex: String,
    password: String
});

//验证密码方法
UserSchema.methods.validPassword = function(pwd) {
    return (this.password === pwd);
};

UserSchema.plugin(passportLocalMongoose);

var User = mongodb.Db.model('User', UserSchema);

module.exports = User;