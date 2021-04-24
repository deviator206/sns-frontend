angular.module('salesApp.services.Util', ['ui.bootstrap'])
.service('Util', ['$http', '$uibModal', function ($http, $modal) {
    this.jsDateConversionFunction = function (now,needTime) {
      var year = "" + now.getFullYear();
      var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
      var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
      var hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
      var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
      var second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
      if (needTime) {
    	  return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
      } else if (hour === '00' && minute === '00' && second === '00') {
    	  return year + "-" + month + "-" + day;
      }
      
      
      return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  };
  
    this.toDecimalPrecision = function(amount, decimalPosition){
        if(decimalPosition == undefined || isNaN(decimalPosition)){
            decimalPosition = 2;
        }
        if(amount){
            amount = parseFloat(amount,10);
            amount = amount.toFixed(decimalPosition);
            amount = parseFloat(amount,10);
        }
        return amount;
    };
    
    this.getTaxValue = function(taxType, taxTypes){
            var taxValue = 0;
            for(var k in taxTypes){
                if(taxTypes[k].name == taxType){
                      taxValue = taxTypes[k].value;
                }
            }
        return taxValue;
    };
    
    this.openBasicPopUp = function($scope, page ,size) {
        var modalInstance;
        var modalScope = $scope.$new();
        var printPageTemplate = this.getPrintPage(page);
        
        modalScope.ok = function () {
                modalInstance.close(modalScope.selected);
        };
        modalScope.cancel = function () {
                modalInstance.dismiss('cancel');
        };      
        
        modalInstance = $modal.open({
          template: '<print-modal-directive page="'+printPageTemplate+'"></print-modal-directive>',
          size: size || 'lg',
          scope: modalScope
          }
        );

        modalInstance.result.then(function (selectedItem) {
          //$scope.selected = selectedItem;
        }, function (a,b,c) {
          //$log.info('Modal dismissed at: ' + new Date());
           // window.location.reload();
        });
  };

    this.openPrintPopUp = function($scope, page ,size) {
        var modalInstance;
        var modalScope = $scope.$new();
        var printPageTemplate = this.getPrintPage(page);
        
        modalScope.ok = function () {
                modalInstance.close(modalScope.selected);
        };
        modalScope.cancel = function () {
                modalInstance.dismiss('cancel');
        };      
        
        modalInstance = $modal.open({
          template: '<print-modal-directive page="'+printPageTemplate+'"></print-modal-directive>',
          size: size || 'lg',
          scope: modalScope,
          backdrop:'static', keyboard:false
          }
        );

        modalInstance.result.then(function (selectedItem) {
          //$scope.selected = selectedItem;
        }, function (a,b,c) {
        	//$log.info('Modal dismissed at: ' + new Date());
          	//window.location.reload();
        });
  };

    this.getPrintPage = function(pageType){
        var printPageTemplate = 'components/modal/nothingSelected.html';
        var pageTypeTemplateMapping = { 
        								'service-drop-maybe':'components/modal/serviceDrop_status.html',
        								'service-drop':'components/modal/serviceDrop.html',
                                        'service-drop': 'components/modal/serviceDrop.html',
                                        'service-deliver': 'components/modal/serviceDelivery.html',
                                        'sales-complete': 'components/modal/salesComplete.html',
                                        'service-complete': 'components/modal/serviceDelivery.html',
                                        'tech-update': 'components/modal/techUpdate.html',	
                                        'sales-re-print': 'components/modal/salesReprint.html',
        };
        
        if(pageTypeTemplateMapping[pageType] !== undefined){
            printPageTemplate = pageTypeTemplateMapping[pageType];
        }
        return printPageTemplate;
    }

    this.printPage = function(){
        var printContents = document.getElementById("invoice-modal-full-123").innerHTML;
        var popupWin = window.open("print.html", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=200,width=400,height=400");    
        if(popupWin){
            popupWin.window.onload = function() {
                popupWin.document.getElementById("masterContent").innerHTML = printContents;
                popupWin.window.print();
                setTimeout(function () { popupWin.close(); }, 100);
            };
        }else{
            alert("Plese disable your pop-up blocker.. for this domain");
        }
    }
    
    this.paymentInfoObj = function(){
        return {
          paymentType: "cash",
          paymentTypes: [{name: "Cash", value: "cash"}, {name: "Card Pyment", value: "card"},
                        {name: "Cheque", value: "cheq"}, {name: "Online", value: "online"}],
          cardTypes:["RuPay", "VISA", "MaeterCard", "American Express", "Chase", "Discover"],
          cash:     {amount:0},
          card:     {amount:0, bankName:'', cardNumber:'', expDate:'', cardNetwork:'', cardBank:''},
          cheq:     {amount:0, bankName:'', cheqNo:'', cheqDate:''},
          online:   {amount:0, payMode:'', transactionId:'', remark:''}
        }
    }
}   
])

