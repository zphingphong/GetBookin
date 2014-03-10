/**
 * Created by ZoM on 15/12/13.
 */

//Import all schemas
var bookingModel = require('../models/booking');
var locationModel = require('../models/location');

//Import libraries
var moment = require('moment');

var Paypal = require('paypal-adaptive');
var paypalSdk = new Paypal({
    userId:    'minion-biz_api1.despicable.com',
    password:  '1394186512',
    signature: 'AsO6JRt7OOQXNrngeQo0sPgJ2dfxA17glaqfeB8vGtsDSpqj63voBGal',
    sandbox:   true //defaults to false
});

var getBookingPaymentInfo = function(bookings, cb){
    var price = 0;
    locationModel.retrieveById(bookings[0].location, function(err, location){
        switch (location.pricingPattern) {
            case 'flat':
                price = location.pricingFlat * bookings.length;
                break;
        }

        cb({
            success: true,
            price: price,
            payPalAccount: location.payPalAccount
        })
    });
};

exports.book = function(req, res){
    var bookings = req.body.selectedTimeCourt;
    var contactInfo = req.body.contactInfo;
    var payment = req.body.payment;
    var bookingId = req.body.bookingId;
    var isAdmin = req.body.isAdmin;

    bookings.forEach(function(booking, index, bookings){
        booking.bookingId = bookingId;
        booking.contactName = contactInfo.contactName;
        booking.contactNo = contactInfo.contactNo;
        var momentDateTime = moment(booking.dateTime, 'YYYY-MM-DD hA');
        booking.dateTime = new Date(momentDateTime.year(), momentDateTime.month(), momentDateTime.date(), momentDateTime.hour());
        booking.payment = payment;
    });

    bookingModel.book(bookings, function(status){
        if(status.success && !isAdmin){
            getBookingPaymentInfo(bookings, function(args){
                if(args.success){
                    var totalPrice = args.price;
                    var payPalPayload = {
                        requestEnvelope: {
                            errorLanguage:  'en_US'
                        },
                        actionType:     'PAY',
                        currencyCode:   'CAD',
                        feesPayer:      'EACHRECEIVER',
                        memo:           'Booking payment',
                        cancelUrl:      'http://www.getbookin.com/booking/cancelpayment/' + bookingId,
                        returnUrl:      'http://www.getbookin.com/booking/paid/' + bookingId,
//                        cancelUrl:      'http://localhost:3000/booking/cancelpayment/' + bookingId,
//                        returnUrl:      'http://localhost:3000/booking/paid/' + bookingId,
                        receiverList: {
                            receiver: [{
                                email:  args.payPalAccount,
                                amount: totalPrice
                            }]
                        }
                    };

                    paypalSdk.pay(payPalPayload, function (err, response) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({
                                success: true,
                                paymentApprovalUrl: response.paymentApprovalUrl
                            });
                            // Response will have the original Paypal API response
//                            console.log(response);
                            // But also a paymentApprovalUrl, so you can redirect the sender to checkout easily
//                            console.log('Redirect to %s', response.paymentApprovalUrl);
                        }
                    });
                } else {
                    res.send({
                        success: false,
                        error: 'Cannot calculate total price for this booking. Please try again.'
                    });
                }
            });
        } else {
            res.send(status);
        }
    });
};

exports.searchBooking = function(req, res){
    bookingModel.bookingByDateTimeRange(moment(req.query.startDateTime, 'YYYY-MM-DD hA'), moment(req.query.endDateTime, 'YYYY-MM-DD hA'), req.query.location, function(bookings){
        res.send(bookings);
    });
};

exports.doCancelBooking = function(){

};

exports.cancelBooking = function(req, res){
    var bookingId = req.params.bookingId;
    bookingModel.getBookingAndLocationById(bookingId, function(bookings){
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
                    bookingModel.deleteBookingById(bookingId, function(deletedcount){
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
    bookingModel.getBookingAndLocationById(bookingId, function(bookings){
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
    bookingModel.deleteBookingById(req.body.oldBooking[0].bookingId, function(deletedcount){
        if(deletedcount == req.body.oldBooking.length){
            exports.book(req, res);
        }
    });
};

exports.cancelBookingByAdmin = function(req, res){ // Admin is allow to cancel anytime, ignore the rules
    bookingModel.deleteBookingById(req.params.bookingId, function(deletedcount){
        if(deletedcount > 0){
            res.send({
                success: true,
                msg: 'The booking is canceled.'
            });
        }
    });
};

exports.paidBooking = function(req, res){
    var bookingId = req.params.bookingId;
    bookingModel.updateBookingById(bookingId, {
        payment: {
            paid: 'full'
        }
    }, function(numberAffected, rawResponse){
        if(numberAffected > 0){
//            res.send({
//                success: true,
//                msg: 'Thank you for booking. You confirmation number is ' + bookingId + '.'
//            });
            res.render('index', {
                title: 'Get Bookin\' - Badminton',
                msg: 'Thank you for booking. You confirmation number is <strong>' + bookingId + '</strong>.'
            });
        } else {
            res.render('index', {
                title: 'Get Bookin\' - Badminton',
                msg: 'No booking found. Payment failed.'
            });
//            res.send({
//                success: false,
//                error: 'No booking found.'
//            });
        }

    });
};

exports.cancelPaymentBooking = function(req, res){
    var bookingId = req.params.bookingId;
    bookingModel.deleteBookingById(bookingId, function(deletedcount){
        res.render('index', {
            title: 'Get Bookin\' - Badminton',
            msg: 'Your payment and booking is canceled.'
        });
    });
};
