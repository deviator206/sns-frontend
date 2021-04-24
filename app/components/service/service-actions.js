angular.module('salesApp.services.repairService', [])
.service('customerService', ['$http',function ($http) {
  this.dropProduct = function (request) {
       return $http({
          //method: 'GET',
    	   method: 'POST',
         // url: 'fixture/service-drop.json',
          url: 'rest/repair/drop-from-customer',
          data: request,
          headers: { 'Content-Type': 'application/json' }
       });
  };
  this.fetchServiceItemsFroDelivery = function (requestParams) {
       return $http({
          method: 'GET',
          url: 'rest/repair/deliver-to-customer',
         // url: 'fixture/service-items-delivery.json',
          params: requestParams,
          headers: { 'Content-Type': 'application/json' }
       });
  };
  this.deliverProduct = function (requestParams) {
       return $http({
          method: 'POST',
          url: 'rest/repair/deliver-to-customer-final',
          //url: 'fixture/items-delivery.json',
          data: requestParams,
          headers: { 'Content-Type': 'application/json' }
       });
  };
}   
])
