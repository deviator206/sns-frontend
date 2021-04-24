'use strict';
angular.module('salesApp.sales', ['ngRoute' , 'smart-table', 'ui.bootstrap'])
.controller('SalesCtrl', ['$scope', '$http', '$uibModal', '$log', 'taxService', 'Util', function($scope, $http, $modal, $log, taxService, Util) {
    $scope.customerDetails = {
      "id": "",
      "name": "",
      "address": "",
      "phone": ""
    };
    $scope.receiptType = "Bill Of Supply";
    $scope.paymentInfo = Util.paymentInfoObj();
    
    $scope.date = new Date();
    $scope.dateValue = null;
    $scope.asyncSelected = '';
    $scope.salesDate = new Date();
    $scope.dateOptions = {};
    $scope.selectedProducts = [];
    $scope.salesResponseData = [];
    $scope.printPage = Util.printPage;
    $scope.taxTypes = [
        {name: "GST_0%", value: "0"},
        {name: "GST_5%", value: "5"},
        {name: "GST_12%", value: "12"},
        {name: "GST_18%", value: "18"},
        {name: "GST_28%", value: "28"}
    ];
    
    $scope.taxTypeTotal = {};
    
    $scope.salesDateFocus = function(event,a,b,c){
        console.log(event);
        console.log(a);
        console.log(b);
        console.log(c);
    }
    
    var setInitialValuforTotals = function(){
        return {
            taxAmmount:0,
            totalPrice:0,
            grandTotal:0,
            totalItems:0
        }
    };
    var getCurrentProductBlank = function(){
        return { orderDate:Util.jsDateConversionFunction($scope.salesDate), name: "",  model: "",  sn: "",  quantity: "", price: "", totalPrice:0, taxType:0, taxValue:0, taxAmmount:0, grandTotal:0 };
    };
    
    
    var calculateTotal = function(){
        var selProLen = $scope.selectedProducts.length;
        $scope.productTotal = setInitialValuforTotals();
        if(selProLen > 0){
            for(var i=0; i<selProLen; i++){
                $scope.productTotal.taxAmmount += Util.toDecimalPrecision($scope.selectedProducts[i].taxAmmount);
                $scope.productTotal.totalPrice += Util.toDecimalPrecision($scope.selectedProducts[i].totalPrice);
                $scope.productTotal.grandTotal += Util.toDecimalPrecision($scope.selectedProducts[i].grandTotal);
                $scope.productTotal.totalItems += Util.toDecimalPrecision($scope.selectedProducts[i].quantity);
            }
        }

        $scope.productTotal.taxAmmount = Util.toDecimalPrecision($scope.productTotal.taxAmmount, 2);
        $scope.productTotal.totalPrice = Util.toDecimalPrecision($scope.productTotal.totalPrice, 2);
        $scope.productTotal.grandTotal = Util.toDecimalPrecision($scope.productTotal.grandTotal, 2);
        $scope.productTotal.totalItems = Util.toDecimalPrecision($scope.productTotal.totalItems, 2);

        
        $scope.paymentInfo.cash.amount = $scope.productTotal.grandTotal;
        $scope.paymentInfo.cheq.amount = $scope.productTotal.grandTotal;
        $scope.paymentInfo.card.amount = $scope.productTotal.grandTotal;
        $scope.paymentInfo.online.amount = $scope.productTotal.grandTotal;
        
    };
    

    var setCurrentProductTax = function(taxType){
        $scope.curentProduct.taxType =  taxType;
        $scope.curentProduct.taxValue = parseFloat(Util.getTaxValue(taxType, $scope.taxTypes),10);
    };
    
    var salesAjaxCall = function(payload){
        $http({
            method : "POST",
           // url : 'fixture/sales.json?v='+(Math.random()),
            url: 'rest/invoice/sales?v='+(Math.random()),
            data : payload
        }).then(function mySuccess(response) {
            $scope.salesResponseData = response.data;
            if ($scope.salesResponseData.status){
            	$scope.open();
            }else {
            	alert("Error in Submission:Please contact Administrator")
            }
            
            
        }, function myError(response) {
            //$scope.myWelcome = response.statusText;
        });        
        
    };
    
    $scope.curentProduct = getCurrentProductBlank();

    $scope.productTotal = setInitialValuforTotals();

    $scope.customerList = function(val) {
        
       return $http.get('rest/customer/serach-customer',{
       // return $http.get('fixture/customer.json?text='+(Math.random()),{
          params: {
            text: val
          }
        }).then(function(response){
          return response.data.customerServiceResponseList.map(function(item){
             return item;
          });
        });
    };

    $scope.productList = function(val, type) {
        //return $http.get('fixture/item-list.json?v='+Math.random(), {
        return $http.get('rest/product/search-product',{
          params: {
            text: val,
            type: type
          }
        }).then(function(response){
             return response.data.singleProductModelList.map(function(item){
             return item;
          });
        });
    };
      
    $scope.selectCustomerFrmList = function(value){
        $scope.customerDetails.name = value.name || '';
        $scope.customerDetails.id = value.id || null;
        $scope.customerDetails.phone = value.phone || '';
        $scope.customerDetails.address = value.address || '';
        $scope.customerDetails.email = value.email || "";
        $scope.customerDetails.alternateNo = value.contact2 || "";
    }
    
    $scope.setFocusTo = function(formElementToFocus){
        document.salesForm[formElementToFocus].focus();
    }
    $scope.onProductName = function(formElementToFocus){
        if($scope.selectedProducts.length > 0 && $scope.curentProduct.name.trim() === ''){
            $scope.setProductContainerToPristine();
            $scope.setFocusTo('paymentInfoPaymentType');
        }else{
            $scope.setFocusTo(formElementToFocus);
        }
    }
    
    $scope.selectProductFrmList = function(value, type){
        $scope.curentProduct.id = value.id || "";
        $scope.curentProduct.name = value.name || '';
        $scope.curentProduct.model = value.model || '';
        $scope.curentProduct.sn = value.sn || '';
        $scope.curentProduct.price = parseFloat(value.price, 10) || 0;
        $scope.curentProduct.taxType = value.taxType || '';
        $scope.curentProduct.taxRate = parseFloat(value.taxRate, 10) || 0;
        $scope.curentProduct.quantity = 1;
        setCurrentProductTax($scope.curentProduct.taxType);
    };
    
    $scope.performSalesOperation = function(){
        var payInfoPayLoad = angular.copy($scope.paymentInfo[$scope.paymentInfo.paymentType]);
            payInfoPayLoad.type = $scope.paymentInfo.paymentType;
            $scope.dateValue = $scope.salesDate.toDateString();
            
            if(!payInfoPayLoad.hasOwnProperty("additional_cash")) {
            	payInfoPayLoad["additional_cash"] = 0;
            }
            
            if ($scope.paymentInfo.hasOwnProperty("additional_cash")  && $scope.paymentInfo["additional_cash"] !== "") {
            	payInfoPayLoad["additional_cash"] = parseFloat($scope.paymentInfo["additional_cash"]);
            }
        var payLoad = {
            paymentInfo:[payInfoPayLoad],
            customerInfo:angular.copy($scope.customerDetails),
            productInfo:angular.copy($scope.selectedProducts)
        };
        salesAjaxCall(payLoad);
    };

    $scope.onTaxChange = function(){
        setCurrentProductTax($scope.curentProduct.taxType);
    }

    $scope.calculateProductCosting = function()	{
    	$scope.curentProduct.quantity = parseInt($scope.curentProduct.quantity, 10);
        if(!isNaN($scope.curentProduct.quantity) && !isNaN($scope.curentProduct.price)){
        	$scope.curentProduct.grandTotal  = Util.toDecimalPrecision($scope.curentProduct.quantity * $scope.curentProduct.price);
        }
        if(!isNaN($scope.curentProduct.grandTotal) && !isNaN($scope.curentProduct.taxValue)){
            $scope.curentProduct.taxAmmount = Util.toDecimalPrecision(($scope.curentProduct.grandTotal * $scope.curentProduct.taxValue)/100);
        }
        if(!isNaN($scope.curentProduct.taxAmmount)){
        	$scope.curentProduct.totalPrice = Util.toDecimalPrecision($scope.curentProduct.grandTotal - $scope.curentProduct.taxAmmount);
        }
    }
    
    $scope.addProduct = function($event){
        $scope.curentProduct.quantity = parseInt($scope.curentProduct.quantity, 10);
        if(!isNaN($scope.curentProduct.quantity) && !isNaN($scope.curentProduct.price)){
            $scope.curentProduct.totalPrice = Util.toDecimalPrecision($scope.curentProduct.quantity * $scope.curentProduct.price);
        }
        if(!isNaN($scope.curentProduct.totalPrice) && !isNaN($scope.curentProduct.taxValue)){
            $scope.curentProduct.taxAmmount = Util.toDecimalPrecision(($scope.curentProduct.totalPrice * $scope.curentProduct.taxValue)/100);
        }
        if(!isNaN($scope.curentProduct.taxAmmount)){
            $scope.curentProduct.grandTotal = Util.toDecimalPrecision($scope.curentProduct.taxAmmount + $scope.curentProduct.totalPrice);
        }
        $scope.calculateProductCosting();
        if($scope.isValidProductInfoforAdd()){
        	if($scope.curentProduct && $scope.curentProduct.id === undefined){
        		$scope.curentProduct.id="";
        	}
        	
        	if($scope.curentProduct && $scope.curentProduct.taxRate === undefined){
        		$scope.curentProduct.taxRate = $scope.curentProduct.taxValue;
        	}
        	
            $scope.selectedProducts.push($scope.curentProduct);  
            calculateTotal();
            $scope.taxTypeTotal = calculateTaxTypeTotal();
            $scope.curentProduct = getCurrentProductBlank();
            $scope.setProductContainerToPristine();
        }
    };
    
    $scope.setProductContainerToPristine = function(){
        $scope.salesForm.currentProductName.$setUntouched();
        $scope.salesForm.currentProductModelNumber.$setUntouched();
        $scope.salesForm.currentProductSerialNumber.$setUntouched();
        $scope.salesForm.currentProductQuantity.$setUntouched();
        $scope.salesForm.currentProductPrice.$setUntouched();

        $scope.salesForm.currentProductName.$setPristine();
        $scope.salesForm.currentProductModelNumber.$setPristine();
        $scope.salesForm.currentProductSerialNumber.$setPristine();
        $scope.salesForm.currentProductQuantity.$setPristine();
        $scope.salesForm.currentProductPrice.$setPristine();
    }
    
    $scope.isValidProductInfoforAdd = function(){
        var allowAddProduct = false;
        if(!$scope.salesForm.currentProductName.$invalid && !$scope.salesForm.currentProductQuantity.$invalid && !$scope.salesForm.currentProductPrice.$invalid){
            allowAddProduct = true;
        }
        return allowAddProduct;
    }
    $scope.isValidCustomerAdd = function(){
        var isValidCustomerForm = false;
        if(!$scope.salesForm.customerName.$invalid){
            isValidCustomerForm = true;
        }
        return isValidCustomerForm;
    }

    $scope.removeRow = function removeRow(row) {
        var index = $scope.selectedProducts.indexOf(row);
        if (index !== -1) {
            $scope.selectedProducts.splice(index, 1);
        }
        $scope.taxTypeTotal = calculateTaxTypeTotal();
        calculateTotal();
    }
    
    var calculateTaxTypeTotal = function(){
        var taxTypes = {},  taxType = '', taxTypeSum = 0;
        for(var i=0; i<$scope.selectedProducts.length; i++){
            taxType = $scope.selectedProducts[i].taxType;
           if(taxTypes[taxType] === undefined){
               taxTypes[taxType] = {taxType:taxType, taxRate:$scope.selectedProducts[i].taxRate, taxAmmount:$scope.selectedProducts[i].taxAmmount || 0};
           }else{
               taxTypes[taxType].taxAmmount += $scope.selectedProducts[i].taxAmmount;
           }
        }
        return taxTypes;
    }
    
    $scope.reloadSalesPage = function(){
        window.location.href = "index.html";
    }
    $scope.stringify = function(json){
        return JSON.stringify(json);
    }    
    $scope.open = function (size) {
        var modalInstance;
        var modalScope = $scope.$new();
        modalScope.ok = function () {
                modalInstance.close(modalScope.selected);
        };
        modalScope.cancel = function () {
                modalInstance.dismiss('cancel');
        };      
        
        modalInstance = $modal.open({
          template: '<print-modal-directive page="components/modal/modalContent.html"></print-modal-directive>',
          size: size || 'lg',
          scope: modalScope
          }
        );

        modalInstance.result.then(function (selectedItem) {
          //$scope.selected = selectedItem;
        }, function (a,b,c) {
        	$log.info('Modal dismissed at: ' + new Date());
          	window.location.href="index.html";
        });
  };
    
}]);
