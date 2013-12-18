/**
 * Created by ZoM on 08/12/13.
 */

window.getBookinNgApp.directive('courtImageSlider', function($timeout){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            if($(element).siblings('.court-image-link').length+1 == scope.$parent.location.images.length){
                $timeout(function(){
                    var parent = $(element).parent();
                    parent.children('.court-image-link').fancybox();
//                    parent.carouFredSel({
//                        auto: false,
//                        width: '100%',
//                        mousewheel: true,
//                        swipe: {
//                            onMouse: true,
//                            onTouch: true
//                        }
//                    });
                });
            }
        }
    }
});

