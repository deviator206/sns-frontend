angular.module('salesApp.services.customers', [])
.service('customerSearch', ['$http',function ($http) {
  this.search = function () {
       return $http({
          method: 'GET',
          url: 'fixture/customer.json',
          params: { filterData: 'Test' },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
       });
  }   
}   
])
.factory('customerSearchFactory', function($http) {
  var customerSearchService = {
    async: function() {
      // $http returns a promise, which has a then function, which also returns a promise
      var promise = $http.get('fixture/customer.json').then(function (response) {
        // The then function here is an opportunity to modify the response
        console.log(response);
        // The return value gets picked up by the then in the controller.
        return response.data;
      });
      // Return the promise to the controller
      return promise;
    }
  };
  return customerSearchService;
});
