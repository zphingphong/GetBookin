/**
 * Created by ZoM on 20/03/03.
 */

window.getBookinNgApp.directive('logoutbtn', function(){
    return {
        restrict: 'AE',
        template: '<button class="btn btn-default navbar-btn" ng-click="logout()"><i class="fa fa-power-off"></i> Sign Out</button>',
        link: function(scope, element, attrs){
        },
        controller: function($rootScope, $scope, $cookies, $window){
            $scope.logout = function(){
                delete $cookies['user'];
                if($rootScope.user.facebookId){ // Sign out from Facebook
                    FB.logout(function(){
                        if($rootScope.user.accountType == 'admin'){
                            delete $cookies['location'];
                            $window.location.href = '/';
                        }
                        $rootScope.user = null;
                    });
                } else if($rootScope.user.googleId) {// Sign out from Google
                    gapi.auth.signOut();
                    if($rootScope.user.accountType == 'admin'){
                        delete $cookies['location'];
                        $window.location.href = '/';
                    }
                    $rootScope.user = null;
                }
            }
        }
    }
});

