var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var WishSchema = new Schema({
    user: String,
    username: String,
    userheadimg: String,
    img: String,
    wishType: String,
    wish: String,
    school_area: String,
    media_id: String,
    useremail: String,
    publishDate: {
        type: Date,
        default: Date.now
    },
    ispicked: {
        type: Number,
        default: 0
    },
    wishpicker: {
        type: String,
        default: ''
    },
    wishpickername: {
        type: String,
        default: ''
    }
});


var Wish = mongodb.Db.model('Wish', WishSchema);

module.exports = Wish;