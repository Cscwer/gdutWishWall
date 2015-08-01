/**************定义愿望控制器******************/

//愿望控制器
app.controller('WishCtrl', ['$scope', '$state', '$stateParams', 'FindWishService', 'PickWishService', function($scope, $state, $stateParams, FindWishService, PickWishService) {
	var data = {
		wishId: $stateParams.wishId
	};
	FindWishService.findWish(data)
		.success(function(data, status) {
			if(status === 200) {
				$scope.wish = data.wish;
			}
		});

	$scope.pickWish = function() {

		if(sessionStorage.getItem('username')) {
			if(sessionStorage.getItem('sex') === 'male') {
				var data = {
					wish: $scope.wish,
					wishPicker: sessionStorage.getItem('uid')
				};
				PickWishService.pickWish(data)
					.success(function(data, status) {
						if(status === 200) {
							alert('领取成功');
							$state.go('index');
						}
					});
			} else {
				alert('只有男生才能领取愿望!');
				$state.go('index');
			}
		} else {
			$state.go('user.login');
		}
	};
}]);

//女生愿望控制器
app.controller('FemaleWishCtrl', ['$scope', '$state', 'GetFemaleWishService', function($scope, $state, GetFemaleWishService) {
	$scope.UnpickWishes = [];
	$scope.PickedWishes = [];
	//获取女生自己的愿望
	var data = {
		user: sessionStorage.getItem('uid')
	};
	GetFemaleWishService.getWish(data)
		.success(function(data, status) {
			if(status === 200) {
				for(wish of data.wishes) {
					if(wish.ispicked == '0') {
						$scope.UnpickWishes.push(wish);
					}
					if(wish.ispicked == '1') {
						$scope.PickedWishes.push(wish);
					}
				}
			}
		});

}]);

//男生愿望控制器
app.controller('MaleWishCtrl', ['$scope', '$state', 'GetMaleWishService', function($scope, $state, GetMaleWishService) {
	var data = {
		pickerId: sessionStorage.getItem('uid')
	};
	GetMaleWishService.getWish(data)
		.success(function(data, status) {
			if(status === 200) {
				$scope.wishes = data.wishes;
			}
		})
}]);