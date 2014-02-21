/**
 * Created by ZoM on 05/02/14.
 */

var mongoose = require('mongoose');
require('../public/config');


var userSchema = mongoose.Schema({
    name: String,
    phoneNo: String,
    email: String,
    facebookId: String,
    googleId: String,
    accountType: String
});

var userModel = mongoose.model('User', userSchema);
exports.model = userModel;

exports.create = function(user, cb){
    userModel.create(user, function(err, user){
        if(err){
            cb({
                success: false,
                error: 'Cannot create account. Error - ' + err,
                errorCode: ERROR_DB_FAILURE
            });
        } else {
            cb({
                success: true
            });
        }
    })
};

