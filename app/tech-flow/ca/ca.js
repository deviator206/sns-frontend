'use strict';

angular.module('salesApp.customerApproval', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/customer-approval-jobs', {
    templateUrl: 'tech-flow/ca/ca.html',
    controller: 'CustomerApprovalJobsController'
  });
}])

.controller('CustomerApprovalJobsController', ['$scope', '$http', '$uibModal', '$log','Util' ,function($scope, $http, $modal, $log,Util) {

	   $scope.searchTextModel = "";
	    $scope.searchFilterOptions = [ "SERVICE_ID","SERIAL_NUMBER", "PRODUCT_NAME","CUSTOMER_PHONE", "CUSTOMER_NAME"];
	    $scope.pageStatus ="CA";

	    $scope.itemStatusListMap = ["NOT STARTED", "TECHNICIAN HANDLE","COMPLETE","PART PENDING","CUSTOMER APPROVAL"];
	    $scope.backendItemStatusMap= {
	        "IN PROGRESS" :"IP",
	        "NOT STARTED" :"NS",
	        "TECHNICIAN HANDLE":"TH",
	        "COMPLETE" : "C",
	        "CUSTOMER APPROVAL": "CA",
	        "PART PENDING" :"PP",
	        "CANNOT BE REPAIRED" :"CBR"
	    }

	    $scope.selectedItemStatusListMapModel ="";


	    $scope.selectedSearchFilterOptionsModel ="";
	    $scope.serviceStatusMapping ={
	        "IP":"In Progress",
	        "TNS":"Technician Not Started",
	        "PP":"Part Pending",
	        "CBR":"Cannot be repaired",
	        "C":"Complete"
	    }

	    $scope.init  = function(){
	        $scope.searchTextModel = "*";
	        $scope.selectedSearchFilterOptionsModel = $scope.searchFilterOptions[0];
	        $scope.selectedItemForUpdate = undefined;
	        $scope.selectedItemStatusListMapModel = $scope.itemStatusListMap[0];
	        $scope.searchTextAsPerFilterOption();
	    }

	    $scope.searchTextAsPerFilterOption = function(){
	        console.log($scope.searchTextModel+" ::: "+$scope.selectedSearchFilterOptionsModel);
	        var searchQueryObject={
	            "query":$scope.searchTextModel,
	            "col": $scope.selectedSearchFilterOptionsModel.replace(/\s+/g,''),
	            "status":"CA"
	        }
	        $http({
	                //method: "POST",
	                method: "GET",
	                url: 'rest/repair/tech-new-jobs?v='+(Math.random()),
	                  //url: 'service-pickup/searchOptionForService.json?v='+(Math.random()),
	                  params:searchQueryObject
	                }).then(function successCallback(response) {
	                    // this callback will be called asynchronously
	                    if (response.data.status) {
	                         $scope.actualServiceList =response.data.searchResults;
	                    }
	                    else {
	                        
	                         $scope.serviceSearchCriteriaIncomplete ="Error in searching.."
	                    }
	                    
	                    console.log(localStorage.getItem("userInfo"));
	                    // when the response is available
	                  }, function errorCallback(response) {
	                    // called asynchronously if an error occurs
	                    // or server returns response with an error status.
	                      $scope.errorInLogin = "true";
	                      $scope.errorInLoginMessage ="Error in Login. Please check the credentials"
	                  });

	    }

	    $scope.updateStatusClicked = function(row){
	        $scope.selectedItemForUpdate = row;
	        Util.openBasicPopUp($scope, 'tech-update');
	    } 
	    
	    
	    $scope.statusIsUpdated = function(){
	      var domList = document.getElementsByClassName("my-product-info")
	      var techCommentDom = document.getElementById("techCommentsIDModal")  ;
	      var updatedStatusList=[];
	      for(var i=0;i<domList.length;i++){
	    	  if($scope.pageStatus !==$scope.backendItemStatusMap[(domList[i].value).toUpperCase()]){
	    		  updatedStatusList.push({
	    	            'serviceNumber':$scope.selectedItemForUpdate.serviceNumber,
	    	            'itemId':domList[i].getAttribute('my-data'),
	    	            'status':$scope.backendItemStatusMap[(domList[i].value).toUpperCase()],
	    	            "techComment":techCommentDom.value,
	    	            "currentStatus":$scope.pageStatus
	    	        });
	    	  }
	      }

	      if (updatedStatusList.length > 0){
	            var searchQueryObject = {
	            "updatedProductList":updatedStatusList
	             }
	               $http({
	                method: "POST",
	                url: 'rest/repair/tech-job-status-update?v='+(Math.random()),
	                  //url: 'service-pickup/searchOptionForService.json?v='+(Math.random()),
	                  data:searchQueryObject
	                }).then(function successCallback(response) {
	                    if (response.data.status) {
	                        window.location.reload();
	                    }   
	                    else {
	                        alert("Error in Updating STATUS")
	                    }
	                    // when the response is available
	                  }, function errorCallback(response) {
	                    // called asynchronously if an error occurs
	                    // or server returns response with an error status.
	                    alert("Error In Updating the STATUS")
	                  });
	        }
	    } 

	    $scope.clearSearchCriteria = function(){
	        
	    }

	}]);