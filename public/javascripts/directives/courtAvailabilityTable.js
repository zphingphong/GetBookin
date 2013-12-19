/**
 * Created by ZoM on 14/12/13.
 */

window.getBookinNgApp.directive('courtAvailabilityTable', function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/courtAvailabilityTable',
        controller: function($scope, $http) {
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
                var availability = {};
                $scope.selectedLocation = location ? location : $scope.selectedLocation;
                var hours = $scope.selectedLocation.regularHours;
                var todayDate = moment($('#time-court-selection-date-input').val(), "YYYY-MM-DD");
                var todayHours = hours[todayDate.day()];
                var currentHour = moment($('#time-court-selection-time-input').val(), "hh:mm A").hour();
                var isOpen = $scope.isOpen(todayHours, currentHour);

                //Calculate number of columns to be UI responsive. Show more hours if user's screen is wider.
                //(Schedule table width - court label column) / schedule item width then divided into half
                var halfDisplayCount = Math.floor((($('#time-court-selection-table').width() - 130) / 100) / 2);

                //If the court is closed, show next day schedule
                if (!isOpen) {
                    todayHours = hours[todayDate.day() + 1];
                    currentHour = todayHours.open + halfDisplayCount;
                }

                availability.date = todayDate;
                availability.courts = [];
                availability.times = [];
                for (var iTime = currentHour - halfDisplayCount; iTime < currentHour + halfDisplayCount; iTime++) {

                    //If closed, run to the next day
                    if (!$scope.isOpen(todayHours, moment(iTime, "hh").hour())) {
                        //Calculate leftover
                        var leftover = currentHour + halfDisplayCount - iTime;
                        //Reset the end hour
                        halfDisplayCount = 0;
                        iTime = hours[todayDate.day() + 1].open;
                        currentHour = iTime + leftover;
                    }

                    availability.times.push(moment().hour(iTime).format('hA'));
                    for (var courtNo = 0; courtNo < $scope.selectedLocation.courtCount; courtNo++) {
                        if (!$.isArray(availability.courts[courtNo])) {
                            availability.courts[courtNo] = [];
                        }
                        availability.courts[courtNo].push({
                            isAvailable: true,
                            price: 20
                        });
                    }
                }

                $scope.schedule = availability;
            };

            $scope.$on('selectedLocationBroadcast', function(event, args){
                $scope.refreshSchedule(args.location);
//                $http.get('/schedule/201312140800').success(function(schedule) {
//                    console.log(schedule);
//                    $scope.schedule = schedule;
//                });
            });

            $scope.book = function(target){
                console.log(target);

//                location: String,
//                courtNo: Number,
//                dateTime: Date,
//                contactName: String,
//                contactNo: String

                var selectedHour = moment($('#time-court-selection-table th').get(target.$index+1).innerText, 'hA').hour();
                $http.post('/book', {
                    location: $scope.selectedLocation._id,
                    courtNo: target.$parent.$index+1, //Refer to court number based on where it's positioned in the UI
                    dateTime: $scope.schedule.date.hour(selectedHour).toDate(),
                    contactName: 'Pan',
                    contactNo: '7781234567'
                }).success(function(status){
                    console.log(moment(status.dateTime).hour(), moment(status.dateTime).date());
                });
            };
        },
        link: function(scope, element, attrs){
        }
    }
});
