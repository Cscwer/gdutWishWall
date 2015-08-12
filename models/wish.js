var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var WishSchema = new Schema({
    user: String,
    username: String,
    wishType: Number,
    wish: String,
    publishDate: {
        type: Date,
        default: Date.now
    },
    ispicked: {
        type: Number,
        default: 0
    },
    wishpicker: String,
    wishpickername: String
});


var Wish = mongodb.Db.model('Wish', WishSchema);

module.exports = Wish;