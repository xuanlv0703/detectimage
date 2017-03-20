app.controller('profileCtrl', ['$scope', '$rootScope', '$http', 'ConfigService', '$state', 
    '$window', 'md5', 'loginService','$timeout', function($scope, $rootScope, $http, ConfigService, $state, $window,
     md5, loginService,$timeout) {
    var host = ConfigService.host;
    $scope.loggedUser = angular.fromJson($window.localStorage.loggedUser);
    var uid = $scope.loggedUser.id ;
    $scope.uObj = {
          id : uid
        , username : $scope.loggedUser.username
        , email : $scope.loggedUser.email
        , firstname : $scope.loggedUser.firstname
        , lastname : $scope.loggedUser.lastname
        , subscription : 0
    };

    $scope.username = $scope.loggedUser.username;
    $scope.email = $scope.loggedUser.email;
    $scope.firstname = $scope.loggedUser.firstname;
    $scope.lastname = $scope.loggedUser.lastname;

    $scope.nullMessage = "";
    $scope.oldpass = null;
    $scope.newpass = null;
    $scope.confirmpass = null;
    $scope.changePass = function(){
    	var oldpass = $scope.oldpass;
    	var newpass = $scope.newpass;
    	var confirmpass = $scope.confirmpass;

    	if(oldpass == null || newpass == null || confirmpass == null){
    		$scope.nullMessage = "Please input all field";
    		return;
    	}
    	if(md5.createHash(newpass) != md5.createHash(confirmpass)){
    		$scope.nullMessage = "Confirm Pass not same with new pass";
    		return;
    	}
        if ($scope.nullMessage == "") {
            var objUser = { "email": $scope.email,"password": md5.createHash($scope.oldpass),"username": $scope.username,"newpass": md5.createHash($scope.newpass)};
            var promise = loginService.changepass(objUser);
            console.log(promise)
            promise.then(function(data) {
            	console.log(data);
             	if(data.data.error){
             		$scope.nullMessage = data.data.message;
             	}else{	
             		alert(data.data.message);
    				$('#password_modal').modal("hide");
             	}
            });
        } 
    }
    // header profile image
    $scope.headerImages = [];
    $http.get(host + '/api/user/profileInfo/' + uid).then(function(res) {
        if (!res.data.Error) {
            $scope.uObj = res.data.data;
        } else {
            alert(res.data.Message)
        }
    });

    $http.get(host + '/api/user/profileImage/'+ uid ).then(function(res) {
        if (!res.data.error) {
            $scope.headerImages = res.data.data;
        }
    });

}]);
