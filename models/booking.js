/**
 * Created by ZoM on 01/12/13.
 */

var mongoose = require('mongoose');
require('../public/config');


var bookingSchema = mongoose.Schema({
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    courtNo: Number,
    dateTime: Date,
    contactName: String,
    contactNo: String
});

var bookingModel = mongoose.model('Booking', bookingSchema);
exports.model = bookingModel;


exports.book = function(bookings, cb){
    bookingModel.create(bookings, function(err, bookings){
        if(err){
            cb({
                success: false,
                error: 'Cannot book the court. Error - ' + err,
                errorCode: ERROR_DB_FAILURE
            });
        } else {
            cb({
                success: true
            });
        }
    })
};

exports.getBookingByCourtAndTime = function(req, res, cb){
    var date = req.params.datetime;
    bookinModel.find(function (err, bookings) {
        if(err){
            console.error('Cannot retrieve location from database, error: ');
            console.error(err);
        } else {
            cb(bookings);
        }
    });
};

