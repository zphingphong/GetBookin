/**
 * Created by ZoM on 05/02/14.
 */

//Import all schemas
var user = require('../models/user');
var location = require('../models/location');

//Import libraries
var moment = require('moment');

exports.signIn = function(req, res){

    var loggedInCb = function(response){
        if(response.user){ // found a user
            res.cookie('user', JSON.stringify(response.user), {
                expires: moment().add('d', 2).toDate(),
                path: '/',
                domain: '.getbookin.com'
//                secure: true
            });

            // Get and response with an array of locations, if the user is an admin
            if(response.user.accountType == 'admin'){
                location.retrieveByAdmin(response.user, function(locations){
                    res.cookie('locations', JSON.stringify(locations), {
                        expires: moment().add('d', 2).toDate()
//                        domain: '.getbookin.com'
                    });

                    response.locations = locations;
                    res.send(response);
                });
            } else {
                res.send(response);
            }
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

