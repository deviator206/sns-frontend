'use strict';
angular.module('salesApp.service', ['ngRoute' , 'smart-table', 'ui.bootstrap'])
.controller('ServiceCtrl', ['$scope', '$http', '$uibModal', '$log' , 'customerSearch', 'productSearch' , 
                            'taxService', 'Util', 'Validation', 'customerService', 'pageMode', '$routeParams', '$timeout', 'customerSearchFactory' ,
function($scope, $http, $modal, $log, customerSearch, productSearch, taxService, Util, Validation, customerService, pageMode, $routeParams, $timeout, customerSearchFactory) {
    console.log(pageMode);
    $scope.receiptType = "ESTIMATE";  
    $scope.pageStatus = 'INIT';
    $scope.receiptXtraName = "NAIK "
    $scope.pageMode = pageMode;    
    $scope.taxTypes = taxService.getTaxListService();
    $scope.problemLists = ["Dust In View Finder", "Scratches on Focusing Screen", "Salt Water Damage", "Water Damage", "Fungus in Binocular", "Scratch on Body"];
    $scope.accessoryList= ["AC Cord", "Filter UV", "Memory Card", "USB Cable", "Charger", "Battery", "Body Cap", "Lens Cap Back", "Lens Cap front"];
    $scope.newProblem = "";
    $scope.isValidProductToAdd = false;
    $scope.serviceResponse = [];
    $scope.serviceDate = new Date();
    $scope.serviceEstimatedDeliveryDate;
    $scope.serviceEstimatedDeliveryCost;
    $scope.serviceOrderDate = new Date();
    $scope.serviceFinalDeliveryDate = new Date();
    $scope.paymentInfo = Util.paymentInfoObj();
    $scope.printPage = Util.printPage;
    
    $scope.inCompleteFormElementList = [];

    $scope.serviceRequest = {
        selectedProductList:[],
        problemLists:[],
        accessoryList:[],
        shopUserComment:'',
        customerComment:'',
        tentative_quoted_cost:0.00,
        customerInfo:{
          id: "",
          name: "",
          address: "",
          phone: ""
        },
        productInfo:[],
        service_order_date:'',
        tentative_service_completion_date:'',
        courierInfo: {
            isCourier: false,
            courierName: "",
            courierPhone: "",
            courierDocumentNo: ""
        },
        courierOutwardInfo: {
            isCourier: false,
            courierName: "",
            courierPhone: "",
            courierDocumentNo: ""
        },
        pageMode:pageMode,
        serviceDate: ""
    };
    
    $scope.initServiceDelivery = function(){
        //setDummyProduct();
        //console.log($routeParams);
    	$scope.receiptXtraName = "NAIK "
        $scope.receiptType = "RECEIPT";   
    	//$scope.serviceFinalDeliveryDate = new Date();
        mapHashChangeToMenuUpdate();
        var requestParams = {};
        if($routeParams.serviceId !==undefined){
            requestParams.serviceId = $routeParams.serviceId; 
        }
        if($routeParams.selectedItems !==undefined){
            var selectedItemsArr = $routeParams.selectedItems.split(',');
            if(selectedItemsArr.length > 0){
                requestParams.serviceItems = selectedItemsArr;
            }
        }
        if(requestParams.serviceId){
        //	var temp = requestParams.serviceId.replace(/:/g,"/");
        	//requestParams.serviceId = temp;
            customerService.fetchServiceItemsFroDelivery(requestParams).
            then(function(response){
            	if (response.data.status && response.data.searchResults.length > 0) {
            		response.data = response.data.searchResults[0]
            	}
            	if(response.data.accessoryList != ""){
            		response.data.accessoryList = response.data.accessoryList.split(",")
            	}
            	if(response.data.problemList != ""){
            		response.data.problemLists = response.data.problemList.split(",")
            	}
            		
                var data = angular.copy(response.data);
                    $timeout(function () {
                        angular.merge($scope.serviceRequest, data);
                        $scope.serviceRequest.advancePayment = getAdvancePaymentDoneForDrop(data.paymentInfo);
                    });
            });
        }
        
    };

    var resetOtherPaymentTypes = function(paymentInfo){
        if(paymentInfo.paymentType == 'cash'){
            paymentInfo.card = {amount:0, bankName:'', cardNumber:'', expDate:'', cardNetwork:'', cardBank:'' };
            paymentInfo.cheq = {amount:0, bankName:'', cheqNo:'', cheqDate:'' } ;
        }    
        if(paymentInfo.paymentType == 'card'){
            paymentInfo.cash = {amount:0};
            paymentInfo.cheq = {amount:0, bankName:'', cheqNo:'', cheqDate:'' } ;
        }    
        if(paymentInfo.paymentType == 'cheq'){
            paymentInfo.cash = {amount:0};
            paymentInfo.card = {amount:0, bankName:'', cardNumber:'', expDate:'', cardNetwork:'', cardBank:'' };
        }    
    }

    $scope.performServiceDelivery = function(){
        resetOtherPaymentTypes($scope.paymentInfo)
        if($scope.serviceRequest.courierOutwardInfo.courierName !== "" || $scope.serviceRequest.courierOutwardInfo.courierDocumentNo !== ""  ||$scope.serviceRequest.courierOutwardInfo.courierPhone !== ""  ) {
        	$scope.serviceRequest.courierOutwardInfo.isCourier = true;
        }
        
        var deliveryDateTemp = (document.getElementById("delivert-estimated-date").value).split("-");
        if (deliveryDateTemp.length > 0) {
        	$scope.serviceRequest.finalDeliveryDate = Util.jsDateConversionFunction(new Date(deliveryDateTemp[0],parseInt(deliveryDateTemp[1])-1,deliveryDateTemp[2]));
        }
        
        
        $scope.serviceRequest.paymentInfo = angular.copy($scope.paymentInfo);
        var postParam = angular.copy($scope.serviceRequest);

        customerService.deliverProduct(postParam).then(function(response){
            $scope.serviceResponse = response.data;
            $scope.pageStatus = 'COMPLETED';
            Util.openPrintPopUp($scope, 'service-drop');
        });
    }
    
    $scope.calculateReaminingPayment = function(){
        var totalPayment = Util.toDecimalPrecision($scope.paymentInfo.totalCharges);
        var advancePayment = Util.toDecimalPrecision($scope.serviceRequest.advancePayment);
        var remainingAmmount = '';
        if(!isNaN(totalPayment)){
            if(remainingAmmount = totalPayment - advancePayment);
        }
        $scope.paymentInfo.remainingAmmount = remainingAmmount;
        
        if(remainingAmmount > 0){
            $scope.paymentInfo.cash.amount = remainingAmmount;
            $scope.paymentInfo.card.amount = remainingAmmount;
            $scope.paymentInfo.cheq.amount = remainingAmmount;
            $scope.paymentInfo.online.amount = remainingAmmount;
        }
        
        //console.log(remainingAmmount);
    }
    
    var getAdvancePaymentDoneForDrop = function(data){
    	
        var advancePaymentMade = 0;
        	
        	advancePaymentMade += Util.toDecimalPrecision((data.cash && data.cash.amount)?data.cash.amount:0 );
            advancePaymentMade += Util.toDecimalPrecision((data.cash && data.card.amount)?data.card.amount:0 );
            advancePaymentMade += Util.toDecimalPrecision((data.cash && data.cheq.amount)?data.cheq.amount:0 );
            advancePaymentMade += Util.toDecimalPrecision((data.advancePayment && data.advancePayment)?data.advancePayment:0 );
        return advancePaymentMade;
    }
    
    var getPaymentDoneForPickup = function(){
        var advancePaymentMade = 0;
            advancePaymentMade += Util.toDecimalPrecision($scope.serviceRequest.paymentInfo.cash.amount || 0);
            advancePaymentMade += Util.toDecimalPrecision($scope.serviceRequest.paymentInfo.card.amount || 0);
            advancePaymentMade += Util.toDecimalPrecision($scope.serviceRequest.paymentInfo.cheq.amount || 0);
           
        return advancePaymentMade;
    }
    
    $scope.productLogisticMode = {
           logisticType:'manual', 
           receivedModes:[{name: "Courier", value: "courier"}, {name: "Manual", value: "manual"}]
    };

    var setCurrentProductBlank = function(){
        $scope.curentProduct = {tentative_service_completion_date:"",
                                service_order_date:Util.jsDateConversionFunction($scope.serviceOrderDate), 
                                name: "",  model: "",  sn: "", 
                                tentative_quoted_cost: "", totalPrice:0, taxType:0, taxValue:0, 
                                taxAmmount:0, grandTotal:0 };
        return $scope.curentProduct;
    };
    
    var setDummyProduct = function(){
        var dummyProduct = {tentative_service_completion_date:"11",
                                service_order_date:Util.jsDateConversionFunction($scope.serviceOrderDate), 
                                name: "11",  model: "22",  sn: "33", 
                                tentative_quoted_cost: "33", totalPrice:0, taxType:0, taxValue:0, 
                                taxAmmount:0, grandTotal:0 };
            dummyProduct.id=11    
            $scope.serviceRequest.productInfo.push(angular.copy(dummyProduct));  
            dummyProduct.id=22    
            $scope.serviceRequest.productInfo.push(angular.copy(dummyProduct)); 
            dummyProduct.id=33            
            $scope.serviceRequest.productInfo.push(angular.copy(dummyProduct));      
            dummyProduct.id=44        
            $scope.serviceRequest.productInfo.push(angular.copy(dummyProduct));                       
    };
    
    $scope.selectCustomerFrmList = function(value){
        $scope.serviceRequest.customerInfo.name = value.name || '';
        $scope.serviceRequest.customerInfo.id = value.id || null;
        $scope.serviceRequest.customerInfo.phone = value.phone || '';
        $scope.serviceRequest.customerInfo.address = value.address || '';
        $scope.serviceRequest.customerInfo.email = value.email || '';
        $scope.serviceRequest.customerInfo.alternateNo = value.contact2 || '';
    }
    
    var setProductContainerToPristine = function(){
        $scope.serviveForm.currentProductName.$setUntouched();
        $scope.serviveForm.currentProductModelNumber.$setUntouched();
        $scope.serviveForm.currentProductSerialNumber.$setUntouched();

        $scope.serviveForm.currentProductName.$setPristine();
        $scope.serviveForm.currentProductModelNumber.$setPristine();
        $scope.serviveForm.currentProductSerialNumber.$setPristine();
    };

    var setCurrentProductBlank = function(){
        $scope.curentProduct = {tentative_service_completion_date:"",
                                service_order_date:Util.jsDateConversionFunction($scope.serviceOrderDate), 
                                name: "",  model: "",  sn: "", 
                                tentative_quoted_cost: "", totalPrice:0, taxType:0, taxValue:0, 
                                taxAmmount:0, grandTotal:0 };
        return $scope.curentProduct;
    };
    
    var setProductContainerToPristine = function(){
        $scope.serviveForm.currentProductName.$setUntouched();
        $scope.serviveForm.currentProductModelNumber.$setUntouched();
        $scope.serviveForm.currentProductSerialNumber.$setUntouched();

        $scope.serviveForm.currentProductName.$setPristine();
        $scope.serviveForm.currentProductModelNumber.$setPristine();
        $scope.serviveForm.currentProductSerialNumber.$setPristine();
    };    

    $scope.removeRow = function removeRow(row) {
        var index = $scope.serviceRequest.productInfo.indexOf(row);
        if (index !== -1) {
            $scope.serviceRequest.productInfo.splice(index, 1);
        }
    }

    $scope.isValidCustomerAdd = function(){
        var isValidCustomerForm = false;
        if(!$scope.serviveForm.customerName.$invalid){
            isValidCustomerForm = true;
        }
        return isValidCustomerForm;
    }
    
    $scope.setFocusTo = function(formElementToFocus){
        //document.getElementById(formElementToFocus).focus();
        document.serviveForm[formElementToFocus].focus();
    };
    
    $scope.addProduct = function(){
        if(Validation.isNotEmptyStr($scope.curentProduct.name) && Validation.isNotEmptyStr($scope.curentProduct.model) && 
            Validation.isNotEmptyStr($scope.curentProduct.sn)){
            $scope.isValidProductToAdd = true;
        }        
        
        if($scope.isValidProductToAdd === true){
            $scope.serviceRequest.productInfo.push($scope.curentProduct);
            setCurrentProductBlank();
            setProductContainerToPristine();
            $scope.isValidProductToAdd = false;
        }
    };
        
    $scope.isValidProductToAdd = function(){
        var isValid = false;
        if($scope.newProblem.trim() !== "" && $scope.newProblem.trim().length >= 3){
            isValid = true;
        }
        return isValid;
    };
    
    $scope.isValidNewProblem = function(){
        var isValid = false;
        if($scope.newProblem.trim() !== "" && $scope.newProblem.trim().length >= 3){
            isValid = true;
        }
        return isValid;
    };
    
    $scope.isValidNewAccessory = function(){
        var isValid = false;
        if(typeof $scope.newAccessory ==  'string' && $scope.newAccessory.trim() !== "" && $scope.newAccessory.trim().length >= 3){
            isValid = true;
        }
        return isValid;
    };
    
    $scope.addProblem = function(){
        if($scope.isValidNewProblem()){
            $scope.problemLists.push($scope.newProblem);
            $scope.checkLastProblem($scope.newProblem);
            $scope.newProblem = "";
        }
    };  
   
    $scope.addAccessory = function(){
        if($scope.isValidNewAccessory()){
            $scope.accessoryList.push($scope.newAccessory);
            $scope.checkLastAccessory($scope.newAccessory);
            $scope.newAccessory = "";
        }
    };
    
    $scope.checkLastProblem = function(newProblem) {
        $scope.serviceRequest.problemLists.push(newProblem);
    };    
    
    $scope.checkLastAccessory = function(newAccessory) {
        $scope.serviceRequest.accessoryList.push(newAccessory);
    };    
        
    $scope.customerList = function(val) {
        return $http.get('rest/customer/serach-customer',{
        //return $http.get('fixture/customer.json?text='+(Math.random()),{
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
        return $http.get('rest/product/search-product',{
        //return $http.get('fixture/item-list.json?v='+Math.random(), {
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
   
    $scope.selectProductFrmList = function(value, type){
        $scope.curentProduct.id = value.id || "";
        $scope.curentProduct.name = value.name || '';
        $scope.curentProduct.model = value.model || '';
        
    };
    
    $scope.isValidProductInfoforAdd = function(){
        var allowAddProduct = false;
        if(!$scope.serviveForm.currentProductName.$invalid  && !$scope.serviveForm.currentProductModelNumber.$invalid && !$scope.serviveForm.currentProductSerialNumber.$invalid){
            allowAddProduct = true;
        }
        return allowAddProduct;
    };
    
    $scope.isValidCustomerAdd = function(){
        var isValidCustomerForm = false;
        if(!$scope.serviveForm.customerName.$invalid){
            isValidCustomerForm = true;
        }
        return isValidCustomerForm;
    };
    
    $scope.stringify = function(json){
        return JSON.stringify(json);
    }
    $scope.prepareForServer = function(arr){
    	return arr.toString();
    }
    
    $scope.comeWhatMay = function(){
    	
    }
    
    $scope.validateRequestObject = function(){
    	var bReturn = true;
    	
    	if (!$scope.serviceRequest.customerInfo.name || $scope.serviceRequest.customerInfo.name === ""){
    		bReturn = false;
    		$scope.inCompleteFormElementList.push("Customer Name");
    	}
    	
    	if (!$scope.serviceRequest.customerInfo.phone || $scope.serviceRequest.customerInfo.phone === ""){
    		bReturn = false;
    		$scope.inCompleteFormElementList.push("Customer Phone Number");
    	}
    	
    	if (!$scope.serviceRequest.courierInfo || ($scope.serviceRequest.courierInfo.isCourier === true && $scope.serviceRequest.courierInfo.courierName ==="") ||
    			($scope.serviceRequest.courierInfo.isCourier === true && $scope.serviceRequest.courierInfo.courierDocumentNo ==="") ||
    			($scope.serviceRequest.courierInfo.isCourier === true && $scope.serviceRequest.courierInfo.courierPhone ==="")){
    		$scope.inCompleteFormElementList.push("CourierInfo Name/DocumentNo/Phone");
    		bReturn = false;
    	}
    	return bReturn;
    }
    
    $scope.performServiceDrop = function(){
    	
    	$scope.inCompleteFormElementList = [];
        $scope.serviceRequest.serviceDate = Util.jsDateConversionFunction($scope.serviceDate);
        $scope.serviceRequest.service_order_date = Util.jsDateConversionFunction($scope.serviceOrderDate);
        $scope.serviceRequest.tentative_service_completion_date = Util.jsDateConversionFunction($scope.serviceOrderDate);
        $scope.serviceRequest.paymentInfo = $scope.paymentInfo;
        $scope.serviceRequest.userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
        $scope.serviceRequest.accList = $scope.prepareForServer($scope.serviceRequest.accessoryList);
        $scope.serviceRequest.probList= $scope.prepareForServer($scope.serviceRequest.problemLists);
        $scope.serviceRequest.estimation = {}
        
        if ($scope.serviceEstimatedDeliveryCost) {
        	$scope.serviceRequest.estimation.cost = $scope.serviceEstimatedDeliveryCost;
        }
        
        if ($scope.serviceEstimatedDeliveryDate) {
        	$scope.serviceRequest.estimation.date = Util.jsDateConversionFunction( $scope.serviceEstimatedDeliveryDate);
        }
        
        if ($scope.serviceRequest.paymentInfo && $scope.serviceRequest.paymentInfo.additional_cash) {
        	$scope.serviceRequest.paymentInfo.cash.amount = Number($scope.serviceRequest.paymentInfo.cash.amount) + Number($scope.serviceRequest.paymentInfo.additional_cash)
        }
        
        if ($scope.productLogisticMode && $scope.productLogisticMode.logisticType && $scope.productLogisticMode.logisticType === 'courier'){
        	$scope.serviceRequest.courierInfo.isCourier = true;
        }
        
        if (!$scope.validateRequestObject()){
        	
        	return false;
        	
        }else {
        	
        	if (!$scope.serviceRequest.customerInfo.alternateNo || $scope.serviceRequest.customerInfo.alternateNo == "") {
        		$scope.serviceRequest.customerInfo.alternateNo = "N/A";
        	}
        	
        	if (!$scope.serviceRequest.customerInfo.email || $scope.serviceRequest.customerInfo.email == "") {
        		$scope.serviceRequest.customerInfo.email = "N/A";
        	}

        	customerService.dropProduct($scope.serviceRequest).then(function(response){
                $scope.serviceResponse = response.data;
                Util.openPrintPopUp($scope, 'service-drop');
            });
        }
        
        
    };
    
    $scope.reloadPage = function(){
        window.location.reload();
    }
}]);