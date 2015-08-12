//主页控制器
app.controller('IndexCtrl', ['$scope', 'GetUnpickedWish', function($scope, GetUnpickedWish) {
    GetUnpickedWish.getWishes()
        .success(function(data) {
            $scope.wishes = data.wishes;
        });
}]);