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
		})
		.state('wish', {
			abstract: true,
			url: '/wish',
			templateUrl: '/views/Wish/index.html'
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
			url: '/info/:userId',
			templateUrl: '/views/User/userinfo.html',
			controller: 'UserInfoCtrl'
			// controller: 'UserInfoCtrl'
		})
		.state('user.putwish', {
			url: '/putwish',
			templateUrl: '/views/User/female/putwish.html',
			controller: 'FemaleCtrl'
		})
		.state('user.femalewish', {
			url: '/female/mywish',
			templateUrl: '/views/User/female/mywish.html',
			controller: 'FemaleWishCtrl'
		})
		.state('user.malewish', {
			url: '/male/mywish/:pickerId',
			templateUrl: '/views/User/male/mywish.html',
			controller: 'MaleWishCtrl'
		})
		.state('wish.detail', {
			url: '/detail/:wishId',
			templateUrl: '/views/Wish/detail.html',
			controller: 'WishCtrl'
		});
		
});







