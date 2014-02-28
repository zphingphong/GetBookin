/**
 * Created by ZoM on 20/02/27.
 */

window.getBookinNgApp.directive('glogin', function(){
    return {
        restrict: 'AE',
        template: '<button class="btn btn-default navbar-btn" ng-click="login()"><i class="fa fa-google-plus"></i></button>',
        link: function(scope, element, attrs){
        },
        controller: function($rootScope, $scope, $http, $cookies, $window){
            $scope.login = function(){
            }
        }
    }
});

