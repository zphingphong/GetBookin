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
//    userId:    'hello_api1.getbookin.com',
//    password:  'LVD5NLA3J8N2W7SX',
//    signature: 'AFcWxV21C7fd0v3bYYYRCpSSRl31AmzI5Jg.pPWKnJhsHILf-Cq0gPuG',
//    appId: 'APP-6LF625064D807440K'

    userId:    'minion-biz_api1.despicable.com',
    password:  '1394186512',
    signature: 'AsO6JRt7OOQXNrngeQo0sPgJ2dfxA17glaqfeB8vGtsDSpqj63voBGal',
    sandbox:   true //defaults to false
});

var getBookingPaymentInfo = function(bookings, cb){
    var price = 0;

    locationModel.retrieveById(bookings[0].location, function(err, location){
        if(bookings[0].changeBookingPrice) {
            price = bookings[0].changeBookingPrice;
        } else {
            switch (location.pricingPattern) {
                case 'flat':
                    price = location.pricingFlat * bookings.length;
                    break;
            }
        }

        cb({
            success: true,
            price: price,
            previousPaid:  bookings[0].paidBookingPrice ? bookings[0].paidBookingPrice : 0,
            payPalAccount: location.payPalAccount
        })
    });
};

var doBook = function(req, res, cb){
    var bookings = req.body.selectedTimeCourt;
    var contactInfo = req.body.contactInfo;
    var payment = req.body.payment;
    var bookingId = req.body.bookingId;
    var isAdmin = req.body.isAdmin;
    var isSelectionAvailable = true;
    var unavailableSelection;
    var checkCount = 0;

    bookings.forEach(function(booking, index, bookings){
        booking.bookingId = bookingId;
        booking.contactName = contactInfo.contactName;
        booking.note = contactInfo.note;
        booking.contactNo = contactInfo.contactNo;
        booking.dateTime = moment(booking.dateTime, dateTimeClientFormat).toDate();
        booking.payment = payment;

        // Retrieve booking to check if they're already exist. Search booking by time and court.
        bookingModel.getBookingByCourtAndDateTime(booking.courtNo, booking.dateTime, booking.location, function(foundBookings){
            checkCount++;
            if(foundBookings.length > 0){
                isSelectionAvailable = false;
                unavailableSelection = booking;
            }

            if(bookings.length == checkCount){ // Last booking to check
                if(isSelectionAvailable){
                    bookingModel.book(bookings, function(status){
                        if(status.success && !isAdmin && payment.paid != 'full'){
                            getBookingPaymentInfo(bookings, function(args){
                                //Store paid price
                                bookingModel.updateBookingById(bookings[0].bookingId, {
                                    'payment.dollar': args.price + args.previousPaid
                                }, function(numberAffected, rawResponse){
                                });

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
                                            payment.payPalPayKey = response.payKey;
                                            // Update pay key to the booking object
                                            bookingModel.updateBookingById(bookingId, {
                                                'payment.payPalPayKey': response.payKey
                                            }, function(numberAffected, rawResponse){
                                                if(numberAffected > 0){
                                                    res.send({
                                                        success: true,
                                                        paymentApprovalUrl: response.paymentApprovalUrl
                                                    });
                                                }

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
                                        errorMsg: 'Cannot calculate total price for this booking. Please try again.'
                                    });
                                }
                            });
                        } else if(status.success && cb) {
                            cb(status);
                        } else {
                            res.send(status);
                        }
                    });
                } else {
                    if(cb){
                        cb({
                            success: false,
                            errorMsg: 'Court ' + unavailableSelection.courtNo + ' you selected is not available on ' + moment(unavailableSelection.dateTime).format(dateTimeClientFormat) + ' Please select other times.'
                        });
                    } else {
                        res.send({
                            success: false,
                            errorMsg: 'Court ' + unavailableSelection.courtNo + ' you selected is not available on ' + moment(unavailableSelection.dateTime).format(dateTimeClientFormat) + ' Please select other times.'
                        });
                    }
                }
            }
        });
    });
};

exports.book = function(req, res){
    doBook(req, res, null);
};

exports.searchBooking = function(req, res){
    bookingModel.getBookingByDateTimeRange(moment(req.query.startDateTime, dateTimeClientFormat), moment(req.query.endDateTime, dateTimeClientFormat), req.query.location, function(bookings){
        res.send(bookings);
    });
};

