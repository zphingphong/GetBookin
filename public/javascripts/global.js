/**
 * Created by ZoM on 04/12/13.
 */
window.getBookinNgApp = angular.module('getBookin', []);

window.getBookinNgApp.run(function($rootScope) {
    $rootScope.$on('selectedLocationEmit', function(event, args) {
        $rootScope.$broadcast('selectedLocationBroadcast', args);
    });

    $rootScope.$on('selectedCourtsEmit', function(event, args) {
        $rootScope.$broadcast('selectedCourtsBroadcast', args);
    });

    $rootScope.$on('filledContactsEmit', function(event, args) {
        $rootScope.$broadcast('filledContactsBroadcast', args);
    });
});

//window.getBookinNgApp.config(['$routeProvider', function($routeProvider) {
//    $routeProvider.
//        when('/', {
//            templateUrl: 'partials/location',
//            controller: 'LocationCtrl'
//        }).
//        otherwise({
//            redirectTo: '/'
//        });
//}]);

