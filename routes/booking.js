/**
 * Created by ZoM on 15/12/13.
 */

//Import all schemas
var booking = require('../models/booking');

//Import libraries
var moment = require('moment');

exports.book = function(req, res){
    var bookings = req.body.selectedTimeCourt;
    var contactInfo = req.body.contactInfo;
    bookings.forEach(function(booking, index, bookings){
        booking.contactName = contactInfo.contactName;
        booking.contactNo = contactInfo.contactNo;
        booking.dateTime = moment(booking.dateTime, 'YYYY-MM-DD hA').toDate();
    });

    booking.book(bookings, function(status){
        res.send(status);
    });
};

exports.bookingByCourtAndTime = function(req, res){
    booking.getBookingByCourtAndTime(req, res, function(bookings){
        res.send(bookings);
    });
};
