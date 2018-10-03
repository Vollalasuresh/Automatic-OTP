var mongoose= require('mongoose');
var msgSchema = mongoose.Schema({
    name: String,
    otp:String,
    date:String,


})

module.exports=msg= mongoose.model('msg',msgSchema);
