'use strict';
angular.module('salesApp.status', ['ngRoute' , 'smart-table', 'ui.bootstrap'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/status', {
    templateUrl: 'tech-flow/status/tech-status.html',
    controller: 'TechnicianStatusCtrl'
  });
}])
.controller('TechnicianStatusCtrl', ['$scope', '$http', '$uibModal', '$log','Util' ,function($scope, $http, $modal, $log,Util) {
  
	 $scope.backendItemStatusMap= {
		        "IN PROGRESS" :"IP",
		        "NOT STARTED" :"NS",
		        "TECHNICIAN HANDLE":"TH",
		        "COMPLETE" : "C",
		        "CUSTOMER APPROVAL": "CA",
		        "PART PENDING" :"PP",
		        "CANNOT BE REPAIRED" :"CBR"
		    }
	 $scope.uiToBackendMap= {
		        "IP":"IN PROGRESS",
		        "NS":"NOT STARTED" ,
		        "TH":"TECHNICIAN HANDLE",
		        "C":"COMPLETE" ,
		         "CA":"CUSTOMER APPROVAL",
		        "PP":"PART PENDING" ,
		        "CBR":"CANNOT BE REPAIRED",
		        "DTC":"DELIVERED TO CUSTOMER"
		    }
  $scope.init = function(){
    $scope.resetModel();
  }
  $scope.resetModel = function(){
    $scope.statusSearchTextModel = "";
    $scope.itemSelectionError ="";
    $scope.currentJobStatusList=[];
    $scope.statusSearchFilterOptions = [ "CUSTOMER_NAME","CUSTOMER_PHONE", "SERVICE_ID","SERIAL_NUMBER", "PRODUCT_NAME"];
	//$scope.statusSearchFilterOptions =  [ "ALL","SERVICE_ID","SERIAL_NUMBER", "PRODUCT_NAME","CUSTOMER_PHONE", "CUSTOMER_NAME"];
    $scope.statusSelectedSearchFilterOptionsModel  =$scope.statusSearchFilterOptions[0];


  }

  $scope.statusSearchTextAsPerFilterOption = function(){

	  
     // $http.get('fixture/searchForStatus.json?v='+(Math.random()),{
	  $http.get('rest/repair/pickup-by-customer?v='+(Math.random()),{
          params: {
        	query: $scope.statusSearchTextModel,
        	col: $scope.statusSelectedSearchFilterOptionsModel
          }
        }).then(function(response){
            $scope.currentJobStatusList = response.data.searchResults;
        });

  }
}]);
