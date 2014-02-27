/**
 * Created by ZoM on 03/12/13.
 */

window.getBookinNgApp.controller('SummaryCtrl', function ($rootScope, $scope, $http, $window) {
    if($rootScope.user && $rootScope.user.accountType == 'admin' && $window.location.pathname == '/pages/adminSchedule'){
        $scope.isAdmin = true;
    } else {
        $scope.isAdmin = false;
    }

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
        var paid = $scope.paid ? 'full' : 'none';

        $http.post('/booking', {
            selectedTimeCourt: JSON.parse(sessionStorage.selectedTimeCourt),
            contactInfo: JSON.parse(sessionStorage.contactInfo),
            paid: paid
        }).success(function(status){
            if(status.success){
                // Clear selected courts
                sessionStorage.selectedTimeCourt = JSON.stringify([]);

                // Go to the top and refresh the schedule
                if(!$scope.isAdmin){
                    var timeCourtSelectionContainer = $('#time-court-selection-container');
                    timeCourtSelectionContainer.hide();
                }
                var contactsContainer = $('#contacts-container');
                contactsContainer.hide();
                var summaryContainer = $('#summary-container');
                summaryContainer.hide();
                $("html, body").animate({
                    scrollTop: 0
                });

                $rootScope.$emit('bookingStored');
            }
        });
    };
});

