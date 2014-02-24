/**
 * Created by ZoM on 14/12/13.
 */

window.getBookinNgApp.directive('courtAvailabilityTable', function(){
    return {
        restrict: 'E',
        templateUrl: '/partials/courtAvailabilityTable',
        controller: function($rootScope, $scope, $http, $window) {

            if($rootScope.user && $rootScope.user.accountType == 'admin' && $window.location.pathname == '/pages/adminSchedule'){
                $scope.isAdmin = true;
            } else {
                $scope.isAdmin = false;
            }

            //Private helper function to check if the court is open
            $scope.isOpen = function(todayHours, currentHour){
                //Closing hour is less than opening hour means (close <= selectedTime < open)
                if(todayHours.close < todayHours.open){
                    //Check if the court is closed for the selected time
                    if(currentHour < todayHours.open && currentHour >= todayHours.close){
                        return false;
                    }
                } else {
                    //Check if the court is closed for the selected time
                    if(currentHour < todayHours.open || currentHour >= todayHours.close){
                        return false;
                    }
                }
                return true;
            };

            $scope.refreshSchedule = function(location) {

                var selectedTimeCourts = [];
                var dateInput = $('#time-court-selection-date-input');
                var timeInput = $('#time-court-selection-time-input');

                //Retrieve user selections from session storage
                if(sessionStorage.selectedTimeCourt){
                    selectedTimeCourts = JSON.parse(sessionStorage.selectedTimeCourt);
                }

                var availability = {};
                $scope.selectedLocation = location ? location : $scope.selectedLocation;
                var hours = $scope.selectedLocation.regularHours;
                var todayDate = moment(dateInput.val(), "YYYY-MM-DD");
                var todayDay = todayDate.day();
                var todayHours = hours[todayDate.day()];
                var currentHour = moment(timeInput.val(), "hh:mm A").hour();
                var isOpen = $scope.isOpen(todayHours, currentHour);

                //Calculate number of columns to be UI responsive. Show more hours if user's screen is wider.
                //(Schedule table width - court label column) / schedule item width then divided into half
                var halfDisplayCount = Math.floor((($('#time-court-selection-table').width() - 130) / 100) / 2);

                //If the court is closed, show next day schedule
                if (!isOpen) {
                    if(currentHour > todayHours.open){
                        todayDay++; //Move to next day
                        todayDate.add('d', 1); //Move to the next date
                        if(todayDay == 7){ //If last day of week (sat), reset it
                            todayDay = 0;
                        }
                        todayHours = hours[todayDay];
                    }

                    currentHour = todayHours.open + halfDisplayCount;
                } else { // It's currently open, but a few hours before it that are showing on the table are close
                    if(!$scope.isOpen(todayHours, currentHour - halfDisplayCount)){
                        currentHour = todayHours.open + halfDisplayCount;
                    }
                }

                //Check pricing scheme
                var currentPrice;
                if($scope.selectedLocation.pricingPattern == 'flat'){
                     currentPrice = $scope.selectedLocation.pricingFlat;
                } else if($scope.selectedLocation.pricingPattern == 'day'){
                    currentPrice = $scope.selectedLocation.pricingDay[todayDay];
                }

                availability.courts = [];
                availability.times = [];

                $http.get('/booking', {
                    //Search for any booking since the beginning of today and the next 47 hours to make sure in case the schedule wraps around
                    params: {
                        startDateTime: moment(todayDate).hour(0).format('YYYY-MM-DD hA'),
                        endDateTime: moment(todayDate).add('h', 47).format('YYYY-MM-DD hA'),
                        location: $scope.selectedLocation._id,
                        accountType: $rootScope.user ? $rootScope.user.accountType : null
                    }
                }).success(function(bookings) {
                    for (var iTime = currentHour - halfDisplayCount; iTime < currentHour + halfDisplayCount; iTime++) {

                        //If closed, run to the next day
                        if (!$scope.isOpen(todayHours, moment(iTime, "hh").hour())) {
                            if(todayHours.close > todayHours.open){
                                todayDate.add('d', 1); //Move to next day
                            }
                            todayDay = todayDate.day();

                            //Calculate leftover
                            var leftover = currentHour + halfDisplayCount - iTime;
                            //Reset the end hour
                            halfDisplayCount = 0;
                            iTime = hours[todayDay].open;
                            currentHour = iTime + leftover;
                            todayDate.hour(currentHour);
                            //Get the price for the next day
                            if($scope.selectedLocation.pricingPattern == 'day'){
                                currentPrice = $scope.selectedLocation.pricingDay[todayDay];
                            }
                        }

                        var time = todayDate.hour(iTime).format('hA');
                        var dateTimeStr = todayDate.format('YYYY-MM-DD hA');
                        availability.times.push({
                            time: time,
                            date: todayDate.format('MMM Do'),
                            dateTime: dateTimeStr
                        });
                        for (var courtNo = 0; courtNo < $scope.selectedLocation.courtCount; courtNo++) {
                            if (!$.isArray(availability.courts[courtNo])) {
                                availability.courts[courtNo] = [];
                            }

                            //Display user's selection
                            var isSelected = false;
                            $.each(selectedTimeCourts, function(index, selectedTimeCourt){
                                if(dateTimeStr == selectedTimeCourt.dateTime && courtNo == selectedTimeCourt.courtNo-1){ //-1 because courtNo get store starts form 1 in session storage
                                    isSelected = true;
                                }
                            });

                            //Check if the court is available
                            var existingBookings = $.grep(bookings, function(booking){
                                return moment(booking.dateTime).format('YYYY-MM-DD hA') == dateTimeStr && booking.courtNo-1 == courtNo;
                            });

//                            console.log(existingBookings);

                            availability.courts[courtNo].push({
                                isAvailable: existingBookings.length > 0 ? false : true,
                                price: currentPrice,
                                selected: isSelected,
                                paid: existingBookings.length > 0 ? existingBookings[0].paid : null
                            });
                        }
                    }

                    $scope.schedule = availability;
                });

            };

            if($rootScope.user && $rootScope.user.accountType == 'admin'){
                $scope.refreshSchedule($rootScope.locations[0]);
            }

            $rootScope.$on('locationSelected', function(event, args){
                $scope.refreshSchedule(args.location);
            });

            $scope.timeCourtSelected = function(target){

                //Initiate session storage
                if(!sessionStorage.selectedTimeCourt){
                    sessionStorage.selectedTimeCourt = JSON.stringify([]);
                }

                var timeIndex = target.$parent.$index;
                var courtIndex = target.$parent.$parent.$index;
                var courtNo = courtIndex + 1; //Refer to court number based on where it's positioned in the UI
                var price = $scope.schedule.courts[courtIndex][timeIndex].price;
                var dateTimeStr = $scope.schedule.times[timeIndex].dateTime;
//                var dateTimeStr = $scope.schedule.date.hour(selectedHour).format('YYYY-MM-DD hA'); //For saving locally (must be string for date comparison)
                var locationObjId = $scope.selectedLocation._id;
                var selectedTimeCourts = JSON.parse(sessionStorage.selectedTimeCourt);

                if(target.courtInfo.selected){
                    target.courtInfo.selected = false;

                    //Search selectedTimeCourt array and return the first item of the result
                    var booking = $.grep(selectedTimeCourts, function(booking){
                        return booking.courtNo == courtNo && booking.dateTime == dateTimeStr && booking.location == locationObjId;
                    });
                    selectedTimeCourts.splice(selectedTimeCourts.indexOf(booking[0]), 1);
                } else {
                    target.courtInfo.selected = true;
                    selectedTimeCourts.push({
                        location: locationObjId,
                        courtNo: courtNo,
                        dateTime: dateTimeStr,
                        price: price
                    });
                }

                sessionStorage.selectedTimeCourt = JSON.stringify(selectedTimeCourts);
            };
        },
        link: function(scope, element, attrs){
        }
    }
});
