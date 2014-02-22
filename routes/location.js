/**
 * Created by ZoM on 05/12/13.
 */

//Import all schemas
var location = require('../models/location');


exports.location = function(req, res){
    location.retrieveAll(req, res, function(locations){
        res.send(locations);
    });
};

exports.retrieveByAdmin = function(req, res){
    location.retrieveByAdmin(req.user, function(locations){
        res.send(locations);
    });
};

exports.scheduleByDateTime = function(req, res){
    location.getScheduleByDateTime(req, res, function(schedule){
        res.send(schedule);
    });
};
