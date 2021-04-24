'use strict';
angular.module('salesApp.customerSelection.customer-selection-directive', [])
.directive('customerSelection', [function() {
  var controllerName = 'customerSelectionCtrl';
  return {
      templateUrl: 'components/customer-selection/customer-selection-directive.html',
      require: '?ngModel',
      scope: true,
      replace:true,
      controller: function($scope) {
          $scope.testAlert = function(){
              alert(1123);
          }
      },
      controllerAs: controllerName
  }
}]);
