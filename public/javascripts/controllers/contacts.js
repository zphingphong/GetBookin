/**
 * Created by ZoM on 03/12/13.
 */

window.getBookinNgApp.controller('ContactsCtrl', function ($scope, $http) {
    //Retrieve user information from session storage
    if(sessionStorage.contactInfo){
        var contactInfo = JSON.parse(sessionStorage.contactInfo);
        $scope.name = contactInfo.contactName;
        $scope.phoneNo = contactInfo.contactNo;
    }

    $scope.$on('selectedCourtsBroadcast', function(event, args){
        var contactsContainer = $('#contacts-container');
        contactsContainer.show();
        $("html, body").animate({
            scrollTop: contactsContainer[0].offsetTop
        });
    });

    $scope.saveContactInfoAndViewSummary = function(){
        sessionStorage.contactInfo = JSON.stringify({
            contactName: $scope.name,
            contactNo: $scope.phoneNo
        });
        $scope.$emit('filledContactsEmit');
    }


});

