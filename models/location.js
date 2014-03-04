/**
 * Created by ZoM on 01/12/13.
 */

var mongoose = require('mongoose');


var locationSchema = mongoose.Schema({
    name: String,
    id: String,
    address: {
        street: String,
        city: String,
        province: String,
        country: String,
        postalCode: String
    },
    geolocation: {
        latitude: Number,
        longitude: Number
    },
    phones: [String],
    websites: [String],
    emails: [String],
    regularHours: [{
        day: String,
        open: Number,
        close: Number
    }],
    holidayHours: [{
        date: Date,
        open: Number,
        close: Number
    }],
    hoursText: String,
    images: [String],
    pricingPattern: String,
    pricingFlat: Number,
    pricingDay: [Number],
    courtCount: Number,
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    allowChange: Number, // Number of hours that the user allow to change booking before the booked hour (-1 means no change allowed, 0 means anytime)
    allowCancel: Number // Same logic as allowChange
});

var locationModel = mongoose.model('Location', locationSchema);
exports.model = locationModel;


exports.retrieveAll = function(req, res, cb){
    locationModel.find(function (err, locations) {
        if(err){
            console.error('Cannot retrieve location from database, error: ');
            console.error(err);
        } else {
            cb(locations);
        }
    });
};

exports.retrieveByAddress = function(req, res, cb){
};

exports.retrieveByAdmin = function(admin, cb){
    locationModel.find({
        admins : { $in: [admin._id] }
    }, function (err, locations) {
        if(err){
            console.error('Cannot retrieve location from database, error: ');
            console.error(err);
        } else {
            cb(locations);
        }
    });
};

exports.getScheduleByDateTime = function(req, res, cb){
    var date = req.params.datetime;
    locationModel.find(function (err, locations) {
        if(err){
            console.error('Cannot retrieve location from database, error: ');
            console.error(err);
        } else {
            cb(locations);
        }
    });
};

