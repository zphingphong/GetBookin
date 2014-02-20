/**
 * Created by ZoM on 03/12/13.
 */

window.getBookinNgApp.controller('LocationCtrl', function ($rootScope, $scope, $http) {
    window.locationMapObj = new Map();

    $http.get('/location').success(function(locations) {
        $scope.locations = locations;
        var mapCenterLocation = [49.19058, -123.10936]; //Hard-coded to a location in Vancouver, BC, Canada
        $scope.initializeMap(mapCenterLocation);
//        if(locations){
//            mapCenterLocation = [locations[0].geolocation.latitude, locations[0].geolocation.longitude];
//        }
//
//        if(navigator.geolocation) {
//            navigator.geolocation.getCurrentPosition($scope.initializeMap, function(error){
//                $scope.initializeMap(mapCenterLocation);
//            });
//        }
//
////        Wait 30 seconds and check if the map loaded, if not try loading it again. This is possible when a user is
////        using Firefox, and reply "Not Now" when the browser ask for their permission to get current location.
//        setTimeout(function () {
//            if(!window.locationMapObj.mapLoaded){
//                $scope.initializeMap(mapCenterLocation);
//            }
//        }, 30000);

        //Check to see if the location is selected in the db. If it is, select it.
        if(sessionStorage.selectedTimeCourt){
            var selectedTimeCourts = JSON.parse(sessionStorage.selectedTimeCourt);
            if(selectedTimeCourts.length > 0){
                $.each($scope.locations, function(index, selectedLocation){
                    if(selectedLocation._id == selectedTimeCourts[0].location){
                        selectedLocation.selected = true;
                        $rootScope.$emit('locationSelected', {
                            location: selectedLocation
                        });
                        return false;
                    }
                });
//            $('#location-selection-' + selectedLocation.id).collapse('show');
            }
        }

    });

    $scope.initializeMap = function(center){
        var centerLocation = center;
        if(center.coords){
            centerLocation = [center.coords.latitude, center.coords.longitude]
        }
        var mapConfig = {
            center: centerLocation,
            locations: $scope.locations,
            mapPlaceholderId:'location-map'
        };
        window.locationMapObj.initialize(mapConfig);
    };

    $scope.selectLocation = function(locationId){
        //Remove all bookings from session storage
        if(sessionStorage.selectedTimeCourt){
            sessionStorage.selectedTimeCourt = JSON.stringify([]);
        }

        //Search array and return the first item of the result
        var location = $.grep($scope.locations, function(location){
            return location.id == locationId;
        })[0];
        $rootScope.$emit('locationSelected', {
            location: location
        });
    };

});

