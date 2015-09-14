var app = angular.module('gdutWishWall', ['ui.router','infinite-scroll']);

//配置路由规则
app.config(function($stateProvider, $urlRouterProvider) {
    //默认指向 index
    $urlRouterProvider.otherwise("/index");
    //配置状态路由
    $stateProvider
        .state('index', {
            url: '/index',
            templateUrl: "/views/Index/index.html",
            controller: 'IndexCtrl'
        })
        .state('user', {
            abstract: true,
            url: '/user',
            templateUrl: '/views/User/index.html',
        })
        .state('wish', {
            abstract: true,
            url: '/wish',
            templateUrl: '/views/Wish/index.html'
        })
        // .state('user.login', {
        //     url: '/login',
        //     templateUrl: '/views/User/login.html',
        //     controller: 'LoginCtrl'
        // })
        // .state('user.logout', {
        //     url: '/logout'
        // })
        .state('user.info', {
            url: '/info/:userId',
            templateUrl: '/views/User/userinfo.html',
            controller: 'UserInfoCtrl'
                // controller: 'UserInfoCtrl'
        })
        .state('user.writewish', {
            url: '/writewish',
            templateUrl: '/views/User/female/writewish.html',
            controller: 'UserCtrl'
        })
        .state('user.writeinfo', {
            url: '/writeinfo/:rewrite',
            templateUrl: '/views/User/female/writeinfo.html',
            controller: 'UserCtrl'
        })
        .state('wish.femalewish', {
            url: '/female/mywish',
            templateUrl: '/views/User/female/mywish.html',
            controller: 'FemaleWishCtrl'
        })
        .state('wish.changewish', {
            url: '/female/changewish/:wishId',
            templateUrl: '/views/User/female/changewish.html',
            controller: 'WishCtrl'
        })
        .state('wish.malewish', {
            url: '/male/mywish/:pickerId',
            templateUrl: '/views/User/male/mywish.html',
            controller: 'MaleWishCtrl'
        })
        .state('user.message', {
        	url: '/message',
        	templateUrl: '/views/User/message.html',
        	controller: 'MsgCtrl'
        })
        .state('user.contact', {
        	url: '/contact/:userId/:username',
        	templateUrl: '/views/User/contact.html',
        	controller: 'ContactCtrl'
        })
        .state('wish.detail', {
            url: '/detail/:wishId',
            templateUrl: '/views/Wish/detail.html',
            controller: 'WishCtrl'
        });

});

//配置url参数规则
app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);