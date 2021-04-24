angular.module('salesApp.services.tax', [])
.service('taxService', ['$http',function ($http) {
  this.getTaxListSales = function () {
      return [
        {name: "VAT-1", value: "13.5"},
        {name: "VAT-2", value: "5.5"},
        {name: "VAT-3", value: "8.5"},
        {name: "Service Tax", value: "13.5"},
        {name: "NONE", value: "0"}
    ];
  };
  this.getTaxListService = function () {
      return [
        {name: "VAT-1", value: "13.5"},
        {name: "VAT-2", value: "5.5"},
        {name: "VAT-3", value: "8.5"},
        {name: "Service Tax", value: "13.5"},
        {name: "NONE", value: "0"}
    ];
  };  
}   
])

