/**
 * Created by ZoM on 03/12/13.
 */

window.getBookinNgApp.controller('SummaryCtrl', function ($scope, $http) {
    $scope.$on('filledContactsBroadcast', function(event, args){
        var summaryContainer = $('#summary-container');
        summaryContainer.show();
        $("html, body").animate({
            scrollTop: summaryContainer[0].offsetTop
        });
    });

    $scope.saveContactInfoAndViewSummary = function(){
        sessionStorage.contactInfo = JSON.stringify({
            contactName: $scope.name,
            contactNo: $scope.phoneNo
        });
    }
});

