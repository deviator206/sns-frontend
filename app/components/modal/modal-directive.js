'use strict';
angular.module('salesApp.modal.print-modal-directive', ['ui.bootstrap'])
.directive('printModalDirective', function() {
	return {
        restrict: 'E',
        backdrop: "static",
        keyboard: false,
        templateUrl:function(elem, attr) {return attr.page;},
        controller: function ($scope) {     
            console.log($scope);
        }
    };
});



