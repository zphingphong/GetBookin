/**
 * Created by ZoM on 01/12/13.
 */

var mongoose = require('mongoose');
var util = require('util');
require('../public/config');


var bookingSchema = mongoose.Schema({
    bookingId: String, // Location id + first character of the customer name + current timestamp
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    courtNo: Number,
    dateTime: Date,
    contactName: String,
    contactNo: String,
    contactEmail: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    payment: {
        paid: String,
        method: String,
        dollar: Number,
        payPalPayKey: String
    },
    note: String
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
            var bookingId = util.isArray(bookings) ? bookings[0].bookingId : bookings.bookingId;
            cb({
                success: true,
                msg: 'Thank you for booking. You confirmation number is <strong>' + bookingId + '</strong>.',
                bookings: bookings
            });
        }
    })
};

exports.getBookingByCourtAndDateTime = function(courtNo, dateTime, location, cb){
    bookingModel.find({
        dateTime: dateTime,
        location: location,
        courtNo: courtNo
    }, function (err, bookings) {
        if(err){
            console.error('Cannot retrieve booking from database, error: ');
            console.error(err);
        } else {
            cb(bookings);
        }
    });
};

exports.getBookingByDateTimeRange = function(startDateTime, endDateTime, location, cb){
    bookingModel.find({
        dateTime: {
            $gte: startDateTime,
            $lte: endDateTime
        },
        location: location
    }, function (err, bookings) {
        if(err){
            console.error('Cannot retrieve location from database, error: ');
            console.error(err);
        } else {
            cb(bookings);
        }
    });
};

exports.getBookingAndLocationById = function(bookingId, cb){
    bookingModel.find({
        bookingId: bookingId
    }, function (err, bookings) {
        if(err){
            console.error('Cannot retrieve booking from database, error: ');
            console.error(err);
        } else {
            cb(bookings);
        }
    }).populate('location');
};

exports.deleteBookingById = function(bookingId, cb){
    bookingModel.find({
        bookingId: bookingId
    }).remove(function (err, deletedcount) {
        if(err){
            console.error('Cannot retrieve booking from database, error: ');
            console.error(err);
        } else {
            cb(deletedcount);
        }
    });
};

exports.deleteBookingByIdCourtTime = function(bookingId, courtNo, dateTime, cb){
    bookingModel.find({
        bookingId: bookingId,
        courtNo: courtNo,
        dateTime: dateTime
    }).remove(function (err, deletedcount) {
        if(err){
            console.error('Cannot retrieve booking from database, error: ');
            console.error(err);
        } else {
            cb(deletedcount);
        }
    });
};

exports.updateBookingById = function(bookingId, updateValues, cb){
    bookingModel.update({
        bookingId: bookingId
    }, updateValues, {
        multi: true
    }, function(err, numberAffected, rawResponse){
        if(err){
            console.error('Cannot update booking to database, error: ');
            console.error(err);
        } else {
            cb(numberAffected, rawResponse);
        }
    });
};

