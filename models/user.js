/**
 * Created by ZoM on 05/02/14.
 */

var mongoose = require('mongoose');
require('../public/config');


var userSchema = mongoose.Schema({
    name: String,
    phoneNo: String,
    email: String
});

var userModel = mongoose.model('User', userSchema);
exports.model = userModel;

