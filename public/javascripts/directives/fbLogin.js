/**
 * Created by ZoM on 20/02/14.
 */

window.getBookinNgApp.directive('fblogin', function($timeout){
    return {
        restrict: 'AE',
        template: '<button class="btn btn-default navbar-btn" ng-click="login()"><i class="fa fa-facebook"></i></button>',
        link: function(scope, element, attrs){
        },
        controller: function($scope){
            $scope.login = function(){
                FB.login(function(response) {
                    if (response.authResponse) {
                        access_token = response.authResponse.accessToken; //get access token
                        user_id = response.authResponse.userID; //get FB UID

                        FB.api('/me', function(response) {
                            $http.post('/user', {
                                name: response.name,
                                phoneNo: null,
                                email: response.email,
                                facebookId: response.id,
                                googleId: null,
                                accountType: 'user'
                            }).success(function(response) {
                                if(response.success){
                                    response.accountType;
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

