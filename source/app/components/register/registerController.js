app.controller('registerCtrl', ['$scope', '$rootScope', '$http', 'ConfigService', '$state',
    '$window', 'md5', 'loginService', '$timeout',
    function($scope, $rootScope, $http, ConfigService, $state, $window,
        md5, loginService, $timeout) {
        var host = ConfigService.host;
        $scope.regis = {};
        $scope.regis.username = "";
        $scope.regis.password = "";
        $scope.regis.repassword = "";
        $scope.regis.email = "";
        $scope.regis.lastname = "";
        $scope.regis.firstname = "";
        $scope.regis.message = { 'username': '', 'email': '' };
        $scope.regis.notValid = true;
        $scope.submiting = false;
        $scope.check_form = function() {
            $scope.regis.notValid = $scope.registerform.$invalid;
        }
        $scope.submit_form = function() {
            if (!$scope.regis.not_valid) {
                var objUser = {
                    "username": $scope.regis.username,
                    "password": md5.createHash($scope.regis.password),
                    "email": $scope.regis.email,
                    "lastname": $scope.regis.lastname,
                    "firstname": $scope.regis.firstname
                };
                if (!$scope.submiting) {
                    $scope.submiting = true;
                    var promise = loginService.register(objUser);
                    promise.then(function(data) {
                        if (data.error) {
                            $scope.regis.message = data.message;
                            console.log($scope.regis.message);
                        } else {
                            $scope.regis.message = { 'username': '', 'email': '' };
                            $window.localStorage.loggedUser = angular.toJson(data);
                            $http.defaults.headers.common['x-access-token'] = $window.localStorage.token;
                            $state.go('home.gallery');
                        }
                        $scope.submiting = false;
                    })
                }
            }
        }
    }
]);
