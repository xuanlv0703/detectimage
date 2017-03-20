'use strict';

app.config(function($stateProvider, $urlRouterProvider, $transitionsProvider) {

    $transitionsProvider.onStart({
        to: function(state) {
            return state.requireAuthen;
        }
    }, function($transition$, $state, userService) {
        if (!userService.isLogin()) {
            return $state.go('login');
        }
      

    });

    $urlRouterProvider.otherwise('/');

    $stateProvider        
        .state('home', {
            url: '/',
            views: {
                'header@': {
                    templateUrl: '/app/shared/header.html',
                    controller: 'headerCtrl'
                },
                  'content@': {
                    templateUrl: '/app/components/gallery/gallery.html',
                    controller: 'galleryCtrl'
                },
                'upload@home': {
                    templateUrl: '/app/components/upload/upload.html',
                    controller: 'uploadCtrl'
                },
                'footer@': {
                    templateUrl: '/app/shared/footer.html',
                }
            },
            requireAuthen: true
        })      
        .state('login', {
            url: '/login',
            views: {
                'login@': {
                    templateUrl: '/app/components/login/login.html',
                    controller: 'loginCtrl'
                }
            },
            requireAuthen: false
        })
        .state('forgot', {
            url: '/forgot',
            views: {
                'forgot@': {
                    templateUrl: '/app/components/forgot/forgot.html',
                    controller: 'forgotCtrl'
                }
            },
            requireAuthen: false
        })
          .state('register', {
            url: '/register',
            views: {
                'register@': {
                    templateUrl: '/app/components/register/register.html',
                    controller: 'registerCtrl'
                }
            },
            requireAuthen: false
        })  
        .state('home.gallery', {
            url: 'gallery',
            views: {
                'content@': {
                    templateUrl: '/app/components/gallery/gallery.html',
                    controller: 'galleryCtrl'
                },
                'upload@home.gallery': {
                    templateUrl: '/app/components/upload/upload.html',
                    controller: 'uploadCtrl'
                }
            },
            requireAuthen: true
        })
             .state('home.profile', {
            url: 'profile',
            views: {
                'content@': {
                    templateUrl: '/app/components/profile/profile.html',
                    controller: 'profileCtrl'
                }
            },
            requireAuthen: true
        })  
             .state('admin', {
            url: '/admin',
            views: {
                'header@': {
                    templateUrl: '/app/shared/header.html',
                    controller: 'headerCtrl'
                },
                  'content@': {
                    templateUrl: '/app/components/admin/admin.html',
                    controller: 'adminCtrl'
                }
                ,
                'footer@': {
                    templateUrl: '/app/shared/footer.html',
                }
            },
            requireAuthen: true
        })   
        .state('admin.subscriptions', {
            url: '/subscriptions',
            views: {
                'content@': {
                    templateUrl: '/app/components/admin/subscriptions/subscriptions.html',
                    controller: 'subscriptionsCtrl'
                }
            },
            requireAuthen: true
        })   
                    
             .state('home.subscription', {
            url: 'subscription',
            views: {
                'content@': {
                    templateUrl: '/app/components/subscription/subscription.html',
                    controller: 'subscriptionCtrl'
                }
            },
            requireAuthen: true
        }) 
          .state('admin.users', {
            url: '/users',
            views: {
                'content@': {
                    templateUrl: '/app/components/admin/users/users.html',
                    controller: 'usersCtrl'
                }
            },
            requireAuthen: true
        })                  
    });
