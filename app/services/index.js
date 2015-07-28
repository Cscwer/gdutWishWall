/****************定义各种服务*****************/
var Host = 'localhost:18080'; 	//定义主机

//定义登录服务
app.factory('LoginService', ['$http', function($http) {
	return {
		doLogin: function(data) {
			return $http({
				method: 'POST',
				url: '/login',
				data: data
			});
		}
	};
}]);

//注销登录服务
app.factory('LogoutService', ['$http', function($http) {
	return {
		doLogout: function() {
			return $http({
				method: 'POST',
				url: '/logout'
			});
		}
	};
}]);

//获取所有未领取愿望
app.factory('GetUnpickedWish', ['$http', function($http) {
	return {
		getWishes: function() {
			return $http({
				method: 'GET',
				url: '/getUnpickedWish'
			});
		}
	};
}]);