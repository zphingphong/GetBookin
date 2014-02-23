/**
 * Created by ZoM on 03/12/13.
 */

window.getBookinNgApp.controller('ContactsCtrl', function ($rootScope, $scope) {
    //Retrieve user information from session storage
    if(sessionStorage.contactInfo){
        var contactInfo = JSON.parse(sessionStorage.contactInfo);
        $scope.name = contactInfo.contactName;
        $scope.phoneNo = contactInfo.contactNo;
//        $rootScope.$emit('contactsFilled'); //TODO: Fix this. It doesn't work, since it happens before summary controller get initialized (I think).
    }

    $rootScope.$on('courtSelected', function(event, args){
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
        $rootScope.$emit('contactsFilled');
    }


});

