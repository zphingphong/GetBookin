/**
 * Created by ZoM on 03/03/14.
 */

window.getBookinNgApp.controller('ChangeBookingListCtrl', function ($rootScope, $scope, $http) {
    $scope.cancelBooking = function(){
        $http.get('/booking/cancel/' + $scope.bookingId).success(function(results) {
            if(results.success){
            } else {
                $rootScope.errorMsg = results.error;
                $('#error-msg-container').show();
            }
        });
    };

    $scope.changeBooking = function(){
        $http.get('/booking/change/' + $scope.bookingId).success(function(results) {
            if(results.success){
                $scope.oldBookings = results.booking;
                sessionStorage.oldBookings = JSON.stringify($scope.oldBookings);
                $rootScope.$emit('locationSelected', {
                    location: $scope.oldBookings[0].location
                });
            } else {
                $rootScope.errorMsg = results.error;
                $('#error-msg-container').show();
            }
        });
    };

});

