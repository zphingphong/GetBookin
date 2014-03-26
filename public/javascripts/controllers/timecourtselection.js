/**
 * Created by ZoM on 03/12/13.
 */

window.getBookinNgApp.controller('TimeCourtSelectionCtrl', function ($rootScope, $scope) {
    $scope.selectedTimeCourt = [];
    $scope.repeatBooking = false;
    $scope.endAfter = 5;
    $scope.repeatType = 'weekly';
    $(function() {
        var dateInputContainer = $('#time-court-selection-date-input');
        var timeInputContainer = $('#time-court-selection-time-input');
        var dateInput = dateInputContainer.find('input');
        var timeInput = timeInputContainer.find('input');
        $scope.currentDate = moment(dateInput.val(), 'YYYY-MM-DD').format('dddd, MMMM Do YYYY');
        $scope.currentTime = timeInput.val();
        $scope.locationName = ($rootScope.locations && $rootScope.locations[0]) ? $rootScope.locations[0].name : '';
        $rootScope.$on('locationSelected', function(event, args){
            $scope.locationName = args.location.name;
            var timeCourtSelectionContainer = $('#time-court-selection-container');
            timeCourtSelectionContainer.show();
            $("html, body").animate({
                scrollTop: timeCourtSelectionContainer[0].offsetTop
            });
        });

        dateInputContainer.on('change.bfhdatepicker', function(event){
            $scope.currentDate = moment(dateInput.val(), 'YYYY-MM-DD').format('dddd, MMMM Do YYYY');
            $scope.$apply();
        });

        timeInputContainer.on('change.bfhtimepicker', function(event){
            $scope.currentTime = timeInput.val();
            $scope.$apply();
        });

        var repeatTypeInput = $('#booking-repeat-type-input');
        repeatTypeInput.on('change.bfhselectbox', function(event){
            $scope.repeatType = repeatTypeInput.val();
        });

        var endsAfterInput = $('#booking-repeat-ends-after-input');
        endsAfterInput.on('change', function(event){
            $scope.endAfter = endsAfterInput.val();
        });
    });

    $rootScope.$on('bookingStored', function(event){
        if($scope.isAdmin){
            $scope.repeatBooking = false;
        }
    });

    $scope.showAvailibility = function(){
        $scope.refreshSchedule();
    };

    $scope.bookSelectedCourts = function(){
        $rootScope.$emit('courtSelected');
    };

    $scope.repeatSelectedBooking = function(){
        $scope.repeatBooking = {
            type: $scope.repeatType,
            end: {
                after: $scope.endAfter
            }
        }

        if(!$scope.originalSelectedTimeCourt){
            $scope.originalSelectedTimeCourt = angular.copy($scope.selectedTimeCourt);
        } else { // Set the court selection back to original in order to repeat correctly
            $scope.selectedTimeCourt = angular.copy($scope.originalSelectedTimeCourt);
        }

        var addType;
        switch($scope.repeatType) {
            case 'daily':
                addType = 'd';
                break;
            case 'weekly':
                addType = 'w';
                break;
            case 'monthly':
                addType = 'M';
                break;
        }

        $.each($scope.selectedTimeCourt, function(index, selection){
            var dateTimeObj = moment(selection.dateTime, window.dateTimeClientFormat)
            for(var i = 1; i < $scope.endAfter; i++){
                $scope.selectedTimeCourt.push({
                    courtNo: selection.courtNo,
                    dateTime: dateTimeObj.add(addType, 1).format(window.dateTimeClientFormat),
                    location: selection.location,
                    price: selection.price
                });
            }
        });

        console.log($scope.selectedTimeCourt);
        sessionStorage.selectedTimeCourt = JSON.stringify($scope.selectedTimeCourt);
    };
});

