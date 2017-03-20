app.controller('uploadCtrl', ['$scope', '$rootScope', '$http', 'ConfigService', '$state',
    '$window', 'md5', 'loginService', '$timeout', 'Upload',
    function($scope, $rootScope, $http, ConfigService, $state, $window,
        md5, loginService, $timeout, Upload) {
        var host = ConfigService.host;
        $scope.loggedUser = angular.fromJson($window.localStorage.loggedUser);
        var uid = $scope.isLogin = $scope.loggedUser.id;
        var albumname = $scope.loggedUser.albumname;
        var albumkey = $scope.loggedUser.albumkey;
        $("#file-1").fileinput({
            uploadUrl: '/api/upload/'+uid, // you must set a valid URL here else you will get an error
            allowedFileExtensions: ['jpg', 'png', 'gif'],
            overwriteInitial: false,
            uploadAsync: false,
            maxFileSize: 5000,
            maxFileCount: 10,
            maxFilesNum: 10,
            uploadExtraData: function() {
                return { id: uid, value: '100 Details', aid: $('#singleAlbum').val(), isRecognize: $("#isRecognize").is(':checked'),albumname:albumname,albumkey:albumkey }
            },
            //allowedFileTypes: ['image', 'video', 'flash'],
            slugCallback: function(filename) {
                return filename.replace('(', '_').replace(']', '_');
            }
        }).on('filebatchuploadsuccess', function(event, data) {
            var resp = data.response.data;
            if (typeof($scope.listImages) != 'undefined') {
                resp.map(function(img){
                    console.log(img)
                    img.isShow = true;
                    $scope.addTags(img.tags);
                    $scope.filter.tags = $scope.listTags.slice();
                    $scope.addCities(img.city);
                    $scope.filter.city = $scope.listCity.slice();
                    $scope.addColor(img.colors);
                    for (var i = img.personid.length - 1; i >= 0; i--) {
                        if ($scope.filter.person.indexOf(img.personid[i]) === -1) {
                            $scope.filter.person.push(img.personid[i]);
                        }
                    };
                    $scope.listImages.push(img);
                })
                $scope.$apply();
            }
        });

        $scope.newAlbum = "";
        $scope.insertNewAlbum = function() {
            console.log($scope.listAlbum);
            albumObj = { 'title': $scope.newAlbum, 'description': '' }
            $http.post(host + '/api/album/' + uid, albumObj).then(function(res) {
                if (!res.data.Error) {
                    albumObj.id = res.data.data.insertId;
                    albumObj.created = new Date();
                    albumObj.uid = uid;
                    $scope.listAlbum.push(albumObj);
                    $scope.listAlbum = $scope.listAlbum.sort();
                    $scope.filter.album.push(albumObj.id);
                    $scope.newAlbum = "";
                }else{
                    alert(res.data.Message);
                }
            })
        }
    }
]);
