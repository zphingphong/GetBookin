
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var location = require('./routes/location');
var booking = require('./routes/booking');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Home page
app.get('/', routes.index);

//RESTful web services
app.get('/location', location.location);
app.get('/schedule/:datetime', location.scheduleByDateTime);
app.post('/booking', booking.book);
app.get('/booking', booking.searchBooking);
app.get('/users', user.list);

//Views
app.get('/partials/:name', routes.partials);
app.get('/templates/:name', routes.templates);

//Locals
app.locals.config = require('./public/config');

mongoose.connect('mongodb://root:getzbookin@dbh45.mongolab.com:27457/getbookinstage');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.info('Connected to the database');


    //Script to insert a location to DB
//    var location = require('./models/location');
//    var locationObj = new location.model({
//        name: String,
//        id: String,
//            address: {
//            street: String,
//                city: String,
//                province: String,
//                country: String,
//                postalCode: String
//        },
//        geolocation: {
//            latitude: Number,
//                longitude: Number
//        },
//        phones: [String],
//            websites: [String],
//            emails: [String],
//            regularHours: [{
//            day: String,
//            open: Number,
//            close: Number
//        }],
//            holidayHours: [{
//            date: Date,
//            open: Number,
//            close: Number
//        }],
//            hoursText: String,
//            images: [String]
//    });
//
//    locationObj.save(function (err, location) {
//        if (err)
//            console.log(err);
//    });


});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
