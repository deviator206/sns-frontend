//TechJobsSearchService
angular.module('salesApp.services.TechJobsSearchService', [])
.service('TechJobsSearchService', ['$http',function ($http) {
  this.search = function (paramObj) {
       return $http({
          method: 'GET',
          url: 'fixture/new-job.json',
          params: paramObj,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
       });
  }   
}   
])
