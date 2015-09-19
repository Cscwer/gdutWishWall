var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var BlessSchema = new Schema({
    user: String,
    username: String,
    bless: String,
    school_area: String,
    praiser: Array,
    praise_num: {
        type: Number,
        default: 0
    }
    publishDate: {
        type: Date,
        default: Date.now
    }
});


var Bless = mongodb.Db.model('Bless', BlessSchema);

module.exports = Bless;