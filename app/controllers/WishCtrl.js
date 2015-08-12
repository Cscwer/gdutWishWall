
//女生愿望控制器
app.controller('FemaleWishCtrl', ['$scope', '$state', 'GetFemaleWishService', function($scope, $state, GetFemaleWishService) {
    $scope.UnpickWishes = [];
    $scope.PickedWishes = [];
    //获取女生自己的愿望
    var data = {
        userId: sessionStorage.getItem('uid')
    };
    GetFemaleWishService.getWish(data)
        .success(function(data, status) {
            if (status === 200) {
                //筛选出已被领取和未被领取的愿望
                for (wish of data.wishes) {
                    if (wish.ispicked === 0) {
                        $scope.UnpickWishes.push(wish);
                    }
                    if (wish.ispicked === 1) {
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
            if (status === 200) {
                $scope.wishes = data.wishes;
            }
        })
}]);