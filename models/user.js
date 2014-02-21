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
                success: true,
                user: user
            });
        }
    });
};

exports.retrieveByEmail = function(user, cb){
    userModel.findOne({ 'email': user.email }, function (err, user) {
        cb({
            success: true,
            user: user
        });
    });
};

exports.retrieveByEmailAndFacebookId = function(user, cb){
    userModel.findOne({ 'email': user.email, 'facebookId': user.facebookId }, function (err, user) {
        cb({
            success: true,
            user: user
        });
    });
};

exports.retrieveByEmailAndGoogleId = function(user, cb){
    userModel.findOne({ 'email': user.email, 'googleId': user.googleId }, function (err, user) {
        cb({
            success: true,
            user: user
        });
    });
};

