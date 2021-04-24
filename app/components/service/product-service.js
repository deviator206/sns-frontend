angular.module('salesApp.services.products', [])
.service('productSearch', ['$http',function ($http) {
  this.search = function () {
       return $http({
          method: 'GET',
          url: 'fixture/item-list.json',
          params: { filterData: 'Test' },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
       });
  }   
}   
])

