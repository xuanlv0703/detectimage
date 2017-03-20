app.controller('loginCtrl', ['$scope', '$rootScope', '$http', 'ConfigService', '$state', 
    '$window', 'md5', 'loginService','$timeout', function($scope, $rootScope, $http, ConfigService, $state, $window,
     md5, loginService,$timeout) {
    var host = ConfigService.host;

    $scope.login = function() {
        var username = $scope.username;
        var password = $scope.password;
        if ((username != null & password != null) || (username != null) || (password != null)) {
            var objUser = { "name": username, "password": md5.createHash(password) };
            var promise = loginService.login(objUser);
            promise.then(function(data) {
                if (data != undefined) {
                    if (data.status == 0) {
                        $scope.isFailed = true;
                        $scope.loginMessage = "Your account did not active. Please active your account first !";
                    } else {
                        $window.localStorage.loggedUser = angular.toJson(data);
                        $http.defaults.headers.common['x-access-token'] = $window.localStorage.token;
                        $state.go('home.gallery');
                    }
                } else {
                    $scope.isFailed = true;
                    $scope.loginMessage = "Loggin failed. ! Please check your username or password and try again later.";
                }
            })
        } else {
        	$scope.isNull = true;
            $scope.nullMessage = "Please input username and password.";
        }
    };

    $timeout(function(){
        $("#country_selector").countrySelect({
                defaultCountry: "us",
                onlyCountries: ['us','de','vn']
            });
    },200)
}]);
