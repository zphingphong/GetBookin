/**
 * Created by ZoM on 04/12/13.
 */
window.getBookinNgApp = angular.module('getBookin', ['ngCookies']);

/******************************** [START] Events ***********************************/
window.getBookinNgApp.run(function($rootScope) {
});
/******************************** [END] Events ***********************************/

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

/******************************** [START] Facebook setup ***********************************/
$(document).ready(function() {
    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/all.js', function(){
        FB.init({
            appId       : '640875779319763',
            status      : true, // check login status
            cookie      : true, // enable cookies to allow the server to access the session
            xfbml       : true  // parse XFBML
        });
    });
});
/******************************** [END] Facebook setup ***********************************/


