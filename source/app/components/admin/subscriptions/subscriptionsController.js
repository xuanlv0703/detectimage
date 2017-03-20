app.controller('subscriptionsCtrl', ['$scope', '$rootScope', '$http', 'ConfigService', '$state',
    '$window', 'md5', 'loginService', '$timeout',
    function($scope, $rootScope, $http, ConfigService, $state, $window,
        md5, loginService, $timeout) {
        var host = ConfigService.host;
        $scope.listSubscriptions = [];
        $http.get(host + '/api/subscriptions/').then(function(data) {
            if (!data.data.error) {
                $scope.listSubscriptions = data.data.data;
            }
        });
        $scope.objSub = {};
        $scope.saveSubscription = function() {

            var objSub = $scope.objSub;
            if (!objSub.id) {
                $http({
                    method: "POST",
                    url: host + '/api/subscriptions/',
                    data: objSub
                }).then(function(data) {
                    if (!data.data.error) {
                        objSub.id = data.data.insertId;
                        $scope.listSubscriptions.push(objSub);
                        $('#create').modal("hide");
                        $scope.objSub = {};
                    }
                });
            } else {
                $http({
                    method: "PUT",
                    url: host + '/api/subscriptions/',
                    data: objSub
                }).then(function(data) {
                    if (!data.data.error) {
                        $('#create').modal("hide");
                        $scope.objSub = {};
                    }
                });
            }

        }
        $scope.addSub = function() {
            $scope.objSub = {};
        }

        $scope.editSub = function(objSub) {
            $scope.objSub = objSub;
        }

        $timeout(function() {
            $("#country_selector").countrySelect({
                defaultCountry: "us",
                onlyCountries: ['us', 'de', 'vn']
            });
        }, 200)
    }
]);
