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
        if($scope.isAdmin){
            $scope.location = $rootScope.locations[0];
        }
        var bookingId = $scope.location.id + contactInfo.contactName.charAt(0) + moment().valueOf();

        $http.post('/booking', {
            bookingId: bookingId,
            selectedTimeCourt: JSON.parse(sessionStorage.selectedTimeCourt),
            contactInfo: contactInfo,
            payment: {
                paid: paid,
                method: '',
                dollar: 0
            },
            isAdmin: $scope.isAdmin
        }).success(function(status){
            if(status.success){
                // Clear selected courts
                sessionStorage.selectedTimeCourt = JSON.stringify([]);

                if(status.paymentApprovalUrl){
                    $window.location.href = status.paymentApprovalUrl;
                }

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

    $scope.confirmChangeBooking = function(){
        var paid = $scope.paid ? 'full' : 'none';

        var contactInfo = JSON.parse(sessionStorage.contactInfo);
        // Generate booking id
        if($scope.isAdmin){
            $scope.location = $rootScope.locations[0];
        }
        var bookingId = $scope.location.id + contactInfo.contactName.charAt(0) + moment().valueOf();

        $http.post('/booking/change', {
            bookingId: bookingId,
            oldBooking: JSON.parse(sessionStorage.oldBookings),
            selectedTimeCourt: JSON.parse(sessionStorage.selectedTimeCourt),
            contactInfo: contactInfo,
            payment: {
                paid: paid,
                method: 'Visa',
                dollar: 0
            },
            isAdmin: $scope.isAdmin
        }).success(function(results){
            if(results.success){
                // Clear old booking and  selected courts
                sessionStorage.selectedTimeCourt = JSON.stringify([]);
                sessionStorage.removeItem('oldBookings');

                if(results.paymentApprovalUrl){
                    $window.location.href = results.paymentApprovalUrl;
                }

                var timeCourtSelectionContainer = $('#time-court-selection-container');
                timeCourtSelectionContainer.hide();
                var summaryContainer = $('#summary-container');
                summaryContainer.hide();
                $("html, body").animate({
                    scrollTop: 0
                });

                $rootScope.msg = results.msg;
                $('#msg-container').show();
                $rootScope.$emit('changeBookingConfirmed');
            } else {
                $rootScope.errorMsg = results.error;
                $('#error-msg-container').show();
            }
        });
    };

    $scope.removeSelectedBooking = function(courtNo, dateTime){
        var bookings = JSON.parse(sessionStorage.selectedTimeCourt);
        if(bookings.length > 1){
            $.each(bookings, function(index, booking){
                if(booking.courtNo == courtNo && booking.dateTime == dateTime){
                    bookings.splice(index, 1);
                    sessionStorage.selectedTimeCourt = JSON.stringify(bookings);
                    return false;
                }
            });
        } else {
            sessionStorage.selectedTimeCourt = JSON.stringify([]);
        }
        $rootScope.$emit('contactsFilled');
    }
});

