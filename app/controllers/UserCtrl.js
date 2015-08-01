//用户控制器
app.controller('UserCtrl', ['$scope', '$rootScope', '$state', 'LogoutService', function($scope, $rootScope, $state, LogoutService) {
	//判断用户是否登录以及性别
	var updateLoginState = function(){
		if(sessionStorage.getItem('uid')) {
			$scope.isLogined = true;
			$scope.username = sessionStorage.getItem('username');
			$scope.email = sessionStorage.getItem('email');
			if(sessionStorage.getItem('sex') == 'male') {
				$scope.sex = 'male';
			} 
			if(sessionStorage.getItem('sex') == 'female') {
				$scope.sex = 'female';
			}
		} else {
			$scope.isLogined = false;
			$scope.username = '';
			$scope.email = '';
			$scope.sex = '';
		}
	};
	

	//注销登录
	$scope.doLogout = function() {
		LogoutService.doLogout()
			.success(function() {
				sessionStorage.removeItem('username');
				sessionStorage.removeItem('sex');
				sessionStorage.removeItem('uid');
				$state.go('index');
			});
		
	};

	  updateLoginState();
        //监听路由跳转事件，跳转后自动更新登录状态
        $rootScope.$on('$stateChangeStart', function() {
            updateLoginState();
        })
	
}]);

//登录控制器
app.controller('LoginCtrl', ['$scope', '$state', 'LoginService', function($scope, $state, LoginService) {

	//登录动作函数
	$scope.doLogin = function() {

		//获取表单中的用户信息
		var data = {
			username: $scope.username,
			password: $scope.password
		};

		//调用登录服务
		LoginService.doLogin(data)
			.success(function(data, status){
				if(status === 200) {
					//如果登录成功,则进行会话存储
					sessionStorage.setItem('username', data.user.username);
					sessionStorage.setItem('uid', data.user._id);
					sessionStorage.setItem('sex', data.user.sex);
					sessionStorage.setItem('email', data.user.email);
					//路由状态跳转
					$state.go('index');
				}
			});
	};
}]);

//女生控制器
app.controller('FemaleCtrl', ['$scope', '$state', 'PutWishService', function($scope, $state, PutWishService) {

	if(sessionStorage.getItem('username')) {
		
		//女生许愿
		$scope.putwish = function() {
			
			//组装愿望数据包
			var data = {
				user: sessionStorage.getItem('uid'),
				username: sessionStorage.getItem('username'),
				wish: $scope.wish
			};
			console.log(data);

			PutWishService.putWish(data)
				.success(function(data, status) {
					if(status === 200) {
						alert('许愿成功');
						$state.go('index');
					}
				});

		};


	} else {
		$state.go('user.login');
	}
	
}]);

