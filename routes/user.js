/**
 * Created by ZoM on 05/02/14.
 */

//Import all schemas
var user = require('../models/user');

exports.signIn = function(req, res){
    console.log('-----------------------------------------');
    console.log(req.body);
    user.create(req.body, function(response){
        res.send(response);
    });
};

