/**
 * Created by ZoM on 03/12/13.
 */

window.getBookinNgApp.controller('SummaryCtrl', function ($rootScope, $scope, $http) {
    $rootScope.$on('contactsFilled', function(event, args){
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

    $scope.confirmBooking = function(){
        $http.post('/booking', {
            selectedTimeCourt: JSON.parse(sessionStorage.selectedTimeCourt),
            contactInfo: JSON.parse(sessionStorage.contactInfo),
            paid: 'full'
        }).success(function(status){
            if(status.success){
                sessionStorage.selectedTimeCourt = JSON.stringify([]);
            }
        });
    };
});

