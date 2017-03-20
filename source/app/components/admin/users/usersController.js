app.controller('usersCtrl', ['$scope', '$rootScope', '$http', 'ConfigService', '$state', 
    '$window', 'md5', 'loginService','$timeout', function($scope, $rootScope, $http, ConfigService, $state, $window,
     md5, loginService,$timeout) {
    var host = ConfigService.host;
    $scope.listUsers =[];
     $http.get(host + '/api/user/').then(function(data) {
     	console.log(data)
            if (!data.data.error) {
                $scope.listUsers = data.data.data;
            }
        });

    $timeout(function(){
        $("#country_selector").countrySelect({
                defaultCountry: "us",
                onlyCountries: ['us','de','vn']
            });
    },200)
}]);
