var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

var WishSchema = new Schema({
	user: String,
	username: String,
	wish: String,
	publishDate: {type: Date, default: Date.now},
	ispicked: {type: String, default: 0},
	wishpicker: String
});


var Wish = mongodb.Db.model('Wish', WishSchema);

module.exports = Wish;