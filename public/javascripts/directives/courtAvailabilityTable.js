/**
 * Created by ZoM on 14/12/13.
 */

window.getBookinNgApp.directive('courtAvailabilityTable', function(){
    return {
        restrict: 'E',
        templateUrl: 'templates/courtAvailabilityTable',
        controller: function($scope, $http) {
            $scope.$on('selectedLocationBroadcast', function(event, args){
                var availability = {};
                $scope.selectedLocation = args.location;
                var hours = $scope.selectedLocation.regularHours;
                var todayDate = moment($('#time-court-selection-date-input').val(), "YYYY-MM-DD");
                var todayHours = hours[todayDate.day()];
                var isOpen = true;
                var currentHour = moment($('#time-court-selection-time-input').val(), "hh:mm A").hour();

                //Closing hour is less than opening hour means (close <= selectedTime < open)
                if(todayHours.close < todayHours.open){
                    //Check if the court is closed for the selected time
                    if(currentHour < todayHours.open && currentHour >= todayHours.close){
                        isOpen = false;
                    }
                } else {
                    //Check if the court is closed for the selected time
                    if(currentHour < todayHours.open || currentHour >= todayHours.close){
                        isOpen = false;
                    }
                }

                //If the court is closed, show next day schedule
                if(!isOpen){
                    currentHour = hours[todayDate.day()+1].open+3;
                }

                availability.date = todayDate;
                availability.courts = [];
                availability.times = [];
                for(var iTime = currentHour-3; iTime < currentHour+3; iTime++){
                    availability.times.push(moment().hour(iTime).format('hA'));
                    for(var courtNo = 0; courtNo < $scope.selectedLocation.courtCount; courtNo++){
                        if(!$.isArray(availability.courts[courtNo])){
                            availability.courts[courtNo] = [];
                        }
                        availability.courts[courtNo].push({
                            isAvailable: true,
                            price: 20
                        });
                    }
                }

                $scope.schedule = availability;
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
