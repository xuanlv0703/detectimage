app.controller('adminCtrl', ['$scope', '$rootScope', '$http', 'ConfigService', '$state', 
    '$window', 'md5', 'loginService','$timeout', function($scope, $rootScope, $http, ConfigService, $state, $window,
     md5, loginService,$timeout) {
    var host = ConfigService.host;


    $timeout(function(){
        $("#country_selector").countrySelect({
                defaultCountry: "us",
                onlyCountries: ['us','de','vn']
            });
    },200)
}]);
