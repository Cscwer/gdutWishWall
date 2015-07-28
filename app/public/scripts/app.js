var app = angular.module('gdutWishWall', ['ui.router']);

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
			// controller: 'UserCtrl'
		})
		.state('user.login', {
			url: '/login',
			templateUrl: '/views/User/login.html',
			controller: 'LoginCtrl'
		})
		.state('user.logout', {
			url: '/logout'
		})
		.state('user.info', {
			url: '/info',
			templateUrl: '/views/User/userinfo.html',
			controller: 'UserCtrl'
		});
		
});

