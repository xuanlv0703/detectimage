app.controller('galleryCtrl', ['$scope', '$rootScope', '$http', 'ConfigService', '$state',
    '$window', 'md5', 'loginService', '$timeout',
    function($scope, $rootScope, $http, ConfigService, $state, $window,
        md5, loginService, $timeout) {
        var host = ConfigService.host;

        $scope.loggedUser = angular.fromJson($window.localStorage.loggedUser);
        var albumname = $scope.loggedUser.albumname;
        var albumkey = $scope.loggedUser.albumkey;
        var uid = $scope.isLogin = $scope.loggedUser.id;
        $scope.listAlbum = [];
        $http.get(host + '/api/album/' + uid).then(function(res) {
            $scope.listAlbum = res.data.data;
            $scope.filter.album = $scope.listAlbum.map(function(a) {
                return a.id
            });
        })

        $scope.listImages = [];
        $scope.listTags = [];
        $scope.listColors = [];
        $scope.listCity = [];
        // filter
        $scope.showFilter = { 'album': true, 'tag': false, 'city': false, 'color': false, 'person': false };
        $scope.filter = {};
        $scope.filter.album = [];
        $scope.filter.tags = [];
        $scope.filter.city = [];
        $scope.filter.person = [];
        $scope.filter.color = '';
        $scope.allAlbum = true;
        $scope.allTags = true;
        $scope.allColor = true;
        $scope.allCity = true;
        $scope.allPerson = true;

        $http.get(host + '/api/person/' + uid).then(function(res) {
            $scope.listPerson = res.data.data;
            $scope.personAvailable = $scope.listPerson.map(function(p) {
                return p.name.trim();
            });
            $scope.filter.person = $scope.listPerson.map(function(p) {
                return p.id;
            });
        })

        $http.get(host + '/api/images/' + uid).then(function(res) {
                $scope.listImages = res.data.data.map(function(img) {
                    img.isShow = true;
                    img.tags = img.tags == null ? [] : (img.tags.length ? img.tags.split(";") : []);
                    img.alltags = img.alltags == null ? [] : (img.alltags.length ? img.alltags.split(";") : []);
                    img.city = img.city == null ? [] : (img.city.length ? img.city.split(";") : []);
                    img.personid = img.personid == null ? [] : (img.personid.length ? img.personid.split(";") : []);
                    img.personobj = img.personid == null ? null : JSON.parse(img.personobj);
                    $scope.addTags(img.tags);
                    $scope.filter.tags = $scope.listTags.slice();
                    $scope.addCities(img.city);
                    $scope.filter.city = $scope.listCity.slice();
                    $scope.addColor(img.colors);
                    return img;
                });
                $scope.listTags = $scope.listTags.sort();
                $scope.listColors = $scope.listColors.sort().reverse();
            })
            // show filter
        $scope.collapseFilter = function(target) {
                _.each($scope.showFilter, function(value, key) {
                    if (key == target) {
                        $scope.showFilter[key] = !$scope.showFilter[key];
                    } else {
                        $scope.showFilter[key] = false;
                    }
                });
                $('html, body').animate({
                    scrollTop: $("#horizontalTab").offset().top
                }, 500);
            }
            // album controller
        $scope.checkAllAlbum = function() {
                if ($scope.allAlbum) {
                    $scope.filter.album = $scope.listAlbum.map(function(item) {
                        return item.id;
                    });
                } else {
                    $scope.filter.album = [];
                }
            }
            // tag controller
        $scope.checkAllTags = function() {
            if ($scope.allTags) {
                $scope.filter.tags = $scope.listTags.slice();
            } else {
                $scope.filter.tags = [];
            }
        }
        $scope.filter_tags = function(tags) {
            if (_.intersection($scope.filter.tags, tags).length > 0) {
                return true;
            } else {
                // if ($scope.allTags && tags.length === 0) {
                //     return true;
                // }
                // return false;
                return $scope.allTags;
            }
        }
        $scope.addTags = function(tags) {
            tags.map(function(tag) {
                if ($scope.listTags.indexOf(tag) === -1) {
                    $scope.listTags.push(tag);
                }
            });
        }
        $scope.addColor = function(color) {
            if ($scope.listColors.indexOf(color) === -1) {
                $scope.listColors.push(color);
            }
        }
        $scope.filterColor = function(color) {
                $scope.filter.color = color;
                $scope.allColor = false;
            }
            // person controller
        $scope.checkAllPerson = function() {
            if ($scope.allPerson) {
                $scope.filter.person = $scope.listPerson.map(function(p) {
                    return p.id
                });
            } else {
                $scope.filter.person = [];
            }
        }
        $scope.filter_person = function(personid) {
                if (_.intersection($scope.filter.person, personid).length > 0) {
                    return true;
                } else {
                    // if ($scope.allPerson && personid.length === 0) {
                    //     return true;
                    // }
                    // return false;
                    return $scope.allPerson;
                }
            }
            // city controller
        $scope.checkAllCity = function() {
            if ($scope.allCity) {
                $scope.filter.city = $scope.listCity.slice();
            } else {
                $scope.filter.city = [];
            }
        }
        $scope.filter_city = function(cities) {
            if (_.intersection($scope.filter.city, cities).length > 0) {
                return true;
            } else {
                // if ($scope.allCity && cities.length === 0) {
                //     return true;
                // }
                // return false;
                return $scope.allCity;
            }
        }
        $scope.addCities = function(cities) {
            cities.map(function(city) {
                if ($scope.listCity.indexOf(city) === -1) {
                    $scope.listCity.push(city);
                }
            });
        }

        // edit
        $scope.detectImg;
        $scope.isDetecting = false;
        $scope.tagAvailable = [];
        $scope.alltagAvailable = [];
        $scope.cityAvailable = [];
        $scope.gpsObj = {}

        $scope.openImage = function(img) {
            $scope.isDetecting = false;
            $scope.detectImg = angular.copy(img);
            $scope.detectImg.color = '#' + $scope.detectImg.colors;
            // set value for detect form
            $scope.tagAvailable = $scope.detectImg.tags;
            $scope.alltagAvailable = $scope.detectImg.alltags;
            $scope.cityAvailable = $scope.detectImg.city;

            $scope.detectImg.persontags = [];
            $scope.detectImg.personid.forEach(function(pid) {
                $scope.listPerson.forEach(function(p) {
                    if (p.id == pid) {
                        $scope.detectImg.persontags.push(p.name);
                    }
                });
            });
            // $scope.plotRectangle($scope.detectImg.personobj);
        }
        $scope.detectImage = function() {
            $scope.isDetecting = true;

            var url = host + "/api/detect/";
            var imgObj = { filePath: $scope.detectImg.path };
            $http.post(url, imgObj).then(function(res) {
                // set img info
                $scope.detectImg.title = res.data.title;

                $scope.detectImg.tags = res.data.tags;
                $scope.tagAvailable = res.data.alltags;

                $scope.detectImg.alltags = res.data.alltags;
                $scope.alltagAvailable = res.data.alltags;

                $scope.cityAvailable = res.data.gps.cities;
                $scope.detectImg.city = res.data.gps.cities;
                $scope.detectImg.lon = res.data.gps.lon;
                $scope.detectImg.lat = res.data.gps.lat;

                $scope.detectImg.color = '#' + res.data.colors.accentColor;
                $scope.detectImg.colors = res.data.colors.accentColor;

                $scope.isDetecting = false;
            })
        }
        $scope.recognizeImage = function() {
            $scope.isDetecting = true;

            var url = host + "/api/detect/face";
            var imgObj = { 
                imgpath: $scope.detectImg.path
                , albumkey : albumkey
                , albumname : albumname
            };
            $http.post(url, imgObj).then(function(res) {
                var response = res.data;
                console.log(response);
                // set img info
                // $scope.detectImg.personid = res.data.personid;
                response.data.personid.forEach(function(pid) {
                    $scope.listPerson.forEach(function(p) {
                        if (p.id == pid) {
                            $scope.detectImg.persontags.push(p.name);
                        }
                    });
                });
                // $scope.detectImg.personobj = res.data.personobj;

                $scope.isDetecting = false;
            })
        }

        $scope.updateImg = function() {
            var imgid = $scope.detectImg.id;
            var url = host + '/api/images/' + imgid;
            $scope.detectImg.colors = $scope.detectImg.color.replace('#', '');
            $scope.detectImg.albumname = albumname;
            $scope.detectImg.albumkey = albumkey;
            $http.post(url, $scope.detectImg).then(function(res) {
                if( !res.data.error ){
                    for (var img = $scope.listImages.length - 1; img >= 0; img--) {
                        if ($scope.listImages[img].id === $scope.detectImg.id) {
                            $scope.listImages[img] = res.data.data ;

                            $scope.addTags($scope.listImages[img].tags);
                            $scope.listImages[img].tags.map(function(tag) {
                                if ($scope.filter.tags.indexOf(tag) === -1) {
                                    $scope.filter.tags.push(tag);
                                }
                            });
                            $scope.addCities($scope.listImages[img].city);
                            $scope.listImages[img].city.map(function(city) {
                                if ($scope.filter.city.indexOf(city) === -1) {
                                    $scope.filter.city.push(city);
                                }
                            });
                            $scope.addColor($scope.listImages[img].colors);
                            // person
                            for (var i = $scope.listImages[img].personid.length - 1; i >= 0; i--) {
                                var hasPerson = false;
                                $scope.listPerson.forEach(function(p){
                                    if(p.id == $scope.listImages[img].personid[i]){
                                        hasPerson = true;
                                    }
                                })
                                if(!hasPerson){
                                    $scope.listPerson.push({id:$scope.listImages[img].personid[i],name:$scope.listImages[img].persontags[i]})
                                    $scope.personAvailable.push( $scope.listImages[img].persontags[i].trim() );
                                }
                                if ($scope.filter.person.indexOf($scope.listImages[img].personid[i]) === -1) {
                                    $scope.filter.person.push($scope.listImages[img].personid[i]);
                                }
                            };
                        }
                    }
                }
            })
        }

        $scope.removeImg = function() {
            if (confirm("Do you want to remove this image ?")) {
                var imgid = $scope.detectImg.id;
                var url = host + '/api/images/' + imgid;
                $http.delete(url).then(function(res) {
                    if (res.Error) {
                        alert(res.Message);
                    } else {
                        $('#detectModal').modal("hide");
                        $scope.listImages = _.reject($scope.listImages, function(el) {
                            return el.id === imgid;
                        });
                    }
                })
            }
        }

    }
]);
