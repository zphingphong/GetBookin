/**
 * Created by ZoM on 20/02/27.
 */

window.getBookinNgApp.directive('glogin', function(){
    return {
        restrict: 'AE',
        template: '<button class="btn btn-default navbar-btn" ng-click="gLogin()"><i class="fa fa-google-plus"></i></button>',
        link: function(scope, element, attrs){
        },
        controller: function($rootScope, $scope, $http, $cookies, $window){
            $scope.gLogin = function(){
                gapi.auth.signIn({
                    'callback': function(authResult){
                        if (authResult.status.signed_in == true) {
                            gapi.client.load('plus','v1', function(){
                                var request = gapi.client.plus.people.get({
                                    'userId': 'me'
                                });
                                request.execute(function(response) {
                                    console.log(response);
//                                    $http.post('/user', {
//                                        name: response.name,
//                                        email: response.email,
//                                        facebookId: response.id,
//                                        accountType: 'user'
//                                    }).success(function(response) {
//                                        if(response.success){
//                                            console.log($cookies.user);
//                                            if(response.user.accountType == 'user'){
//                                                $rootScope.$emit('userLoggedIn', {
//                                                    user: response.user
//                                                });
//                                            } else if(response.user.accountType == 'admin'){
//                                                $window.location.href = '/pages/adminSchedule';
//                                            }
//                                        }
//                                    });
                                });
                            });
                        } else {
                            //user hit cancel button
                            console.log('User cancelled login or did not fully authorize.');
                        }
                    }
                });
            }
        }
    }
});