exports.cancelOneBookingByAdmin = function(req, res){
    bookingModel.deleteBookingByIdCourtTime(req.body.bookingInfo.bookingId, req.body.bookingInfo.courtNo, req.body.bookingInfo.dateTime, function(deletedcount){
        if(deletedcount > 0){
            res.send({
                success: true,
                msg: 'The booking is canceled.'
            });
        }
    });
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
                    var payPalPayload = {
                        payKey:         bookings[0].payment.payPalPayKey,
                        requestEnvelope: {
                            errorLanguage:  'en_US'
                        },
                        actionType:     'REFUND',
                        refundType:     'Full'
                    };

                    paypalSdk.refund(payPalPayload, function (err, response) {
                        if (err) {
                            console.log(err);
                        } else {
                            var msg;
                            if(response.refundInfoList){
                                switch(response.refundInfoList.refundInfo[0].refundStatus) {
                                    case 'REFUNDED': // Refund completed
                                        msg = 'Your booking is canceled. Full refund has made to the same payment method as you used when booking was made.';
                                        break;
                                    case 'NOT_PAID':
                                        msg = 'Your booking is canceled. No refund was made, since you have not paid for the booking.'
                                        break;
                                    default:
                                        msg = 'Your booking is canceled. However, we experienced a problem with the refund please contact us.';
                                }
                            } else {
                                msg = 'Your booking is canceled. However, we experienced a problem with the refund please contact us.';
                            }
                            bookingModel.deleteBookingById(bookingId, function(deletedcount){
                                if(deletedcount == bookings.length){
                                    res.send({
                                        success: true,
                                        msg: msg
                                    });
                                }
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

exports.changeBookingByAdmin = function(req, res){
    if(JSON.parse(req.cookies.user).accountType == 'admin'){ // Make sure the user is admin
        if(req.body.isCourtDateTimeChanged){
            delete req.body.bookingInfo._id;
            delete req.body.bookingInfo.__v;
            req.body.selectedTimeCourt = [req.body.bookingInfo];
            req.body.contactInfo = {
                contactName: req.body.bookingInfo.contactName,
                contactNo: req.body.bookingInfo.contactNo,
                note: req.body.bookingInfo.note
            };
            req.body.payment = req.body.bookingInfo.payment;
            req.body.bookingId = req.body.bookingInfo.bookingId;
            req.body.isAdmin = true;
            doBook(req, res, function(status){
                if(status.success){
                    bookingModel.deleteBookingByIdCourtTime(req.body.bookingInfo.bookingId, req.body.bookingInfo.originalCourtNo, req.body.bookingInfo.originalDateTime, function(deletedcount){
                        if(deletedcount > 0){
                            res.send({
                                success: true,
                                msg: 'The booking is moved.'
                            });
                        }
                    });
                } else {
                    res.send({
                        success: false,
                        errorMsg: 'Failed to move this booking. ' + status.errorMsg
                    });
                }
            });
        } else {
            bookingModel.updateBookingById(req.body.bookingInfo.bookingId, {
                'payment.paid': (req.body.bookingInfo.isPaid != undefined) ? (req.body.bookingInfo.isPaid ? 'full' : 'none') : req.body.bookingInfo.payment.paid,
                contactName: req.body.bookingInfo.contactName,
                contactNo: req.body.bookingInfo.contactNo,
                note: req.body.bookingInfo.note
            }, function(numberAffected, rawResponse){
                if(numberAffected > 0){
                    res.send({
                        success: true
                    });
                } else {
                    res.send({
                        success: false,
                        errorMsg: 'Failed to update the booking.'
                    });
                }

            });
        }
    }
};

exports.changeBooking = function(req, res){
    bookingModel.deleteBookingById(req.body.oldBooking[0].bookingId, function(deletedcount){
        if(deletedcount == req.body.oldBooking.length){
            // Check if the total price is the same
            req.body.oldBooking[0].location = req.body.oldBooking[0].location._id;
            getBookingPaymentInfo(req.body.oldBooking, function(args){
                if(args.success){
                    var totalOldBookingPrice = args.price;
                    getBookingPaymentInfo(req.body.selectedTimeCourt, function(args){
                        if(args.success){
                            var totalNewBookingPrice = args.price;

                            if(totalOldBookingPrice == totalNewBookingPrice && req.body.oldBooking[0].payment.paid == 'full') { // Same price changed the booking
                                req.body.payment.paid = 'full';
                                exports.book(req, res);
                            } else if(totalOldBookingPrice < totalNewBookingPrice) { // New selection is more expensive, charge more
                                req.body.selectedTimeCourt[0].changeBookingPrice = totalNewBookingPrice - totalOldBookingPrice;
                                req.body.selectedTimeCourt[0].paidBookingPrice = totalOldBookingPrice;
                                exports.book(req, res);
                            } else { // New booking is less expensive, refund customer the difference
                                var payPalPayload = {
                                    payKey:         req.body.oldBooking[0].payment.payPalPayKey,
                                    requestEnvelope: {
                                        errorLanguage:  'en_US'
                                    },
                                    actionType:     'REFUND',
                                    refundType:     'Partial',
                                    currencyCode:   'CAD',
                                    amount:         totalOldBookingPrice - totalNewBookingPrice
                                };

                                paypalSdk.refund(payPalPayload, function (err, response) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        if(response.refundInfoList){
                                            req.body.payment.paid = 'full';
                                            req.body.selectedTimeCourt[0].paidBookingPrice = totalNewBookingPrice - totalOldBookingPrice;
                                            exports.book(req, res);
                                        }
                                    }
                                });
                            }
                        } else {
                            res.send({
                                success: false,
                                error: 'Cannot calculate total price for your new booking selection. Please try again.'
                            });
                        }
                    });

                } else {
                    res.send({
                        success: false,
                        error: 'Cannot calculate total price for your old booking. Please try again.'
                    });
                }
            });
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
        'payment.paid': 'full'
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
            msg: 'Your booking was canceled, and your payment was refunded'
        });
    });
};
