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
            //Calculate price
            $.each($scope.bookings, function(index, booking){
                $scope.grandTotal += booking.price;
            });
        }
    });

    $rootScope.$on('locationSelected', function(event, args){
        $scope.locationName = args.location.name;
        $scope.location = args.location;
    });

    $scope.confirmBooking = function(){
        var paid = $scope.paid ? 'full' : 'none';

        var contactInfo = JSON.parse(sessionStorage.contactInfo);
        // Generate booking id
        var bookingId = $scope.location.id + contactInfo.contactName.charAt(0) + moment().valueOf();

        $http.post('/booking', {
            bookingId: bookingId,
            selectedTimeCourt: JSON.parse(sessionStorage.selectedTimeCourt),
            contactInfo: contactInfo,
            payment: {
                paid: paid,
                method: 'Visa',
                dollar: 0
            }
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

