var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var MsgSchema = new Schema({
    msg_type: String,
    sender: String,
    sender_name: String,
    receiver: String,
    receiver_name: String,
    msg: String,
    msg_time: {
        type: Date,
        default: Date.now
    },
    hadread: {
        type: Number,
        default: 0
    }
});


var Msg = mongodb.Db.model('Msg', MsgSchema);

module.exports = Msg;