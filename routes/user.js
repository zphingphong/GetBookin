/**
 * Created by ZoM on 05/02/14.
 */

//Import all schemas
var user = require('../models/user');

exports.signIn = function(req, res){

    var loggedInCb = function(response){
        if(response.user){ // found a user
            res.cookie('user', JSON.stringify(response.user), {
                expires: moment().add('d', 2).toDate(),
                secure: true
            });
            res.send(response);
        } else { // create a new user
            user.create(req.body, function(response){
                res.send(response);
            });
        }
    };

    // Facebook sign in
    if(req.body.facebookId){
        user.retrieveByEmailAndFacebookId(req.body, loggedInCb);
    } else if(req.body.googleId) {
        user.retrieveByEmailAndGoogleId(req.body, loggedInCb);
    } else {
        res.send({
            success: false,
            error: 'Logging in with invalid id.',
            errorCode: ERROR_LOGIN_FAILURE
        });
    }

};

