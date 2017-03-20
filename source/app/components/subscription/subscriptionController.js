app.controller('subscriptionCtrl', ['$scope', '$rootScope', '$http', 'ConfigService', '$state',
    '$window', 'md5', 'loginService', '$timeout',
    function($scope, $rootScope, $http, ConfigService, $state, $window,
        md5, loginService, $timeout) {
        var host = ConfigService.host;

        $scope.loggedUser = angular.fromJson($window.localStorage.loggedUser);
        var uid = $scope.isLogin = $scope.loggedUser.id;

        $scope.listSubscriptions = [];
        $http.get(host + '/api/subscriptions/').then(function(res) {
            if (!res.data.error) {
                $scope.listSubscriptions = res.data.data;
            }
        });

        $scope.activeSubId = 0;
        $http.get(host + '/api/user/subscription/'+uid).then(function(res) {
            if (!res.data.error) {
                $scope.activeSubId = res.data.data;
                console.log( $scope.activeSubId );
            }
        });

        $scope.activeSubscription = function(sid) {
        	var objSub = {
        		uid : uid,
        		sid : sid
        	}
            $http({
                method: "PUT",
                url: host + '/api/user/subscription',
                data: objSub
            }).then(function(res) {
                if (!res.data.error) {
                	$scope.activeSubId = sid;
                	alert('Successful!')
                }else{
                	alert('Error:'+res.data.message)
                }
            });

        }

    }
]);
