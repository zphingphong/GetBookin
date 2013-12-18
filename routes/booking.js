/**
 * Created by ZoM on 15/12/13.
 */

//Import all schemas
var booking = require('../models/booking');


exports.book = function(req, res){
    booking.book(req, res, function(bookings){
//        res.send(bookings);
        res.send(req.body);
    });
};

exports.bookingByCourtAndTime = function(req, res){
    booking.getBookingByCourtAndTime(req, res, function(bookings){
        res.send(bookings);
    });
};
