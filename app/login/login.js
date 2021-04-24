
angular.module('salesApp', []).controller('loginController', ['$scope', '$http',function($scope, $http) {
	$scope.userPasswordModel ="";
	$scope.userNameModel ="";
	$scope.errorInLogin = false;
	$scope.loginClicked = function(){
		$scope.errorInLoginMessage = "Checking with backend... Please wait...";
		$http.defaults.headers.post["Content-Type"] = "application/json";
		
		$http({
				method: "POST",
				//method: "GET",
				  url: 'rest/login?v='+(Math.random()),
				 // url: 'login/login.json?v='+(Math.random()),
				  data:{"userName":$scope.userNameModel,"password":$scope.userPasswordModel}
				}).then(function successCallback(response) {
				    // this callback will be called asynchronously
					if (response.data.status) {
						 $scope.errorInLogin = false;
						 if (typeof(Storage) !== "undefined") {
							 sessionStorage.setItem("userInfo",JSON.stringify(response.data));
							 sessionStorage.setItem("userInfoRole",response.data.role);
							 if (response.data.role === "ADMIN") {
								 window.open("index.html","_self"); 
							 }else if(response.data.role === "TECH"){
								 window.open("technician.html","_self");
							 }
							 
						 }
						 
					}
					else {
						
						 $scope.errorInLogin = true;
						 $scope.errorInLoginMessage ="Error in Login. Please check the credentials"
					}
					
					console.log(localStorage.getItem("userInfo"));
				    // when the response is available
				  }, function errorCallback(response) {
				    // called asynchronously if an error occurs
				    // or server returns response with an error status.
					  $scope.errorInLogin = "true";
					  $scope.errorInLoginMessage ="Error in Login. Please check the credentials"
				  });
		
		console.log($scope.userPasswordModel +" :: "+ $scope.userNameModel)
	}
}]);