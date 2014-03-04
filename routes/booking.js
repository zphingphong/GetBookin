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
    var paid = req.body.paid;
    var bookingId = req.body.bookingId;

    bookings.forEach(function(booking, index, bookings){
        booking.bookingId = bookingId;
        booking.contactName = contactInfo.contactName;
        booking.contactNo = contactInfo.contactNo;
        booking.dateTime = moment(booking.dateTime, 'YYYY-MM-DD hA').toDate();
        booking.paid = paid;
    });

    booking.book(bookings, function(status){
        res.send(status);
    });
};

exports.searchBooking = function(req, res){
    booking.bookingByDateTimeRange(moment(req.query.startDateTime, 'YYYY-MM-DD hA'), moment(req.query.endDateTime, 'YYYY-MM-DD hA'), req.query.location, function(bookings){
        res.send(bookings);
    });
};
