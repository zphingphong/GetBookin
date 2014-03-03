/**
 * Created by ZoM on 03/12/13.
 */

window.getBookinNgApp.controller('TimeCourtSelectionCtrl', function ($rootScope, $scope, $cookies) {
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
    });

    $scope.showAvailibility = function(){
        $scope.refreshSchedule();
    };

    $scope.bookSelectedCourts = function(){
        $rootScope.$emit('courtSelected');
    };
});

