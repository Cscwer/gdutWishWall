var app = angular.module('example', ['ash']);

app.controller('MainController', ['$scope', function($scope) {

  $scope.items = [];
  $scope.data = [];
  for (var i = 0; i < 200; i++) {
    $scope.data.push(i);
  }

  $scope.options = {
    limit: 20,
    data: $scope.data
  };

}]);
