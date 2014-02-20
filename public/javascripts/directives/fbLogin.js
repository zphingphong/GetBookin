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
            window.fbAsyncInit = function() {
                FB.init({
                    appId      : '640875779319763',
                    status     : true, // check login status
                    cookie     : true, // enable cookies to allow the server to access the session
                    xfbml      : true  // parse XFBML
                });
            };
            $scope.login = function(){
                FB.login(function(response) {
                    if (response.authResponse) {
                        console.log('Welcome!  Fetching your information.... ');
                        console.log(response); // dump complete info
                        access_token = response.authResponse.accessToken; //get access token
                        user_id = response.authResponse.userID; //get FB UID

                        FB.api('/me', function(response) {
                            user_email = response.email; //get user email
                            // you can store this data into your database
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

