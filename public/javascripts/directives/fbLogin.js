/**
 * Created by ZoM on 20/02/14.
 */

window.getBookinNgApp.directive('fblogin', function(){
    return {
        restrict: 'AE',
        template: '<button class="btn btn-default navbar-btn" ng-click="fbLogin()"><i class="fa fa-facebook"></i></button>',
        link: function(scope, element, attrs){
        },
        controller: function($rootScope, $scope, $http, $cookies, $window){
            $scope.fbLogin = function(){
//                $http.post('/user', {
//                    email: 'zphing_phong@hotmail.com',
//                    facebookId: '100000482444229'
//                }).success(function(response) {
//                    if(response.success){
//                        console.log($cookies.user);
//                        if(response.user.accountType == 'user'){
//                            $rootScope.$emit('userLoggedIn', {
//                                user: response.user
//                            });
//                        } else if(response.user.accountType == 'admin'){
//                            $window.location.href = '/pages/adminSchedule';
//                        }
//                    }
//                });

                FB.login(function(response) {
                    if (response.authResponse) {
                        FB.api('/me', function(response) {
                            $http.post('/user', {
                                name: response.name,
                                email: response.email,
                                facebookId: response.id,
                                accountType: 'user'
                            }).success(function(response) {
                                if(response.success){
                                    console.log($cookies.user);
                                    $rootScope.user = response.user;
                                    if(response.user.accountType == 'user'){
                                        $rootScope.$emit('userLoggedIn', {
                                            user: response.user
                                        });
                                    } else if(response.user.accountType == 'admin'){
                                        $window.location.href = '/pages/adminSchedule';
                                    }
                                }
                            });
                        });

                    } else {
                        //user hit cancel button
                        console.log('User cancelled login or did not fully authorize.');
                    }
                }, {
                    scope: 'publish_stream,email'
                });
            }
        }
    }
});

