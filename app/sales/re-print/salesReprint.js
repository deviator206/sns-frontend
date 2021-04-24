'use strict';
angular
		.module('salesApp.salesReprint',
				[ 'ngRoute', 'smart-table', 'ui.bootstrap' ])
		.controller(
				'SalesReprintCtrl',
				[
						'$scope',
						'$http',
						'$uibModal',
						'$log',
						'Util',
						function($scope, $http, $modal, $log, Util) {
							$scope.printPage = Util.printPage;
							 $scope.receiptType = "Bill Of Supply";
							$scope.backendItemStatusMap = {
								"IN PROGRESS" : "IP",
								"NOT STARTED" : "NS",
								"TECHNICIAN HANDLE" : "TH",
								"COMPLETE" : "C",
								"CUSTOMER APPROVAL" : "CA",
								"PART PENDING" : "PP",
								"CANNOT BE REPAIRED" : "CBR"
							}
							$scope.uiToBackendMap = {
								"IP" : "IN PROGRESS",
								"NS" : "NOT STARTED",
								"TH" : "TECHNICIAN HANDLE",
								"C" : "COMPLETE",
								"CA" : "CUSTOMER APPROVAL",
								"PP" : "PART PENDING",
								"CBR" : "CANNOT BE REPAIRED",
								"DTC" : "DELIVERED TO CUSTOMER"
							}
							$scope.init = function() {
								$scope.resetModel();
							}
							$scope.resetModel = function() {
								$scope.statusSearchTextModel = "";
								$scope.itemSelectionError = "";
								$scope.currentJobStatusList = [];
								$scope.serviceDateFromModel = "";
								$scope.serviceDateTo = new Date();
								$scope.statusSearchFilterOptions = [
										"CUSTOMER_NAME", "CUSTOMER_PHONE",
										"INVOICE_ID", ];
								 // "SERIAL_NUMBER","PRODUCT_NAME"
								$scope.searchFilterByOptions = [
										"SEARCH BY TEXT" ]; // , "SEARCH BY DATE"
								$scope.selectedFilterByOptionForStatus = $scope.searchFilterByOptions[0];
								$scope.statusSelectedSearchFilterOptionsModel = $scope.statusSearchFilterOptions[0];

							}
							$scope.onFilterByOptionIsChanged = function() {
								$scope.serviceDateFromModel = "";
								$scope.serviceDateTo = new Date();
								$scope.statusSearchTextModel = "";
							}

							$scope.reloadPage = function(event) {
								this.$close();
							}
							
							$scope.parseResponseForProductClub = function (salesList) {
								var salesLocal = {};
								for(var salesListKey in salesList) {
									if(salesLocal.hasOwnProperty(salesList[salesListKey].invoiceId)) {
										salesLocal[salesList[salesListKey].invoiceId].products.push(salesList[salesListKey].productInfo[0])
									} else {
										salesLocal[salesList[salesListKey].invoiceId] = {};
										salesLocal[salesList[salesListKey].invoiceId].products = [salesList[salesListKey].productInfo[0]];
										salesLocal[salesList[salesListKey].invoiceId].paymentInfo = salesList[salesListKey].paymentInfo;
										salesLocal[salesList[salesListKey].invoiceId].customerInfo = salesList[salesListKey].customerInfo;
										salesLocal[salesList[salesListKey].invoiceId].invoiceId = salesList[salesListKey].invoiceId;
										salesLocal[salesList[salesListKey].invoiceId].invoiceTin = salesList[salesListKey].invoiceTin;
									}
								}
								
								return salesLocal;
							}
							$scope.closeSalesPage = function () {
								this.$close();
							}
							
							$scope.getSummationAmount = function(obj) {
								var total1 = parseFloat(obj.amount,10);
								var total2 =0;
								if (obj.additional_cash !== null){
									total2 = parseFloat(obj.additional_cash,10);
								}
								
								return (total1 + total2);
							}
							$scope.viewBill = function(obj) {
								$scope.currentSelected= obj;
								$scope.paymentInfo = {};
								if (obj.paymentInfo && obj.paymentInfo.type) {
									switch(obj.paymentInfo.type.toUpperCase()){
									case 'CASH':
										$scope.paymentInfo.cash = {};
										$scope.paymentInfo.cash['amount'] = obj.paymentInfo.amount;
										break;
									case 'CHEQ':
										$scope.paymentInfo.cheq = {};
										$scope.paymentInfo.cheq['amount'] = obj.paymentInfo.amount;
										$scope.paymentInfo.cheq['cheqDate'] = obj.paymentInfo.cheqDate;
										$scope.paymentInfo.cheq['cheqNo'] = obj.paymentInfo.cheqNo;
										$scope.paymentInfo.cheq['bankName'] = obj.paymentInfo.bankName;
										$scope.paymentInfo.cheq['expDate'] = obj.paymentInfo.expDate;
										break;
									case 'ONLINE':

										$scope.paymentInfo.online = {};
										$scope.paymentInfo.online['payMode'] = obj.paymentInfo.payMode;
										$scope.paymentInfo.online['transactionId'] = obj.paymentInfo.transactionId;
										$scope.paymentInfo.online['remark'] = obj.paymentInfo.remark;
										
										break;
									case 'CARD':

										$scope.paymentInfo.card = {};
										$scope.paymentInfo.card['cardNetwork'] = obj.paymentInfo.cardNetwork;
										$scope.paymentInfo.card['cardNumber'] = obj.paymentInfo.cardNumber;
										$scope.paymentInfo.card['cardBank'] = obj.paymentInfo.cardBank;
										$scope.paymentInfo.card['bankName'] = obj.paymentInfo.bankName;
										break;
										default :
											break;
									}
									

								}
								
								
								$scope.productTotal = {
						            taxAmmount:0,
						            totalPrice:0,
						            grandTotal:0,
						            totalItems:0
						        }
								
								 for(var i=0; i<obj.products.length; i++){
						                $scope.productTotal.taxAmmount += Util.toDecimalPrecision(obj.products[i].taxAmmount);
						                $scope.productTotal.totalPrice += Util.toDecimalPrecision(obj.products[i].totalPrice);
						                $scope.productTotal.grandTotal += Util.toDecimalPrecision(obj.products[i].grandTotal);
						                $scope.productTotal.totalItems += Util.toDecimalPrecision(obj.products[i].quantity);
						            }
								 
								 
								$scope.paymentInfo.additional_cash = obj.paymentInfo.additional_cash;
								$scope.paymentInfo.paymentType = obj.paymentInfo.type;
									
								Util.openPrintPopUp($scope,'sales-re-print');
							}
							$scope.statusSearchTextAsPerFilterOption = function() {
								var obj = {};

								if ($scope.selectedFilterByOptionForStatus === 'SEARCH BY DATE') {
									if ($scope.serviceDateFromModel === ""
											|| $scope.serviceDateTo === "") {
										$scope.serviceSearchCriteriaIncomplete = "Please Enter Valid Date";
										return false;
									}
									obj = {
										"query" : "",
										"type" : "BY_DATE",
										"col" : "",
										"startFrom" : new Date(
												$scope.serviceDateFromModel)
												.toMysqlFormat(),
										"startTo" : new Date(
												$scope.serviceDateTo)
												.toMysqlFormat()
									}
								} else {
									obj = {
										"type" : "BY_QUERY",
										"query" : $scope.statusSearchTextModel,
										"col" : $scope.statusSelectedSearchFilterOptionsModel,
										"startFrom" : "",
										"startTo" : ""

									}

								}

								// $http.get('fixture/searchForStatus.json?v='+(Math.random()),{
								$http
										.get(
												'rest/invoice/sales-history?v='
														+ (Math.random()), {
													params : obj
												})
										.then(
												function(response) {
													$scope.salesListFinal = $scope.parseResponseForProductClub(response.data.salesList);
													console.log($scope.salesListFinal);
												});

							}
						} ]);

Date.prototype.toMysqlFormat = function() {
	return this.getFullYear() + "-" + twoDigits(1 + this.getMonth()) + "-"
			+ twoDigits(this.getDate()) + " " + twoDigits(this.getHours())
			+ ":" + twoDigits(this.getMinutes()) + ":"
			+ twoDigits(this.getSeconds());
};

function twoDigits(d) {
	if (0 <= d && d < 10)
		return "0" + d.toString();
	if (-10 < d && d < 0)
		return "-0" + (-1 * d).toString();
	return d.toString();
}
