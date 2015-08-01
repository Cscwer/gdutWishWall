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

//获取指定用户的信息
app.factory('GetUserInfoService', ['$http', function($http) {
	return {
		getUserInfo: function(data) {
			return $http({
				method: 'GET',
				url: '/getUserInfo?userId='+data.userId
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

//发布愿望
app.factory('PutWishService', ['$http', function($http) {
	return {
		putWish: function(data) {
			return $http({
				method: 'POST',
				url: '/putwish',
				data: data
			});
		}
	};
}]);

//查找指定愿望
app.factory('FindWishService', ['$http', function($http) {
	return {
		findWish: function(data) {
			return $http({
				method: 'GET',
				url: '/getwish?wishId='+data.wishId
			});
		}
	}
}]);

//男生领取愿望
app.factory('PickWishService', ['$http', function($http) {
	return {
		pickWish: function(data) {
			return $http({
				method: 'POST',
				url: '/pickwish',
				data: data
			});
		}
	};
}]);

//女生获取自己的愿望
app.factory('GetFemaleWishService', ['$http', function($http) {
	return {
		getWish: function(data) {
			return $http({
				method: 'GET',
				url: '/getfemalewish?userId='+data.userId,
				data: data
			});
		}
	};
}]);

//男生获取自己领取的愿望
app.factory('GetMaleWishService', ['$http', function($http) {
	return {
		getWish: function(data) {
			return $http({
				method: 'GET',
				url: '/getmalewish?pickerId='+data.pickerId
			});
		}
	};
}]);