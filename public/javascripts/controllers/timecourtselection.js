/**
 * Created by ZoM on 03/12/13.
 */

window.getBookinNgApp.controller('TimeCourtSelectionCtrl', function ($scope, $http) {
    $(function() {
        var dateInputContainer = $('#time-court-selection-date-input');
        var timeInputContainer = $('#time-court-selection-time-input');
        var dateInput = dateInputContainer.find('input');
        var timeInput = timeInputContainer.find('input');
        $scope.currentDate = dateInput.val();
        $scope.currentTime = timeInput.val();

        dateInputContainer.on('change.bfhdatepicker', function(event){
            $scope.currentDate = dateInput.val();
            $scope.$apply();
        });

        timeInputContainer.on('change.bfhtimepicker', function(event){
            $scope.currentTime = timeInput.val();
            $scope.$apply();
        });
    });

    $scope.showAvailibility = function(){
    };

    $scope.$on('selectedLocationBroadcast', function(event, args){
        var timeCourtSelectionContainer = $('#time-court-selection-container');
        timeCourtSelectionContainer.show();
        $("html, body").animate({
            scrollTop: $('#time-court-selection-container')[0].offsetTop
        });
    });
});

