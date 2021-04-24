'use strict';

// Declare app level module which depends on views, and components
angular.module('salesApp', [
  'ngRoute',
  'salesApp.tech',
  'salesApp.status',
  'salesApp.completed',
  'salesApp.partPending',
  'salesApp.customerApproval',
  'salesApp.technicianHandle',
  'salesApp.version',
  'salesApp.date',
  'salesApp.modal',
  'salesApp.services.Util',
  'salesApp.services.TechJobsSearchService',
  'ui.bootstrap',
  'smart-table'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider.otherwise({redirectTo: '/status'});
}]);
