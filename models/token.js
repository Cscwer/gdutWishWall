var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var TokenSchema = new Schema({
    timestamp_token: {
        type: Date,
        default: Date.now
    },
    timestamp_ticket: {
    	type: Date,
    	default: Date.now
    },
    token: String,
    ticket: String
});

var Token = mongodb.Db.model('Token', TokenSchema);

module.exports = Token;