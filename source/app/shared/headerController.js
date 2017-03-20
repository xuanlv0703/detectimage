"use strict";
app.controller('headerCtrl', ['$scope', '$rootScope', '$window', '$state', '$http', '$timeout', 'ConfigService', 'loginService', function($scope, $rootScope, $window, $state, $http, $timeout, ConfigService, loginService) {
    var host = ConfigService.host;

    $scope.loggedUser = angular.fromJson($window.localStorage.loggedUser);
    $scope.isLogin = $scope.loggedUser === undefined ? false : true;
    $scope.isAdmin = $scope.loggedUser.username ==='admin'?true:false;
    $scope.logout = function() {
        loginService.logout();
        $state.go('login');
    }

    $scope.changePassword = function() {
        $state.go('changepassword');
    }



    $timeout(function() {

    }, 100)

}]);
