angular.module('salesApp.services.validation', [])
.service('Validation', ['$http',function ($http) {
    
    this.isAlphanumeric = function(inputtxt)  {  
        var letterNumber = /^[0-9a-zA-Z]+$/;  
        var isValid = false;
        if(inputtxt.value.match(letterNumber))   
        {  
            isValid = true;  
        }
        return isValid;    
    } 
    
    this.isNumeric = function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
    
    this.isNotEmptyStr = function (str) {
      var isValid = false;  
      if(typeof str === "string" && str.trim()){
          isValid = true;
      }
      return isValid;
    }
    
}   
]);

