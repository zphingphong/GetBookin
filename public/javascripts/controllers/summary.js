/**
 * Created by ZoM on 03/12/13.
 */

window.getBookinNgApp.controller('SummaryCtrl', function ($scope, $http) {
    $scope.$on('filledContactsBroadcast', function(event, args){
        var summaryContainer = $('#summary-container');
        summaryContainer.show();
        $("html, body").animate({
            scrollTop: summaryContainer[0].offsetTop
        });

        if(sessionStorage.selectedTimeCourt){
            $scope.bookings = JSON.parse(sessionStorage.selectedTimeCourt);
            $scope.grandTotal = 0;
            $.each($scope.bookings, function(index, booking){
                $scope.grandTotal += booking.price;
            });
        }
    });

    $scope.$on('selectedLocationBroadcast', function(event, args){
        $scope.locationName = args.location.name;
    });
});

