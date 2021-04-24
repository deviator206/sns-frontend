'use strict';

angular.module('salesApp.completed', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/completed', {
    templateUrl: 'tech-flow/completed.html',
    controller: 'CompletedCtrl'
  });
}])

.controller('CompletedCtrl', [function() {
		
}]);