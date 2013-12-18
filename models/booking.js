/**
 * Created by ZoM on 01/12/13.
 */

var mongoose = require('mongoose');


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

var bookinModel = mongoose.model('Booking', bookingSchema);
exports.model = bookinModel;


exports.book = function(req, res, cb){
    console.log(req.body);
//    var bookingObj = new bookinModel.model({
//        location: "AceBadminton",
//        courtNo: 10,
//        dateTime: Date,
//        contactName: String,
//        contactNo: String
//    });
//    bookingObj.save(function (err, bookings) {
//    });
    cb(req.body);
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

