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
    var payment = req.body.payment;
    var bookingId = req.body.bookingId;

    bookings.forEach(function(booking, index, bookings){
        booking.bookingId = bookingId;
        booking.contactName = contactInfo.contactName;
        booking.contactNo = contactInfo.contactNo;
        booking.dateTime = moment(booking.dateTime, 'YYYY-MM-DD hA').toDate();
        booking.payment = payment;
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

exports.cancelBooking = function(req, res){
    var bookingId = req.params.bookingId;
    booking.getBookingAndLocationById(bookingId, function(bookings){
        if(bookings.length > 0){
            // Check for the cancellation rule of this location
            var location = bookings[0].location;
            var allowCancel = location.allowCancel;
            if(allowCancel < 0){ // Not allowed
                res.send({
                    success: false,
                    error: 'Cancellation is not allowed for this booking. Please contact ' + location.name + ' at ' + location.phones[0] + ' for more information.'
                });
            } else {
                if(moment(bookings[0].dateTime).diff(moment(), 'h') < allowCancel){ // Too late to cancel
                    res.send({
                        success: false,
                        error: 'It is too late to cancel this booking. You may cancel this booking ' + allowCancel + ' hours before the booking time.'
                    });
                } else { // Cancel booking
                    booking.deleteBookingById(bookingId, function(deletedcount){
                        if(deletedcount == bookings.length){
                            res.send({
                                success: true,
                                msg: 'Your booking is canceled.'
                            });
                        }
                    });
                }
            }
        } else {
            res.send({
                success: false,
                error: 'Cannot find any booking associated with this confirmation number. Please double check the number. Note that it is case sensitive.'
            });
        }
    });
};

exports.getChangeBooking = function(req, res){
    var bookingId = req.params.bookingId;
    booking.getBookingAndLocationById(bookingId, function(bookings){
        if(bookings.length > 0){
            // Check for the change rule of this location
            var location = bookings[0].location;
            var allowChange = location.allowChange;
            if(allowChange < 0){ // Not allowed
                res.send({
                    success: false,
                    error: 'Change is not allowed for this booking. Please contact ' + location.name + ' at ' + location.phones[0] + ' for more information.'
                });
            } else {
                if(moment(bookings[0].dateTime).diff(moment(), 'h') < allowChange){ // Too late to cancel
                    res.send({
                        success: false,
                        error: 'It is too late to change this booking. You may change this booking ' + allowChange + ' hours before the booking time.'
                    });
                } else { // Return existing booking to user
                    res.send({
                        success: true,
                        booking: bookings
                    });
                }
            }
        } else {
            res.send({
                success: false,
                error: 'Cannot find any booking associated with this confirmation number. Please double check the number. Note that it is case sensitive.'
            });
        }
    });
};

exports.changeBooking = function(req, res){
    var oldBooking = req.body.oldBooking;
    var bookingId = req.params.bookingId;
    booking.getBookingAndLocationById(bookingId, function(bookings){
        if(bookings.length > 0){
            // Check for the change rule of this location
            var location = bookings[0].location;
            var allowChange = location.allowChange;
            if(allowChange < 0){ // Not allowed
                res.send({
                    success: false,
                    error: 'Change is not allowed for this booking. Please contact ' + location.name + ' at ' + location.phones[0] + ' for more information.'
                });
            } else {
                if(moment(bookings[0].dateTime).diff(moment(), 'h') < allowChange){ // Too late to cancel
                    res.send({
                        success: false,
                        error: 'It is too late to change this booking. You may change this booking ' + allowChange + ' hours before the booking time.'
                    });
                } else { // Return existing booking to user
                    res.send(bookings);
                }
            }
        } else {
            res.send({
                success: false,
                error: 'Cannot find any booking associated with this confirmation number. Please double check the number. Note that it is case sensitive.'
            });
        }
    });
};
