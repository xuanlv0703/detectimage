'use strict';
app.service('userService', function($window) {
    this.isLogin = function() {
        return $window.localStorage.loggedUser == undefined ? false : true;
    };
});

app.service('loginService', ['ConfigService', '$http', '$window', '$state', '$q', function(ConfigService, $http, $window, $state, $q) {
    this.login = function(objUser) {
            var host = ConfigService.host;
            var url = host + "/api/user/login";
            var deferred = $q.defer();
            $http.put(url, objUser)
                .then(function(res) {
                    console.log(res);
                    $window.localStorage.token = res.data.token;
                    deferred.resolve(res.data.data[0]);
                });
            return deferred.promise;
        },
        this.logout = function() {
            $window.localStorage.removeItem('loggedUser');
            $window.localStorage.removeItem('token');
        },
        this.register = function(objUser) {
            var host = ConfigService.host;
            var url = host + "/api/user/register";
            var deferred = $q.defer();
            $http.post(url, objUser)
                .then(function(res) {
                    if (!res.data.error) {
                        $window.localStorage.token = res.data.token;
                        deferred.resolve(res.data.data[0]);
                    } else {
                        deferred.resolve(res.data)
                    }

                });
            return deferred.promise;
        },
        this.forgot = function(objUser) {
            var host = ConfigService.host;
            var url = host + "/api/user/forgot";
            var deferred = $q.defer();
            $http.post(url, objUser)
                .then(function(res) {
                    deferred.resolve(res);

                });
            return deferred.promise;
        },
         this.changepass = function(objUser) {
            var host = ConfigService.host;
            var url = host + "/api/user/changepass";
            var deferred = $q.defer();
            $http.post(url, objUser)
                .then(function(res) {
                    deferred.resolve(res);

                });
            return deferred.promise;
        }
}]);
