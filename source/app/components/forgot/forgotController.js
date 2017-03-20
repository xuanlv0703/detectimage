app.controller('forgotCtrl', ['$scope', '$rootScope', '$http', 'ConfigService', '$state', 
    '$window', 'md5', 'loginService','$timeout', function($scope, $rootScope, $http, ConfigService, $state, $window,
     md5, loginService,$timeout) {
    var host = ConfigService.host;
    $scope.nullMessage = '';
    $scope.email = null;
    $scope.forgot = function() {
        var email = $scope.email;
        if (email == null) {
            var objUser = { "email": email};
            var promise = loginService.forgot(objUser);
            promise.then(function(data) {
             	if(data.data.error){
             		$scope.nullMessage = data.data.message;
             	}else{	
             		alert(data.data.message);
             		$state.go('login');
             	}
            });
        } else {
            $scope.nullMessage = "Please input email";
        }
    };

    $timeout(function(){
        $("#country_selector").countrySelect({
                defaultCountry: "us",
                onlyCountries: ['us','de','vn']
            });
    },200)
}]);
